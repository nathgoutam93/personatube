import dynamic, { noSSR } from "next/dynamic";
import { useRef, useEffect, useState, useCallback } from "react";
import { useUser } from "../context/userContext";
import {
  BaseDirectory,
  writeTextFile,
  writeBinaryFile,
  renameFile,
} from "@tauri-apps/api/fs";
const FaceMeshCanvas = dynamic(() => import("../components/faceMeshCanvas"), {
  ssr: false,
});
const Settings = dynamic(() => import("../components/settings"), {
  ssr: false,
});

import ImageSelect from "../components/imageSelect";
import imageToBase64 from "../utils/img2bin";
import bin2img from "../utils/bin2img";
import { Character } from "../types";
import {
  BsCameraVideo,
  BsCameraVideoOff,
  BsCloudArrowUp,
  BsEye,
  BsEyeSlash,
  BsGear,
  BsGrid3X3,
  BsPalette,
  BsPencil,
  BsPerson,
} from "react-icons/bs";
import { BiSave } from "react-icons/bi";
// import static image assets
import idleImage from "../assets/panda_cm_oe.png";
import idleBlinkImage from "../assets/panda_cm_ce.png";
import openImage from "../assets/panda_om_oe.png";
import openBlinkImage from "../assets/panda_om_ce.png";
import idleHint from "../assets/idle.gif";
import idleBlinkHint from "../assets/idleblink.gif";
import speakingHint from "../assets/speaking.gif";
import speakingBlinkHint from "../assets/speakingblink.gif";
import loadCharacters from "../utils/loadCharacters";
import CharactersModal from "../components/charactersModal";

const Home = () => {
  const { user } = useUser();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [trackFace, setTrackFace] = useState<boolean>(false);
  const [hideControls, setHideControls] = useState<boolean>(false);
  const [isDrawGrid, setDrawGrid] = useState<boolean>(true);
  const [currentBg, setCurrentBg] = useState<string>("#0000ff");
  const [showBgOptions, setShowBgOptions] = useState<boolean>(false);
  const [showCharacters, setShowCharacters] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<Character>(null);

  const renameRef = useRef<HTMLInputElement>(null);
  const [isRename, setRename] = useState<boolean>(false);

  const [images, setImages] = useState<{
    idle: string;
    idleblink: string;
    open: string;
    openblink: string;
  }>({
    idle: null,
    idleblink: null,
    open: null,
    openblink: null,
  });

  const [currentImg, setCurrentImg] = useState<HTMLImageElement>(null);

  const drawCurrentImg = useCallback(() => {
    if (canvasRef.current == null) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // draw Background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = currentBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw Grid
    if (isDrawGrid) {
      const step = 80;
      const left = 50 - step;
      const top = 50 - step;
      const right = canvas.width + step;
      const bottom = canvas.height + step;
      ctx.beginPath();
      for (let x = left; x <= right - step; x += step) {
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
      }
      for (let y = top; y <= bottom - step; y += step) {
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
      }
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    }

    // draw Image
    if (currentImg == null) return;
    ctx.drawImage(
      currentImg,
      canvas.width / 2 - currentImg.width / 2,
      canvas.height / 2 - currentImg.height / 2
    );
  }, [currentBg, isDrawGrid, currentImg]);

  const onStateChange = useCallback(
    (state: string) => {
      if (state === "idle") {
        currentImg.src = images.idle;
      } else if (state === "idle-blink") {
        currentImg.src = images.idleblink;
      } else if (state === "open") {
        currentImg.src = images.open;
      } else {
        currentImg.src = images.openblink;
      }
      drawCurrentImg();
    },
    [
      images.idle,
      images.idleblink,
      images.open,
      images.openblink,
      drawCurrentImg,
    ]
  );

  // Handle character, state, and Image changes.
  const handleIdleChange = useCallback(async (src: string) => {
    setImages((prev) => {
      return { ...prev, idle: src };
    });
    const img = new Image();
    img.onload = () => {
      setCurrentImg(img);
    };
    img.src = src;
  }, []);
  const handleIdleBlinkChange = useCallback(async (src: string) => {
    setImages((prev) => {
      return { ...prev, idleblink: src };
    });
  }, []);
  const handleOpenChange = useCallback(async (src: string) => {
    setImages((prev) => {
      return { ...prev, open: src };
    });
  }, []);
  const handleOpenBlinkChange = useCallback(async (src: string) => {
    setImages((prev) => {
      return { ...prev, openblink: src };
    });
  }, []);

  const toggleControls = () => {
    setHideControls((prev) => !prev);
    setDrawGrid(false);
    setShowBgOptions(false);
  };

  const handleNewCharacter = async () => {
    const name = `panda-${Date.now()}`;
    // convert image to binary
    const cm_oe = await imageToBase64(idleImage.src);
    const cm_ce = await imageToBase64(idleBlinkImage.src);
    const om_oe = await imageToBase64(openImage.src);
    const om_ce = await imageToBase64(openBlinkImage.src);

    // create new path
    const cm_oe_path = `data/assets/${name}_cm_oe.png`;
    const cm_ce_path = `data/assets/${name}_cm_ce.png`;
    const om_oe_path = `data/assets/${name}_om_oe.png`;
    const om_ce_path = `data/assets/${name}_om_ce.png`;

    // save binary to path
    await writeBinaryFile(cm_oe_path, cm_oe, { dir: BaseDirectory.App });
    await writeBinaryFile(cm_ce_path, cm_ce, { dir: BaseDirectory.App });
    await writeBinaryFile(om_oe_path, om_oe, { dir: BaseDirectory.App });
    await writeBinaryFile(om_ce_path, om_ce, { dir: BaseDirectory.App });

    // character json data
    const content: Character = {
      name: name,
      states: [
        {
          "cm-oe": cm_oe_path,
          "cm-ce": cm_ce_path,
          "om-oe": om_oe_path,
          "om-ce": om_ce_path,
        },
      ],
    };

    // save the json data
    await writeTextFile(
      {
        path: `data/characters/${name}.json`,
        contents: JSON.stringify(content),
      },
      { dir: BaseDirectory.App }
    );

    setCharacters((prev) => [content, ...prev]);
    setCurrentCharacter(content);
  };

  const handleRenameCharacter = async (name: string, character: Character) => {
    // old paths of assets
    const cm_oe_path = `data/assets/${character.name}_cm_oe.png`;
    const cm_ce_path = `data/assets/${character.name}_cm_ce.png`;
    const om_oe_path = `data/assets/${character.name}_om_oe.png`;
    const om_ce_path = `data/assets/${character.name}_om_ce.png`;

    // new paths of assets
    const new_cm_oe_path = `data/assets/${name}_cm_oe.png`;
    const new_cm_ce_path = `data/assets/${name}_cm_ce.png`;
    const new_om_oe_path = `data/assets/${name}_om_oe.png`;
    const new_om_ce_path = `data/assets/${name}_om_ce.png`;

    // rename the assets
    await renameFile(cm_oe_path, new_cm_oe_path, { dir: BaseDirectory.App });
    await renameFile(cm_ce_path, new_cm_ce_path, { dir: BaseDirectory.App });
    await renameFile(om_oe_path, new_om_oe_path, { dir: BaseDirectory.App });
    await renameFile(om_ce_path, new_om_ce_path, { dir: BaseDirectory.App });

    // old character json path
    const character_path = `data/characters/${character.name}.json`;

    // modify old assets path with new assets paths
    const content: Character = {
      name: name,
      states: [
        {
          "cm-oe": new_cm_oe_path,
          "cm-ce": new_cm_ce_path,
          "om-oe": new_om_oe_path,
          "om-ce": new_om_ce_path,
        },
      ],
    };
    await writeTextFile(
      { path: character_path, contents: JSON.stringify(content) },
      { dir: BaseDirectory.App }
    );

    // new character json path
    const new_character_path = `data/characters/${name}.json`;
    // rename character json
    await renameFile(character_path, new_character_path, {
      dir: BaseDirectory.App,
    });

    const res = await loadCharacters();
    setCharacters([...res]);
    setCurrentCharacter(content);
  };

  const handleSaveCharacter = async (character: Character) => {
    // convert current images to binary
    const cm_oe = await imageToBase64(images.idle);
    const cm_ce = await imageToBase64(images.idleblink);
    const om_oe = await imageToBase64(images.open);
    const om_ce = await imageToBase64(images.openblink);

    // path to save the assets
    const cm_oe_path = `data/assets/${character.name}_cm_oe.png`;
    const cm_ce_path = `data/assets/${character.name}_cm_ce.png`;
    const om_oe_path = `data/assets/${character.name}_om_oe.png`;
    const om_ce_path = `data/assets/${character.name}_om_ce.png`;

    // save the assets
    await writeBinaryFile(cm_oe_path, cm_oe, { dir: BaseDirectory.App });
    await writeBinaryFile(cm_ce_path, cm_ce, { dir: BaseDirectory.App });
    await writeBinaryFile(om_oe_path, om_oe, { dir: BaseDirectory.App });
    await writeBinaryFile(om_ce_path, om_ce, { dir: BaseDirectory.App });

    // save the character json
    const content: Character = {
      name: `${character.name}`,
      states: [
        {
          "cm-oe": cm_oe_path,
          "cm-ce": cm_ce_path,
          "om-oe": om_oe_path,
          "om-ce": om_ce_path,
        },
      ],
    };
    await writeTextFile(
      {
        path: `data/characters/${character.name}.json`,
        contents: JSON.stringify(content),
      },
      { dir: BaseDirectory.App }
    );

    const res = await loadCharacters();
    setCharacters([...res]);
    setCurrentCharacter(content);
  };

  const handleChangeCharacter = useCallback(
    async (character: Character) => {
      const idleImgSrc = await bin2img(character.states[0]["cm-oe"]);
      const idleBlinkImgSrc = await bin2img(character.states[0]["cm-ce"]);
      const openImgSrc = await bin2img(character.states[0]["om-oe"]);
      const openBlinkImgSrc = await bin2img(character.states[0]["om-ce"]);

      setImages({
        idle: idleImgSrc,
        idleblink: idleBlinkImgSrc,
        open: openImgSrc,
        openblink: openBlinkImgSrc,
      });

      const img = new Image();
      img.onload = () => {
        setCurrentImg(img);
      };
      img.src = idleImgSrc;

      drawCurrentImg();
    },
    [drawCurrentImg]
  );

  const handleBackup = async () => {
    if (user) {
      console.log(user);
    } else {
      console.log("not logged in");
    }
  };

  useEffect(() => {
    // Handle Canvas width and height on mount
    const canvasEle = canvasRef.current;
    canvasEle.width = canvasEle.parentElement.clientWidth;
    canvasEle.height = canvasEle.parentElement.clientHeight;
  }, []);

  useEffect(() => {
    // load all Characters locally saved
    (async function () {
      const res = await loadCharacters();
      setCharacters([...res]);
      if (res.length > 0) {
        setCurrentCharacter(res[0]);
      } else {
        handleNewCharacter();
      }
    })();
  }, []);

  useEffect(() => {
    // on character change, set new images
    if (currentCharacter == null) return;
    handleChangeCharacter(currentCharacter);
  }, [currentCharacter]);

  useEffect(() => {
    drawCurrentImg();
  }, [drawCurrentImg]);

  useEffect(() => {
    if (!isRename) return;

    const handleComplete = (e: KeyboardEvent) => {
      if (e.key == "Enter") {
        setRename(false);
        handleRenameCharacter(renameRef.current.value, currentCharacter);
      }
    };

    document.addEventListener("keydown", handleComplete);

    renameRef.current.value = currentCharacter.name;
    renameRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleComplete);
    };
  }, [isRename]);

  // window resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvasEle = canvasRef.current;
      canvasEle.width = canvasEle.parentElement.clientWidth;
      canvasEle.height = canvasEle.parentElement.clientHeight;
      drawCurrentImg();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [drawCurrentImg]);

  return (
    <main className="relative w-full h-full mt-10">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {showCharacters && (
        <CharactersModal
          characters={characters}
          onClose={() => setShowCharacters(false)}
          onSelect={(character) => setCurrentCharacter(character)}
          onNewCharacter={handleNewCharacter}
        />
      )}

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      <div
        className={`absolute top-10 left-10 flex justify-center items-center gap-2 ${
          hideControls && "opacity-0 hover:opacity-100"
        } transition-opacity duration-300`}
      >
        <button className="btn-rounded" onClick={() => setShowCharacters(true)}>
          <BsPerson className="text-gray-700" size={24} />
        </button>
        {isRename ? (
          <div className="space-y-1">
            <input
              ref={renameRef}
              className="text-xl font-Righteous outline-none bg-transparent border-b"
            />
            <div className="flex gap-1">
              <button
                className="py-1 px-2 text-xl text-black font-Righteous bg-white rounded-lg cursor-pointer"
                onClick={() => {
                  setRename(false);
                  handleRenameCharacter(
                    renameRef.current.value,
                    currentCharacter
                  );
                }}
              >
                Save
              </button>
              <button
                className="py-1 px-2 text-xl text-black font-Righteous bg-white rounded-lg cursor-pointer"
                onClick={() => {
                  setRename(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          currentCharacter && (
            <>
              <span className="text-xl font-Righteous">
                {currentCharacter?.name}
              </span>
              <BsPencil
                className="cursor-pointer"
                onClick={() => {
                  setRename(true);
                }}
                size={24}
              />
            </>
          )
        )}
      </div>

      {currentCharacter && (
        <div
          className={`absolute bottom-20 left-10 flex justify-center items-center gap-1 ${
            hideControls && "opacity-0 hover:opacity-100"
          } transition-opacity duration-300`}
        >
          <button
            className="btn-rounded"
            onClick={() => handleSaveCharacter(currentCharacter)}
          >
            <BiSave className="text-gray-700" size={24} />
          </button>
          <button className="btn-rounded" onClick={handleBackup}>
            <BsCloudArrowUp className="text-gray-700" size={24} />
          </button>
          <label className="text-xl text-white font-Righteous">Backup</label>
        </div>
      )}

      <div
        className={`absolute top-10 left-1/2 -translate-x-1/2 flex gap-2 ${
          hideControls && "opacity-0 hover:opacity-100"
        } transition-opacity duration-300 select-none`}
      >
        {images.idle && (
          <ImageSelect
            preview={images.idle}
            hint={idleHint.src}
            onChange={handleIdleChange}
          />
        )}
        {images.idleblink && (
          <ImageSelect
            preview={images.idleblink}
            hint={idleBlinkHint.src}
            onChange={handleIdleBlinkChange}
          />
        )}
        {images.open && (
          <ImageSelect
            preview={images.open}
            hint={speakingHint.src}
            onChange={handleOpenChange}
          />
        )}
        {images.openblink && (
          <ImageSelect
            preview={images.openblink}
            hint={speakingBlinkHint.src}
            onChange={handleOpenBlinkChange}
          />
        )}
      </div>

      <div
        className={`absolute top-10 right-10 flex flex-col gap-1 ${
          hideControls && "opacity-0 hover:opacity-100"
        } transition-opacity duration-300`}
      >
        <button className="btn-rounded" onClick={() => setShowSettings(true)}>
          <BsGear className="text-gray-700" size={24} />
        </button>
        <button className="btn-rounded" onClick={toggleControls}>
          {hideControls ? (
            <BsEyeSlash className="text-gray-700" size={24} />
          ) : (
            <BsEye className="text-gray-700" size={24} />
          )}
        </button>
      </div>

      {/* controls */}
      <div
        className={`absolute bottom-20 right-10 flex flex-col justify-center items-center gap-1 ${
          hideControls && "opacity-0 pointer-events-none"
        } transition-opacity duration-300`}
      >
        <button
          className="btn-rounded"
          onClick={() => setDrawGrid((prev) => !prev)}
        >
          <BsGrid3X3 className="text-gray-700" size={24} />
        </button>
        <div className="relative">
          <button
            className="btn-rounded"
            onClick={() => setShowBgOptions((prev) => !prev)}
          >
            <BsPalette className="text-gray-700" size={24} />
          </button>
          <button
            className={`absolute bottom-0 right-0 w-12 h-12 p-2 opacity-0 pointer-events-none ${
              showBgOptions &&
              "bottom-0 right-16 opacity-100 pointer-events-auto"
            } border-2 border-white bg-green rounded-3xl cursor-pointer hover:rounded-2xl transition-all duration-300 delay-150`}
            onClick={() => setCurrentBg("#00ff00")}
          ></button>
          <button
            className={`absolute bottom-0 right-0 w-12 h-12 p-2 opacity-0 pointer-events-none ${
              showBgOptions &&
              "bottom-0 right-32 opacity-100 pointer-events-auto"
            } border-2 border-white bg-blue rounded-3xl cursor-pointer hover:rounded-2xl transition-all duration-300 delay-75`}
            onClick={() => {
              setCurrentBg("#0000ff");
            }}
          ></button>
          <button
            className={`absolute bottom-0 right-0 w-12 h-12 p-2 opacity-0 pointer-events-none ${
              showBgOptions &&
              "bottom-0 right-48 opacity-100 pointer-events-auto"
            } border-2 border-white bg-magenta rounded-3xl cursor-pointer hover:rounded-2xl transition-all duration-300`}
            onClick={() => {
              setCurrentBg("#ff00ff");
            }}
          ></button>
        </div>

        <button
          className={`p-6 flex justify-center items-center bg-white rounded-3xl cursor-pointer opacity-80 hover:opacity-100 hover:rounded-2xl transition-all duration-300 disabled:pointer-events-none`}
          onClick={() => {
            setTrackFace((prev) => !prev);
            const img = new Image();
            img.onload = () => {
              setCurrentImg(img);
            };
            img.src = images.idle;
          }}
          disabled={!Boolean(currentCharacter)}
        >
          {trackFace ? (
            <BsCameraVideoOff className="text-gray-700" size={32} />
          ) : (
            <BsCameraVideo className="text-gray-700" size={32} />
          )}
        </button>
      </div>

      {trackFace && <FaceMeshCanvas onStateChange={onStateChange} />}
    </main>
  );
};

export default Home;

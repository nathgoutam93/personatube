import { useRef, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("../components/header"), {
  ssr: false,
});
const FaceMeshCanvas = dynamic(() => import("../components/faceMeshCanvas"), {
  ssr: false,
});
import {
  BsCameraVideo,
  BsCameraVideoOff,
  BsEye,
  BsEyeSlash,
  BsGear,
  BsGrid3X3,
  BsPalette,
  BsPerson,
} from "react-icons/bs";
import idleImage from "../assets/closemouth-openeye.png";
import idleBlinkImage from "../assets/closemouth-closeeye.png";
import openImage from "../assets/openmouth-openeye.png";
import openBlinkImage from "../assets/openmouth-closeeye.png";

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [trackFace, setTrackFace] = useState<boolean>(false);
  const [images, setImages] = useState({
    idle: null,
    idleblink: null,
    open: null,
    openblink: null,
  });
  const [isDrawGrid, setDrawGrid] = useState<boolean>(true);
  const [currentBg, setCurrentBg] = useState<string>("#0000ff");
  const [currentImg, setCurrentImg] = useState<HTMLImageElement>(null);
  const [showBgOptions, setShowBgOptions] = useState<boolean>(false);
  const [hideControls, setHideControls] = useState<boolean>(false);

  const drawGrid = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (!isDrawGrid) return;

      let step = 80;
      let left = 50 - step;
      let top = 50 - step;
      let right = canvas.width + step;
      let bottom = canvas.height + step;
      const ctx = canvas.getContext("2d");
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
    },
    [isDrawGrid]
  );

  const drawBackground = useCallback(
    (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = currentBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    [currentBg]
  );

  const drawCurrentState = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (currentImg == null) return;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        currentImg,
        canvas.width / 2 - currentImg.width / 2,
        canvas.height / 2 - currentImg.height / 2
      );
    },
    [currentImg]
  );

  useEffect(() => {
    drawBackground(canvasRef.current);
    drawGrid(canvasRef.current);
    drawCurrentState(canvasRef.current);
  }, [currentImg, currentBg, isDrawGrid]);

  useEffect(() => {
    const canvasEle = canvasRef.current;
    canvasEle.width = canvasEle.parentElement.clientWidth;
    canvasEle.height = canvasEle.parentElement.clientHeight;

    const idleImg = new Image();
    idleImg.src = idleImage.src;
    idleImg.onload = () => {
      setCurrentImg(idleImg);
      setImages((prev) => {
        return { ...prev, idle: idleImg };
      });
    };

    const idleBlinkImg = new Image();
    idleBlinkImg.src = idleBlinkImage.src;
    idleBlinkImg.onload = () => {
      setImages((prev) => {
        return { ...prev, idleblink: idleBlinkImg };
      });
    };

    const openImg = new Image();
    openImg.src = openImage.src;
    openImg.onload = () => {
      setImages((prev) => {
        return { ...prev, open: openImg };
      });
    };

    const openBlinkImg = new Image();
    openBlinkImg.src = openBlinkImage.src;
    openBlinkImg.onload = () => {
      setImages((prev) => {
        return { ...prev, openblink: openBlinkImg };
      });
    };
  }, []);

  const toggleControls = () => {
    setHideControls((prev) => !prev);
    setDrawGrid(false);
    setShowBgOptions(false);
  };

  const toggleTracking = () => {
    setTrackFace((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      const canvasEle = canvasRef.current;
      canvasEle.width = canvasEle.parentElement.clientWidth;
      canvasEle.height = canvasEle.parentElement.clientHeight;
      drawBackground(canvasEle);
      drawGrid(canvasEle);
      drawCurrentState(canvasEle);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [drawCurrentState, drawBackground, drawGrid]);

  const onStateChange = useCallback(
    (state: string) => {
      if (state === "idle") {
        setCurrentImg(images.idle);
      } else if (state === "idle-blink") {
        setCurrentImg(images.idleblink);
      } else if (state === "open") {
        setCurrentImg(images.open);
      } else {
        setCurrentImg(images.openblink);
      }
    },
    [images.idle, images.open, images.idleblink, images.openblink]
  );

  return (
    <>
      {/* window region */}
      <Header />

      <main className="relative w-full h-full mt-10">
        <canvas ref={canvasRef} className="absolute inset-0" />

        <div
          className={`absolute top-10 right-10 flex flex-col gap-1 ${
            hideControls && "opacity-0 hover:opacity-100"
          } transition-opacity duration-300`}
        >
          <button className="p-4 flex justify-center items-center bg-white rounded-3xl cursor-pointer opacity-80 hover:opacity-100 hover:rounded-2xl transition-all duration-300">
            <BsGear className="text-gray-700" size={24} />
          </button>
          <button
            className={`p-4 flex justify-center items-center bg-white rounded-3xl cursor-pointer opacity-80 hover:opacity-100 hover:rounded-2xl transition-all duration-300`}
            onClick={toggleControls}
          >
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
            className="p-4 flex justify-center items-center bg-white rounded-3xl cursor-pointer opacity-80 hover:opacity-100 hover:rounded-2xl transition-all duration-300"
            onClick={() => setDrawGrid((prev) => !prev)}
          >
            <BsGrid3X3 className="text-gray-700" size={24} />
          </button>
          <div className="relative">
            <button
              className="p-4 flex justify-center items-center bg-white rounded-3xl cursor-pointer opacity-80 hover:opacity-100 hover:rounded-2xl transition-all duration-300"
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
          <button className="p-4 flex justify-center items-center bg-white rounded-3xl cursor-pointer opacity-80 hover:opacity-100 hover:rounded-2xl transition-all duration-300">
            <BsPerson className="text-gray-700" size={24} />
          </button>
          <button
            className="p-6 flex justify-center items-center bg-white rounded-3xl cursor-pointer opacity-80 hover:opacity-100 hover:rounded-2xl transition-all duration-300"
            onClick={toggleTracking}
          >
            {trackFace ? (
              <BsCameraVideoOff className="text-gray-700" size={32} />
            ) : (
              <BsCameraVideo className="text-gray-700" size={32} />
            )}
          </button>
        </div>

        {trackFace && (
          <FaceMeshCanvas
            className="absolute bottom-20 left-2 w-40 h-40 bg-black rounded-3xl overflow-hidden"
            onStateChange={onStateChange}
          />
        )}
      </main>
    </>
  );
};

export default Home;

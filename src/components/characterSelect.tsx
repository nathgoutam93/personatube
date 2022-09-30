import React, { useEffect, useState } from "react";
import { Character } from "../types";
import bin2img from "../utils/bin2img";

type Props = {
  character: Character;
  onSelect: (character: Character) => void;
};

function characterSelect({ character, onSelect }: Props) {
  const [imgSrc, setImgSrc] = useState<string>(null);

  useEffect(() => {
    bin2img(character.states[0]["cm-oe"]).then((src) => {
      setImgSrc(src);
    });
  }, []);

  return (
    <button
      className="relative w-40 h-40 rounded-3xl border bg-pastel-blue cursor-pointer"
      onClick={() => onSelect(character)}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          className="w-full h-full rounded-3xl object-cover"
          alt=""
        />
      )}
    </button>
  );
}

export default characterSelect;

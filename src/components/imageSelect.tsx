import React, { useState, useRef, useEffect, ChangeEventHandler } from "react";

function ImageSelect({
  preview,
  hint,
  onChange,
}: {
  preview: string;
  hint: string;
  onChange: (imgSrc: string) => void;
}) {
  const filePicker = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>(null);
  const [previewImg, setPreviewImg] = useState<string>("");
  const [hintImg, setHintImg] = useState<string>("");

  const handleClick = () => {
    filePicker.current.click();
  };

  const handleFile: ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();

    if (event.target.files && event.target.files.length) {
      setFile(event.target.files[0]);
    }
  };

  useEffect(() => {
    setPreviewImg(preview);
  }, [preview]);

  useEffect(() => {
    setHintImg(hint);
  }, [hint]);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        setPreviewImg(e.target.result as string);
      };

      reader.readAsDataURL(file);
    }
  }, [file]);

  useEffect(() => {
    onChange(previewImg);
  }, [previewImg, onChange]);

  return (
    <div
      className="relative h-24 w-24 lg:h-32 lg:w-32 rounded-3xl border bg-pastel-blue cursor-pointer"
      onClick={handleClick}
    >
      <img
        src={previewImg}
        className="w-full h-full rounded-3xl object-cover"
        alt=""
      />
      <input
        className="hidden"
        aria-label="profile pic"
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleFile}
        ref={filePicker}
      />
      <img
        src={hintImg}
        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full object-cover"
        alt=""
      />
    </div>
  );
}

export default ImageSelect;

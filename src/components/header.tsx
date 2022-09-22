import { appWindow } from "@tauri-apps/api/window";
import Image from "next/image";
import { BsFillCircleFill } from "react-icons/bs";
import logo from "../assets/logo.png";

function Header() {
  return (
    <header data-tauri-drag-region className="titlebar">
      <div className="flex">
        <Image alt="logo" src={logo.src} width={40} height={40} />
        <h1 className={`font-Righteous text-white text-4xl`}>PersonaTube</h1>
      </div>
      <div className="flex justify-center items-center gap-1">
        <button
          className="titlebar-button"
          onClick={() => appWindow.minimize()}
        >
          <BsFillCircleFill className="text-pastel-yellow" size={24} />
        </button>
        <button
          className="titlebar-button"
          onClick={() => appWindow.toggleMaximize()}
        >
          <BsFillCircleFill className="text-pastel-green" size={24} />
        </button>
        <button className="titlebar-button" onClick={() => appWindow.close()}>
          <BsFillCircleFill className="text-pastel-red" size={24} />
        </button>
      </div>
    </header>
  );
}

export default Header;

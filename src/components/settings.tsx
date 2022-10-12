import Link from "next/link";
import React from "react";
import { BsPerson } from "react-icons/bs";
import { useUser } from "../context/userContext";

type Props = {
  onClose: () => void;
};

function Settings({ onClose }: Props) {
  const { user, signout } = useUser();

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-40"
      onClick={() => onClose()}
    >
      <div
        className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 h-40 p-8 flex bg-white rounded-3xl`}
      >
        <div className="w-full h-max flex justify-center items-center gap-2">
          <BsPerson className="text-gray-700" size={32} />
          <span className="text-xl text-gray-700 font-Righteous">
            {user?.username ?? "not logged in"}
          </span>
          {user ? (
            <button
              className="px-2 text-gray-700 font-Righteous bg-transparent rounded-3xl border border-gray-500 hover:text-red-600 cursor-pointer"
              onClick={() => signout()}
            >
              Sign out
            </button>
          ) : (
            <span className="px-2 text-gray-700 font-Righteous bg-transparent rounded-3xl border border-gray-500 cursor-pointer">
              <Link href={"/signin"}>Sign in</Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;

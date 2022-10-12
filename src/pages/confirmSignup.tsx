import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useUser } from "../context/userContext";

export default function confirmSignUp() {
  const { confirmSignUp, user } = useUser();

  const [username, setUsername] = useState<string>(user?.username);
  const [code, setCode] = useState<string>("");

  const [error, setError] = useState<string>("");
  const isInvalid: boolean = code === "" || username === "";

  const [loading, setLoading] = useState<boolean>(false);

  const handleConfirmation = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);
      await confirmSignUp(username, code);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setCode("");
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-2 flex flex-col justify-center items-center bg-pastel-blue">
      <span className="text-2xl">Confirm Sign Up</span>
      <div className="mt-4 p-4 rounded-lg text-left bg-white">
        {error && <span className="mb-4 text-xs text-red-600">{error}</span>}
        <span className="w-full text-center text-gray-700">
          A confirmation code has been sent to your email
        </span>
        <form className="px-8 py-6" method="Post" onSubmit={handleConfirmation}>
          <label className="text-gray-700 label block font-semibold">
            Username
          </label>
          <input
            type="text"
            className="w-full h-5 mt-2 px-3 py-5 border rounded-md 
            focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="username"
            onChange={({ target }) => setUsername(target.value)}
            value={username}
          />

          <label className="text-gray-700 label mt-3 block font-semibold">
            Code
          </label>
          <input
            type="text"
            className="w-full h-5 mt-2 px-3 py-5 border rounded-md 
            focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="Code"
            onChange={({ target }) => setCode(target.value)}
            value={code}
          />
          <div className="flex items-center mt-4">
            <button
              disabled={isInvalid || loading}
              type="submit"
              className="w-full px-4 py-2 flex justify-center items-center bg-blue rounded-md cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <AiOutlineLoading3Quarters
                  className="text-white animate-spin"
                  size={24}
                />
              ) : (
                <span className="text-white font-bold">Confirm</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

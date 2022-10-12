import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useUser } from "../context/userContext";

export default function Signin() {
  const router = useRouter();
  const { signin } = useUser();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string>("");
  const isInvalid: boolean = password === "" || username === "";

  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);
      await signin(username, password);
      setLoading(false);
      router.push("/");
    } catch (error) {
      setError(error.message);
      setPassword("");
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-2 flex flex-col justify-center items-center bg-pastel-blue">
      <span className="text-2xl">Login to your account</span>
      <div className="mt-4 w-80 rounded-lg text-left bg-white">
        {error && (
          <p className="w-full text-center text-sm text-red-600">{error}</p>
        )}
        <form className="px-8 py-6" method="Post" onSubmit={handleLogin}>
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
            Password
          </label>
          <input
            type="password"
            className="w-full h-5 mt-2 px-3 py-5 border rounded-md 
            focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="Password"
            onChange={({ target }) => setPassword(target.value)}
            value={password}
          />
          <div className="flex items-center mt-4">
            <button
              disabled={isInvalid || loading}
              type="submit"
              className="px-4 py-2 flex justify-center items-center bg-blue rounded-md cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <AiOutlineLoading3Quarters
                  className="text-white animate-spin"
                  size={24}
                />
              ) : (
                <span className="text-white font-bold">Sign In</span>
              )}
            </button>
            <span className="mx-3 text-sm text-gray-700 hover:underline cursor-pointer">
              <Link href={"/forgot"}>Forgot password?</Link>
            </span>
          </div>
        </form>
        <div className="p-2 flex justify-center items-center">
          <p className="text-sm text-gray-700">
            Don't have an account?{" "}
            <Link href={"/signup"} className="font-bold text-gray-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

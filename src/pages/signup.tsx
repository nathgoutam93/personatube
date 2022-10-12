import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useUser } from "../context/userContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function SignUp() {
  const { signup } = useUser();
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirm] = useState<string>("");

  const [error, setError] = useState<string>("");
  const isInvalid: boolean = username === "" || password === "" || email === "";
  const passwordConfirmed: boolean = password === passwordConfirmation;
  const [loading, setLoading] = useState<boolean>();

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (passwordConfirmed) {
      try {
        setError("");
        setLoading(true);
        await signup(username, password, email);
        setLoading(false);
        router.push("/confirmSignup");
      } catch (error) {
        setPassword("");
        setPasswordConfirm("");
        setError(error.message);
        setLoading(false);
      }
    } else {
      setError("Password do not match");
    }
  };

  return (
    <div className="w-full h-full p-2 flex flex-col justify-center items-center bg-pastel-blue">
      <span className="text-2xl text-white">Create new account</span>
      <div className="mt-4 w-80 rounded-lg text-left bg-white">
        {error && (
          <p className="w-full text-center text-xs text-red-600">{error}</p>
        )}
        <form className="px-8 py-6" method="Post" onSubmit={handleSignUp}>
          <label className="label text-gray-700 block font-semibold">
            Username
          </label>
          <input
            type="text"
            className="w-full h-5 mt-2 px-3 py-5 border rounded-md 
            focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="Username"
            onChange={({ target }) => setUsername(target.value)}
            value={username}
          />

          <label className="label text-gray-700 block font-semibold">
            Email
          </label>
          <input
            type="email"
            className="w-full h-5 mt-2 px-3 py-5 border rounded-md 
            focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="Email"
            onChange={({ target }) => setEmail(target.value)}
            value={email}
          />

          <label className="label text-gray-700 mt-3 block font-semibold">
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
          <label className="label text-gray-700 mt-3 block font-semibold">
            Password Confirmation
          </label>
          <input
            type="password"
            className="w-full h-5 mt-2 px-3 py-5 border rounded-md 
            focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="Confirm Password"
            onChange={({ target }) => setPasswordConfirm(target.value)}
            value={passwordConfirmation}
          />
          <button
            disabled={isInvalid || loading}
            type="submit"
            className="w-full mt-4 px-4 py-2 flex justify-center items-center bg-blue rounded-md cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <AiOutlineLoading3Quarters
                className="text-white animate-spin"
                size={24}
              />
            ) : (
              <span className="text-white font-bold">Sign Up</span>
            )}
          </button>
        </form>
        <div className="p-2 flex justify-center items-center">
          <p className="text-sm text-gray-700">
            already have an account?{" "}
            <Link href={"/signin"} className="font-bold text-gray-700">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

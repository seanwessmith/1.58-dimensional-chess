"use client";

import { useState } from "react";

const Login = () => {
  const [username, setUsername] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(username);
  };

  return (
    <div className="pb-20">
      <h1 className="text-2xl pb-10 pt-10 text-center">
        1.58 Dimensional Chess
      </h1>
      <form>
        <div className="flex justify-center">
          <input
            onChange={(e) => setUsername(e.target.value)}
            className="pl-2"
            type="text"
            placeholder="username"
          />
          <button
            disabled={username.length < 4}
            onClick={handleLogin}
            className="disabled:cursor-not-allowed disabled:opacity-100 hover:opacity-50 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </button>
        </div>
        <div className="mt-5">
          <p className="text-xs">min 4 characters</p>
        </div>
      </form>
    </div>
  );
};

export default Login;

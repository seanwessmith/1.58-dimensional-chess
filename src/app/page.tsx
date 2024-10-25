"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient"; // Adjust the path as necessary

const Login = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const redirectUrl =
      process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
        ? "https://your-production-domain.com/auth/callback"
        : "http://localhost:3000/auth/callback";

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectUrl,
      },
    });

    setLoading(false);

    if (error) {
      console.error("Error sending magic link:", error);
      setMessage("Failed to send magic link. Please try again.");
    } else {
      console.log("Magic link sent:", data);
      setMessage("Check your email for the magic link!");
    }
  };

  return (
    <div className="pb-20">
      <h1 className="text-2xl pb-10 pt-10 text-center">
        1.58 Dimensional Chess
      </h1>
      <form onSubmit={handleLogin}>
        <div className="flex justify-center">
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="pl-2 mr-2 w-72"
            type="email" // Use type="email" for better validation
            placeholder="Enter your email"
            required
          />
          <button
            type="submit"
            disabled={email.length < 4 || loading}
            className="disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-75 text-white font-bold py-2 px-4 rounded bg-blue-500"
          >
            {loading ? "Sending..." : "Login"}
          </button>
        </div>
        <div className="flex justify-center pt-2">
          <p>{message}</p>
        </div>
      </form>
    </div>
  );
};

export default Login;

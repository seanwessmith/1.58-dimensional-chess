"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect } from "react";

const Callback = () => {
  const supabase = createClient(
    "https://1-58-dimensional-chess-6tae.vercel.app",
    "public-anon-key"
  );
  useEffect(() => {
    const asyncEffect = async () => {
      const lochash = location.hash.substring(1);
      const token_hash = lochash
        .substring(lochash.search(/(?<=^|&)access_token=/))
        .split("&")[0]
        .split("=")[1];
      console.log("token_hash", token_hash);
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: "email",
      });
      if (error) {
        console.log(error);
        window.alert(error.message);
      } else {
        window.history.pushState(null, "", "/");
      }
    };
    asyncEffect();
  }, []);
  return (
    <div>
      <h1>Callback</h1>
    </div>
  );
};

export default Callback;

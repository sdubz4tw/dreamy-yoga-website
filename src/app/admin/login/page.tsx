"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // Credentials states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl: "/admin",
      });

      if (result?.error) {
        setError("Invalid username or password credentials.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0807] flex items-center justify-center px-6 py-12 text-[#E5E0D8]">
      <div className="bg-[#161210] border border-[#8C7A6B]/20 rounded-3xl max-w-sm w-full p-8 flex flex-col gap-6 shadow-2xl text-left">

        {/* Header Branding */}
        <div className="text-center pb-2 border-b border-[#8C7A6B]/20">
          <h4 className="text-xl font-serif text-[#E5E0D8] font-normal tracking-wide">Yoga CMS Portal</h4>
          <p className="text-xs text-[#E5E0D8]/60 mt-1">
            Access your administration console.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Username or Email</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30 w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#E5E0D8]/80">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="px-4 py-3 bg-[#8C7A6B]/10 border border-[#8C7A6B]/40 focus:border-[#8C7A6B] focus:outline-none rounded-xl text-xs text-[#E5E0D8] tracking-wide placeholder-[#E5E0D8]/30 w-full"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-955/40 border-l-4 border-rose-500 text-rose-200 text-xs rounded font-normal border border-rose-500/20">
              <span className="font-bold block mb-0.5">Error</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 bg-[#8C7A6B] hover:bg-[#6B5D51] text-[#0B0807] text-xs font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer disabled:opacity-40"
          >
            {isSubmitting ? "Logging In..." : "Log In"}
          </button>
        </form>

        {/* Divider OR */}
        <div className="flex items-center justify-center my-1">
          <div className="flex-1 border-t border-[#8C7A6B]/20"></div>
          <span className="px-3 text-xs text-[#E5E0D8]/40 lowercase tracking-wider font-mono">or</span>
          <div className="flex-1 border-t border-[#8C7A6B]/20"></div>
        </div>

        {/* Google SSO Login */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="w-full flex items-center justify-center gap-3 py-2.5 bg-transparent hover:bg-[#8C7A6B]/10 text-[#E5E0D8] border border-[#8C7A6B]/30 hover:border-[#8C7A6B] text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer"
        >
          {/* Google G Logo SVG */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48c0,-0.61 -0.05,-1.2 -0.15,-1.78Z" fill="#4285F4" />
              <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.57c-0.9,0.6 -2.07,0.97 -3.3,0.97c-2.34,0 -4.33,-1.58 -5.04,-3.7H2.94v2.66c1.5,2.99 4.6,5.04 8.24,5.04Z" fill="#34A853" />
              <path d="M6.96,13.23c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.17H2.94C2.33,8.39 2,9.77 2,11.23c0,1.46 0.33,2.84 0.94,4.06l4.02,-3.06Z" fill="#FBBC05" />
              <path d="M12,4.8c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,2.15 14.42,1.3 12,1.3C8.36,1.3 5.26,3.35 3.76,6.34L6.96,9.4c0.71,-2.12 2.7,-3.7 5.04,-3.7Z" fill="#EA4335" />
            </g>
          </svg>
          Sign in with Google
        </button>

      </div>
    </div>
  );
}

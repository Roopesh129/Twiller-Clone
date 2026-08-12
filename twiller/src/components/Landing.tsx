"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import AuthModal from "./Authmodel";
import { useAuth } from "@/context/AuthContext";
import Feed from "./Feed";

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  const { user, googlesignin } = useAuth();

  if (user) {
    return <Feed />;
  }

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      await googlesignin();
    } catch (err: any) {
      console.error("Sign-In Error:", err);
    }
  };

  const handleContinue = () => {
    // Determine if it's a login or signup based on your logic, or default to login
    setAuthMode("login");
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row w-full font-sans antialiased selection:bg-primary/30 overflow-hidden">
      {/* Left side - Logo */}
      <div className="hidden lg:flex items-center justify-center w-[55%] h-screen relative select-none">
        <svg
          viewBox="0 0 24 24"
          className="text-foreground fill-current transition-transform duration-700 hover:scale-[1.02]"
          style={{ height: '50vh', maxHeight: '380px' }}
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>

      {/* Right side - Actions */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-4 lg:w-[45%] h-screen overflow-y-auto pt-10 lg:pt-0 pb-10 no-scrollbar">
        <div className="lg:hidden mb-12 flex justify-start select-none">
          <svg viewBox="0 0 24 24" className="text-foreground h-11 w-11 fill-current transition-transform duration-700 hover:scale-[1.05]">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        <div className="w-full max-w-[760px] mx-auto lg:mx-0">
          <h1 className="text-[40px] sm:text-[50px] lg:text-[64px] font-extrabold lg:leading-[84px] leading-tight mb-12 text-foreground" style={{ letterSpacing: '-1.2px' }}>
            Happening now
          </h1>
          <h2 className="text-[23px] sm:text-[31px] font-extrabold mb-8 text-foreground leading-9 tracking-tight">
            Join today.
          </h2>

          <div className="flex flex-col space-y-2 w-full sm:w-[300px]">
            <Button
              className="w-full py-0 rounded-full border border-border bg-background text-foreground hover:bg-muted hover:border-foreground/30 hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98] font-bold text-[15px] h-[40px] transition-all duration-300 ease-out flex items-center justify-center gap-2 cursor-pointer shadow-none"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Sign up with Google</span>
            </Button>

            <Button
              className="w-full py-0 rounded-full border border-border bg-background text-foreground hover:bg-muted hover:border-foreground/30 hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98] font-bold text-[15px] h-[40px] transition-all duration-300 ease-out flex items-center justify-center gap-2 cursor-pointer shadow-none"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-[18px] h-[18px] shrink-0 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span>Sign up with Apple</span>
            </Button>

            <div className="relative py-2 flex items-center justify-center">
              <div className="w-full border-t border-border absolute" />
              <div className="relative bg-background px-2 text-foreground text-[15px] pb-[2px]">or</div>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 hover:shadow-lg hover:-translate-y-[1px] active:scale-[0.98] text-primary-foreground font-bold py-0 rounded-full text-[15px] h-[40px] transition-all duration-300 ease-out cursor-pointer shadow-none"
              onClick={() => openAuthModal("signup")}
            >
              Create account
            </Button>

            <p className="text-[11px] text-muted-foreground leading-[13px] mt-2 mb-10">
              By signing up, you agree to the <a href="#" className="text-primary hover:underline font-semibold">Terms of Service</a> and <a href="#" className="text-primary hover:underline font-semibold">Privacy Policy</a>, including <a href="#" className="text-primary hover:underline font-semibold">Cookie Use</a>.
            </p>

            <div className="mt-[40px]">
              <p className="text-[17px] font-bold text-foreground mb-[15px]">Already have an account?</p>
              <Button
                className="w-full bg-transparent border border-border hover:bg-primary/10 hover:border-primary/50 hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98] text-primary font-bold py-0 rounded-full text-[15px] h-[40px] transition-all duration-300 ease-out cursor-pointer shadow-none"
                onClick={() => openAuthModal("login")}
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}
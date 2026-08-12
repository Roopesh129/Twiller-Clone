'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordStep from "./ForgotPasswordStep";
import { Loader2, AlertCircle, Clock, ShieldCheck, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: "login" | "signup";
  prefilledEmail?: string;
  initialShowOtp?: boolean;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode, 
  prefilledEmail = "", 
  initialShowOtp = false 
}: AuthModalProps) {
  // Extract auth actions from context (supporting verifyOtp if available)
  const authContext = useAuth();
  const { login, signup, isLoading } = authContext;
  const verifyOtp = (authContext as any).verifyOtp;
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">(initialMode);
  
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  
  const [showOtpScreen, setShowOtpScreen] = useState(initialShowOtp);
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobileCurfewBlock, setIsMobileCurfewBlock] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string | null>(null);

  // Sync state when props change dynamically
  useEffect(() => {
    if (isOpen) {
      if (prefilledEmail) setEmail(prefilledEmail);
      if (initialShowOtp) {
        setShowOtpScreen(true);
        setMode("login");
      }
    }
  }, [isOpen, prefilledEmail, initialShowOtp]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResendSuccessMessage(null);
    setIsMobileCurfewBlock(false);

    try {
      if (showOtpScreen) {
        // 1. Submit OTP Verification
        if (typeof verifyOtp === "function") {
          await verifyOtp(email, otp);
        } else {
          await login(email, "", otp);
        }
        onClose();
        resetFormState();
        return;
      }

      if (mode === "login") {
        // 2. Perform Login Request
        const response = await login(email, password);
        
        // Handle Google Chrome MFA Trigger
        if (response && response.requiresOtp) {
          setShowOtpScreen(true);
          return;
        }
        
        onClose();
        resetFormState();
      } else {
        // 3. Perform Signup Request
        await signup(email, password, username, displayName);
        onClose();
        resetFormState();
      }
    } catch (err: any) {
      const serverMessage = err?.response?.data?.error || err.message || "Authentication failed.";
      setErrorMessage(serverMessage);

      // Check if access is restricted by Mobile Curfew Rules
      const lowerMsg = serverMessage.toLowerCase();
      if (
        lowerMsg.includes("restricted") || 
        lowerMsg.includes("curfew") || 
        lowerMsg.includes("window") ||
        lowerMsg.includes("denied") ||
        lowerMsg.includes("10:00 am")
      ) {
        setIsMobileCurfewBlock(true);
      }
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage(null);
    setResendSuccessMessage(null);
    setIsResending(true);

    try {
      await login(email, password);
      setResendSuccessMessage("A fresh verification code was sent to your email.");
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || err.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  const resetFormState = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setDisplayName("");
    setOtp("");
    setShowOtpScreen(false);
    setErrorMessage(null);
    setResendSuccessMessage(null);
    setIsMobileCurfewBlock(false);
  };

  const switchMode = (newMode: "login" | "signup" | "forgot") => {
    if (newMode === "forgot") {
      onClose();
      router.push("/reset-password");
      return;
    }
    setMode(newMode);
    setShowOtpScreen(false);
    setErrorMessage(null);
    setResendSuccessMessage(null);
    setIsMobileCurfewBlock(false);
    setOtp("");
  };

  // The forgot mode now redirects to /reset-password, so this render block is effectively unused, but kept for type safety.
  if (mode === "forgot") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-muted/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-background text-foreground p-4 sm:p-8 rounded-2xl border border-border shadow-2xl relative transform scale-100 transition-all duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button 
          type="button"
          onClick={() => {
            onClose();
            resetFormState();
          }} 
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl font-bold p-1 rounded-full hover:bg-muted/50 transition-colors cursor-pointer"
        >
          &times;
        </button>

        <div className="flex flex-col items-start mb-6 w-full">
          <div className="w-full flex justify-center mb-6">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-foreground">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          {showOtpScreen && (
            <div className="w-full flex justify-center">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2 animate-bounce" />
            </div>
          )}
          <h2 className="text-3xl font-bold tracking-tight text-foreground text-left w-full mb-2">
            {showOtpScreen ? "MFA Verification" : mode === "login" ? "Sign in to X" : "Create your account"}
          </h2>
          {showOtpScreen && (
            <p className="text-xs text-muted-foreground mt-1 text-center">
              An OTP security code was sent to <strong>{email}</strong>.
            </p>
          )}
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className={`p-3 rounded-xl text-sm mb-4 flex items-start gap-2.5 border animate-in fade-in slide-in-from-top-2 duration-200 ${
            isMobileCurfewBlock 
              ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}>
            {isMobileCurfewBlock ? (
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span className="leading-normal font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Banner (Resend OTP) */}
        {resendSuccessMessage && (
          <div className="p-3 rounded-xl text-sm mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold animate-in fade-in duration-200">
            {resendSuccessMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {showOtpScreen ? (
            <div className="space-y-4">
              <input type="hidden" value={email} readOnly />
              <input type="hidden" value={password} readOnly />
              
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:border-emerald-500 text-center text-xl tracking-[0.4em] font-mono transition-colors"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                />
              </div>

              <div className="flex justify-end text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-muted-foreground hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer disabled:text-muted-foreground"
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                  {isResending ? "Resending..." : "Resend code"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {mode === "signup" && (
                <>
                  <div className="mb-4">
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      className="w-full bg-transparent border border-border rounded-md p-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <input
                      type="text"
                      required
                      placeholder="Username"
                      className="w-full bg-transparent border border-border rounded-md p-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="mb-4">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full bg-transparent border border-border rounded-md p-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full bg-transparent border border-border rounded-md p-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-bold py-3.5 rounded-full text-base transition-all duration-200 mt-6 disabled:bg-muted disabled:text-muted-foreground flex justify-center items-center gap-2 active:scale-[0.99] cursor-pointer ${
              showOtpScreen 
                ? "bg-emerald-600 text-foreground hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                : "bg-foreground text-background hover:opacity-90"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : showOtpScreen ? (
              "Confirm Verification"
            ) : mode === "login" ? (
              "Log In"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {!showOtpScreen && (
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground mt-6 text-center">
            {mode === "login" && (
              <button 
                type="button"
                onClick={() => switchMode("forgot")} 
                className="text-blue-400 hover:text-blue-300 hover:underline font-semibold text-xs tracking-wide cursor-pointer transition-colors"
              >
                Forgot credentials?
              </button>
            )}

            <div className="border-t border-border/80 w-full pt-3">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button type="button" onClick={() => switchMode("signup")} className="text-blue-400 hover:underline font-bold cursor-pointer">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchMode("login")} className="text-blue-400 hover:underline font-bold cursor-pointer">
                    Log in
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {showOtpScreen && (
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-muted-foreground pt-3 border-t border-zinc-900/50 mt-6 block cursor-pointer transition-colors"
          >
            Cancel security check
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertCircle, ShieldCheck, RefreshCw } from "lucide-react";

interface MfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function MfaModal({ isOpen, onClose, email }: MfaModalProps) {
  const { verifyOtp, login, isLoading } = useAuth();
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/\D/g, "");
    setOtp(cleanValue);
    if (errorMessage) setErrorMessage(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (otp.length < 6) {
      setErrorMessage("Please enter the complete 6-digit OTP code.");
      return;
    }

    try {
      // 1. Primary path: Use direct verifyOtp method if available
      let res;
      if (typeof verifyOtp === "function") {
        res = await verifyOtp(email, otp);
      } else {
        res = await login(email, "", otp);
      }

      if (res && (res.user || res.success)) {
        setOtp("");
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid or expired OTP code.");
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsResending(true);

    try {
      // Re-trigger login endpoint to send a fresh OTP email
      await login(email, "OAUTH_BYPASS_TEMPORARY_SECRET");
      setSuccessMessage("A fresh verification code was sent to your email.");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to dispatch a new OTP code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    setOtp("");
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-black text-white p-8 rounded-2xl border border-zinc-800 shadow-2xl relative">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-xl font-bold p-1 rounded-full hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          &times;
        </button>

        <div className="flex flex-col items-center mb-6">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mb-2 animate-bounce" />
          <h2 className="text-2xl font-bold tracking-tight text-white text-center">
            MFA Verification
          </h2>
          <p className="text-xs text-zinc-400 mt-2 text-center">
            An OTP security code was sent to{" "}
            <strong className="text-white">{email || "your email"}</strong>.
          </p>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl text-sm mb-4 flex items-start gap-2.5 border bg-red-500/10 border-red-500/30 text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-normal font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Success Message Alert (Resend) */}
        {successMessage && (
          <div className="p-3 rounded-xl text-sm mb-4 border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 text-center">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-emerald-500 text-center text-2xl tracking-[0.4em] font-mono transition-colors placeholder:text-zinc-700"
              value={otp}
              onChange={handleInputChange}
              placeholder="000000"
            />
          </div>

          <div className="flex justify-end text-xs">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending || isLoading}
              className="text-zinc-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer disabled:text-zinc-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
              {isResending ? "Resending..." : "Resend code"}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full font-bold py-3.5 rounded-full text-base transition-all duration-200 mt-6 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed bg-emerald-600 text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex justify-center items-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              "Confirm Verification"
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={handleClose}
          className="w-full text-center text-xs font-semibold text-zinc-500 hover:text-zinc-400 pt-4 border-t border-zinc-900 mt-6 block cursor-pointer transition-colors"
        >
          Cancel security check
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
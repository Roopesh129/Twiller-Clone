"use client";

import React, { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, Sparkles, KeyRound } from "lucide-react";

interface ForgotPasswordStepProps {
  onClose: () => void;
}

export default function ForgotPasswordStep({ onClose }: ForgotPasswordStepProps) {
  const [identity, setIdentity] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<"manual" | "auto" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const executeResetRequest = async (passwordOverride?: string) => {
    if (!identity.trim()) {
      setErrorMessage("Please enter your registered email or phone number first.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          identity: identity.trim(),
          manualPassword: passwordOverride || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process recovery sequence.");
      }

      setSuccessMessage(data.message);
      setIdentity("");
      setManualPassword("");
      setConfirmPassword("");
      
      setTimeout(() => {
        onClose();
      }, 3500);

    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected network execution error occurred.");
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage("Please complete both password fields to modify manually.");
      return;
    }

    if (manualPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify your entries.");
      return;
    }

    setActionType("manual");
    executeResetRequest(manualPassword.trim());
  };

  const handleAutoGenerateClick = () => {
    setActionType("auto");
    executeResetRequest();
  };

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
      <div className="w-full flex justify-center mb-6">
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-foreground">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-foreground text-left w-full mb-2">
        Reset password
      </h2>
      
      <p className="text-sm text-muted-foreground text-left w-full mb-6 leading-normal">
        Enter your details to manually change your password, or use the auto-generate button to have a secure random credentials set sent directly to your inbox.
      </p>

      {/* Operational Feedback Layers */}
      {errorMessage && (
        <div className="w-full bg-red-500/10 border border-red-500/30 text-red-500 p-3.5 rounded-xl text-sm mb-4 flex items-start gap-2.5 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-tight">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-sm mb-4 flex items-start gap-2.5 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-tight">{successMessage} Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="space-y-4 w-full">
        <div>
          <input
            type="text"
            required
            disabled={isLoading || !!successMessage}
            placeholder="Email or Phone Number"
            className="w-full bg-transparent border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md p-4 text-foreground focus:outline-none transition-all placeholder:text-muted-foreground font-medium text-[15px]"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-4">
          <div>
            <input
              type="password"
              disabled={isLoading || !!successMessage}
              placeholder="New Password"
              className="w-full bg-transparent border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md p-4 text-foreground focus:outline-none transition-all placeholder:text-muted-foreground font-medium text-[15px]"
              value={manualPassword}
              onChange={(e) => setManualPassword(e.target.value)}
            />
          </div>

          <div>
            <input
              type="password"
              disabled={isLoading || !!successMessage}
              placeholder="Confirm New Password"
              className="w-full bg-transparent border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md p-4 text-foreground focus:outline-none transition-all placeholder:text-muted-foreground font-medium text-[15px]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 space-y-3">
          {/* Action A: Unified Manual Change Button */}
          <button
            type="submit"
            disabled={isLoading || !!successMessage || !identity.trim() || !manualPassword.trim() || !confirmPassword.trim()}
            className="w-full bg-foreground text-background hover:opacity-90 font-bold py-3.5 rounded-full text-base transition-all duration-200 flex justify-center items-center gap-2 disabled:bg-muted disabled:text-muted-foreground cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading && actionType === "manual" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <KeyRound className="w-5 h-5" />
            )}
            Change Password
          </button>

          {/* Action B: Direct Utility Auto-Generation Alternative */}
          <button
            type="button"
            disabled={isLoading || !!successMessage || !identity.trim()}
            onClick={handleAutoGenerateClick}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-full text-base transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading && actionType === "auto" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            Auto-Generate & Email Password Instead
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full bg-transparent hover:bg-accent text-foreground py-3.5 rounded-full text-base font-bold transition-colors duration-200 border border-border cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
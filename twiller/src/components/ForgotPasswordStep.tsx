"use client";

import React, { useState } from "react";
import { Loader2, X, Twitter, AlertCircle, CheckCircle2 } from "lucide-react";

interface ForgotPasswordStepProps {
  onClose: () => void;
}

export default function ForgotPasswordStep({ onClose }: ForgotPasswordStepProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identity, setIdentity] = useState("");
  const [resetMethod, setResetMethod] = useState<"auto" | "manual">("auto");
  const [manualPassword, setManualPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const executeResetRequest = async (passwordOverride?: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
      const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      
      setTimeout(() => {
        onClose();
      }, 3500);

    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep1 = () => {
    if (!identity.trim()) return;
    setStep(2);
    setErrorMessage(null);
  };

  const handleNextStep2 = () => {
    if (resetMethod === "auto") {
      executeResetRequest();
    } else {
      setStep(3);
    }
  };

  const handleSubmitStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage("Please complete both password fields.");
      return;
    }
    if (manualPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    executeResetRequest(manualPassword.trim());
  };

  return (
    <div className="w-full text-white animate-in fade-in duration-200 min-h-[400px] flex flex-col relative bg-black">
      
      {/* Twitter Modal Header */}
      <div className="flex items-center justify-between pb-6">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-zinc-800/80 rounded-full transition-colors absolute -left-2 -top-2"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="w-full flex justify-center">
          <Twitter className="w-8 h-8 text-white fill-current" />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-1 sm:px-4 pb-8 pt-4">
        
        {/* Step 1: Find Account */}
        {step === 1 && (
          <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-[31px] leading-9 font-bold mb-3 text-white">Find your Twiller account</h2>
            <p className="text-[15px] text-[#71767b] mb-8 leading-normal">
              Enter the email, phone number, or username associated with your account to change your password.
            </p>

            <div className="relative group mb-auto">
              <input
                type="text"
                className="w-full bg-black border border-zinc-700 focus:border-[#1d9bf0] rounded-[4px] px-2 pt-6 pb-2 text-[17px] text-white focus:outline-none transition-colors peer focus:ring-1 focus:ring-[#1d9bf0]"
                placeholder=" "
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && identity.trim() && handleNextStep1()}
              />
              <label className="absolute left-2 top-4 text-[#71767b] text-[17px] transition-all peer-focus:top-1.5 peer-focus:text-[13px] peer-focus:text-[#1d9bf0] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[13px] pointer-events-none">
                Email, phone number, or username
              </label>
            </div>

            <button
              onClick={handleNextStep1}
              disabled={!identity.trim()}
              className="mt-8 w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-full text-[17px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Choose Method */}
        {step === 2 && (
          <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-[31px] leading-9 font-bold mb-6 text-white">How do you want to reset your password?</h2>
            
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md text-[15px] mb-6 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            
            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-md text-[15px] mb-6 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="space-y-4 mb-auto">
              <label className={`block border ${resetMethod === 'auto' ? 'border-[#1d9bf0]' : 'border-zinc-700'} rounded-[4px] p-4 cursor-pointer hover:bg-zinc-900/50 transition-colors`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <input 
                      type="radio" 
                      name="resetMethod" 
                      checked={resetMethod === 'auto'}
                      onChange={() => setResetMethod('auto')}
                      className="w-4 h-4 text-[#1d9bf0] focus:ring-[#1d9bf0] bg-black border-zinc-700 focus:ring-offset-black"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-[17px]">Auto-generate a secure password</div>
                    <div className="text-[15px] text-[#71767b] mt-1 leading-snug">We will generate a random alphabetical password and send it to your registered email or phone via SMS.</div>
                  </div>
                </div>
              </label>

              <label className={`block border ${resetMethod === 'manual' ? 'border-[#1d9bf0]' : 'border-zinc-700'} rounded-[4px] p-4 cursor-pointer hover:bg-zinc-900/50 transition-colors`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <input 
                      type="radio" 
                      name="resetMethod" 
                      checked={resetMethod === 'manual'}
                      onChange={() => setResetMethod('manual')}
                      className="w-4 h-4 text-[#1d9bf0] focus:ring-[#1d9bf0] bg-black border-zinc-700 focus:ring-offset-black"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-[17px]">Create a custom password manually</div>
                    <div className="text-[15px] text-[#71767b] mt-1 leading-snug">Choose a new password right now. Best if you want to set something easy to remember immediately.</div>
                  </div>
                </div>
              </label>
            </div>

            <button
              onClick={handleNextStep2}
              disabled={isLoading || !!successMessage}
              className="mt-8 w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-full text-[17px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Next"}
            </button>
          </div>
        )}

        {/* Step 3: Enter Manual Password */}
        {step === 3 && (
          <form onSubmit={handleSubmitStep3} className="flex-1 flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-[31px] leading-9 font-bold mb-3 text-white">Choose a new password</h2>
            <p className="text-[15px] text-[#71767b] mb-8 leading-normal">
              Make sure your new password is 8 characters or more. Try including numbers, letters, and punctuation marks for a strong password.
            </p>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md text-[15px] mb-6 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            
            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-md text-[15px] mb-6 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="space-y-6 mb-auto">
              <div className="relative group">
                <input
                  type="password"
                  disabled={isLoading || !!successMessage}
                  className="w-full bg-black border border-zinc-700 focus:border-[#1d9bf0] rounded-[4px] px-2 pt-6 pb-2 text-[17px] text-white focus:outline-none transition-colors peer focus:ring-1 focus:ring-[#1d9bf0]"
                  placeholder=" "
                  value={manualPassword}
                  onChange={(e) => setManualPassword(e.target.value)}
                />
                <label className="absolute left-2 top-4 text-[#71767b] text-[17px] transition-all peer-focus:top-1.5 peer-focus:text-[13px] peer-focus:text-[#1d9bf0] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[13px] pointer-events-none">
                  New password
                </label>
              </div>

              <div className="relative group">
                <input
                  type="password"
                  disabled={isLoading || !!successMessage}
                  className="w-full bg-black border border-zinc-700 focus:border-[#1d9bf0] rounded-[4px] px-2 pt-6 pb-2 text-[17px] text-white focus:outline-none transition-colors peer focus:ring-1 focus:ring-[#1d9bf0]"
                  placeholder=" "
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <label className="absolute left-2 top-4 text-[#71767b] text-[17px] transition-all peer-focus:top-1.5 peer-focus:text-[13px] peer-focus:text-[#1d9bf0] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[13px] pointer-events-none">
                  Confirm password
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !!successMessage || !manualPassword.trim() || !confirmPassword.trim()}
              className="mt-8 w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-full text-[17px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Change password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
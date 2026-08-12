"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowLeft, Smartphone, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, LanguageCode } from "@/context/LanguageContext";
import { Button } from "./ui/button";
import axiosInstance from "@/lib/axiosInstance";

interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "es", label: "Spanish", nativeName: "Español" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी" },
  { code: "pt", label: "Portuguese", nativeName: "Português" },
  { code: "zh", label: "Chinese", nativeName: "中文" },
  { code: "fr", label: "French", nativeName: "Français" },
];



export default function LanguageSelectorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [pendingLanguage, setPendingLanguage] = useState<LanguageCode | null>(null);
  const [step, setStep] = useState<"select" | "mobile_input" | "verify">("select");
  const [mobileNumber, setMobileNumber] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  if (!isOpen) return null;



  const handleSelectLanguage = (code: LanguageCode) => {
    if (code === language) {
      onClose();
      return;
    }

    setPendingLanguage(code);
    setError("");

    // RULE 1: French -> Email Verification
    if (code === "fr") {
      const userEmail = user?.email;
      if (!userEmail) {
        setError("No registered email address found for your account.");
        return;
      }
      sendOtpBackend(code, userEmail, "email");
    } 
    // RULE 2: All Other Languages -> SMS via Backend
    else {
      const existingMobile = (user as any)?.mobile || (user as any)?.phone;
      if (existingMobile) {
        setMobileNumber(existingMobile);
        sendOtpBackend(code, existingMobile, "sms");
      } else {
        setStep("mobile_input");
      }
    }
  };

  // --- Dispatch OTP via Backend Node Service ---
  const sendOtpBackend = async (code: LanguageCode, destination: string, type: "email" | "sms") => {
    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("/api/language/send-otp", {
        userId: user?._id,
        targetLanguage: code,
        type: type,
        destination: destination,
      });

      setInfoMessage(`A security code was sent to your ${type === "email" ? "email" : "mobile"} (${destination}).`);
      setStep("verify");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send email verification code.");
    } finally {
      setLoading(false);
    }
  };



  const handleMobileSubmit = () => {
    const cleanNumber = mobileNumber.trim();
    if (!cleanNumber || cleanNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (pendingLanguage) {
      sendOtpBackend(pendingLanguage, cleanNumber, "sms");
    }
  };

  // --- Verify OTP & Save Language in MongoDB ---
  const handleVerifyOTP = async () => {
    const cleanOtp = userOtp.trim();
    if (!cleanOtp) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Both Email and SMS are now verified uniformly via our custom backend
      const res = await axiosInstance.post("/api/language/verify-otp", {
        userId: user?._id,
        targetLanguage: pendingLanguage,
        otp: cleanOtp,
      });

      if (res.data?.success) {
        if (pendingLanguage) setLanguage(pendingLanguage);
        resetAndClose();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep("select");
    setPendingLanguage(null);
    setMobileNumber("");
    setUserOtp("");
    setError("");
    setInfoMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-800/40 backdrop-blur-sm">

      <div className="w-full max-w-md bg-background border border-border rounded-2xl text-foreground shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-4">
            <button
              onClick={step === "select" ? resetAndClose : () => setStep("select")}
              className="p-2 rounded-full hover:bg-accent transition text-muted-foreground hover:text-foreground"
            >
              {step === "select" ? <X className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
            <h2 className="text-lg font-bold">
              {step === "select"
                ? t("languageSettings")
                : step === "mobile_input"
                ? "Verify Phone Number"
                : "Verify Security Code"}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4">
          {/* STEP 1: Select Language */}
          {step === "select" && (
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  disabled={loading}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className="w-full flex items-center justify-between p-4 bg-background hover:bg-accent transition text-left"
                >
                  <div>
                    <div className="font-semibold text-sm text-foreground">{lang.nativeName}</div>
                    <div className="text-xs text-muted-foreground">{lang.label}</div>
                  </div>
                  {lang.code === "fr" ? (
                    <span className="text-[10px] text-muted-foreground bg-accent/50 px-2 py-1 rounded border border-border flex items-center gap-1">
                      <Mail className="w-3 h-3 text-sky-500" /> Email OTP
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground bg-accent/50 px-2 py-1 rounded border border-border flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-emerald-400" /> SMS OTP
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: Mobile Input */}
          {step === "mobile_input" && (
            <div className="space-y-4 py-2">
              <p className="text-xs text-muted-foreground">
                Enter your phone number to receive an SMS verification code to switch display language to{" "}
                <span className="text-foreground font-semibold">
                  {LANGUAGES.find((l) => l.code === pendingLanguage)?.nativeName}
                </span>.
              </p>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  setError("");
                }}
                placeholder="Enter mobile number (+91 9876543210)"
                className="w-full bg-background border border-border text-foreground px-4 py-3 rounded-xl text-sm font-mono focus:outline-none focus:border-sky-500"
              />
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="flex-1 bg-background border-border text-foreground hover:bg-accent rounded-full font-bold py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  disabled={loading}
                  onClick={handleMobileSubmit}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full py-2.5"
                >
                  {loading ? "Sending..." : "Send SMS Code"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: OTP Code Entry */}
          {step === "verify" && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-foreground leading-normal">{infoMessage}</p>
              <input
                type="text"
                maxLength={6}
                value={userOtp}
                onChange={(e) => {
                  setUserOtp(e.target.value);
                  setError("");
                }}
                placeholder="Enter 6-digit code"
                className="w-full bg-background border border-border text-foreground px-4 py-3 rounded-xl text-center font-mono text-xl tracking-widest focus:outline-none focus:border-sky-500"
              />
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="flex-1 bg-background border-border text-foreground hover:bg-accent rounded-full font-bold py-2.5"
                >
                  Back
                </Button>
                <Button
                  disabled={loading}
                  onClick={handleVerifyOTP}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full py-2.5"
                >
                  {loading ? "Verifying..." : "Verify & Apply"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
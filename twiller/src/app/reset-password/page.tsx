'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, Sparkles, KeyRound, ArrowLeft, Twitter } from 'lucide-react';

export default function DedicatedForgotPasswordPage() {
    const router = useRouter();
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
            const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
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
                router.push('/');
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
        <div className="flex justify-center min-h-screen bg-white text-black antialiased select-none font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
            <div className="w-full max-w-[600px] min-h-screen flex flex-col p-4 sm:p-6 md:p-8 relative">
                
                {/* Upper Content Workspace */}
                <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col justify-start pt-8">
                    
                    {/* Return Navigation Anchor */}
                    <button 
                        onClick={() => router.push('/')}
                        className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 text-black transition-colors cursor-pointer flex items-center justify-center"
                        aria-label="Back to home"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Centered Iconic Premium Branding Asset (Original Twitter Bird) */}
                    <div className="flex justify-center pb-9">
                        <Twitter className="h-10 w-10 text-[#1d9bf0] fill-current" />
                    </div>

                    <div className="w-full animate-in fade-in duration-200">
                        <h2 className="text-3xl font-black mb-2 tracking-tight text-black">
                            Reset password
                        </h2>
                        
                        <p className="text-sm text-gray-500 mb-6 leading-normal font-medium">
                            Enter your details to manually change your password, or use the auto-generate button to have a secure random credentials set sent directly to your inbox.
                        </p>

                        {/* Operational Feedback Layers */}
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-sm mb-4 flex items-start gap-2.5 font-semibold">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="leading-tight">{errorMessage}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3.5 rounded-xl text-sm mb-4 flex items-start gap-2.5 font-semibold">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="leading-tight">{successMessage} Redirecting...</span>
                            </div>
                        )}

                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Email or Phone Number
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={isLoading || !!successMessage}
                                    placeholder="Enter email address or phone number"
                                    className="w-full bg-white border border-gray-300 focus:border-[#1d9bf0] rounded-xl p-3 text-black focus:outline-none focus:ring-1 focus:ring-[#1d9bf0] transition-all placeholder:text-gray-400 font-medium text-[15px]"
                                    value={identity}
                                    onChange={(e) => setIdentity(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    New Password
                                    </label>
                                    <input
                                    type="password"
                                    disabled={isLoading || !!successMessage}
                                    placeholder="New custom password"
                                    className="w-full bg-white border border-gray-300 focus:border-[#1d9bf0] rounded-xl p-3 text-black focus:outline-none focus:ring-1 focus:ring-[#1d9bf0] transition-all placeholder:text-gray-400 font-medium text-[15px]"
                                    value={manualPassword}
                                    onChange={(e) => setManualPassword(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Confirm New Password
                                    </label>
                                    <input
                                    type="password"
                                    disabled={isLoading || !!successMessage}
                                    placeholder="Confirm new password"
                                    className="w-full bg-white border border-gray-300 focus:border-[#1d9bf0] rounded-xl p-3 text-black focus:outline-none focus:ring-1 focus:ring-[#1d9bf0] transition-all placeholder:text-gray-400 font-medium text-[15px]"
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
                                    className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-full text-[17px] transition-all duration-200 flex justify-center items-center gap-2 disabled:bg-gray-300 disabled:text-gray-500 cursor-pointer disabled:cursor-not-allowed"
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
                                    className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold py-3.5 rounded-full text-[17px] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isLoading && actionType === "auto" ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                    <Sparkles className="w-5 h-5" />
                                    )}
                                    Auto-Generate & Email Password Instead
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function DedicatedForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [identity, setIdentity] = useState("");
    const [resetMethod, setResetMethod] = useState<"auto" | "manual">("auto");
    const [manualPassword, setManualPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const executeResetRequest = async (passwordOverride?: string) => {
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
            const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    identity: identity.trim(),
                    manualPassword: passwordOverride || null
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process recovery sequence.');
            }

            setSuccess(data.message);
            
            setTimeout(() => {
                router.push('/'); 
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'An unexpected network error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep1 = () => {
        if (!identity.trim()) return;
        setStep(2);
        setError(null);
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
            setError("Please complete both password fields.");
            return;
        }
        if (manualPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        executeResetRequest(manualPassword.trim());
    };

    return (
        <div className="flex justify-center min-h-screen bg-black text-white antialiased select-none font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
            <div className="w-full max-w-[600px] min-h-screen flex flex-col p-4 sm:p-6 md:p-8">
                
                {/* Properly aligned Header with Back Arrow and Logo */}
                <div className="flex items-center w-full mb-8 relative">
                    <button 
                        onClick={() => router.push('/')}
                        className="p-2 hover:bg-zinc-900 rounded-full transition-colors cursor-pointer absolute left-0"
                        aria-label="Back to home"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-full flex justify-center">
                        <svg className="h-[36px] w-[36px] fill-white" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                    </div>
                </div>

                {/* Workspace Container */}
                <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col justify-start">
                    
                    {step === 1 && (
                        <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
                            <h1 className="text-[31px] font-black tracking-tight leading-9 mb-2 text-white">Find your account</h1>
                            <p className="text-[#71767b] text-[15px] leading-5 mb-8">
                                Enter the email, phone number, or username associated with your account to change your password.
                            </p>

                            <div className="relative w-full border border-zinc-700 focus-within:border-[#1d9bf0] rounded-[4px] bg-black pt-4 pb-1 px-3 group transition-colors">
                                <input
                                    type="text"
                                    value={identity}
                                    onChange={(e) => setIdentity(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && identity.trim() && handleNextStep1()}
                                    required
                                    disabled={loading || !!success}
                                    placeholder=" "
                                    className="w-full bg-transparent border-none text-[17px] text-white outline-none focus:ring-0 peer h-7 pt-1"
                                />
                                <label className="absolute left-3 text-[#71767b] pointer-events-none transition-all duration-150 transform origin-top-left
                                    top-4 text-[17px] scale-100
                                    peer-focus:top-1 peer-focus:scale-[0.76] peer-focus:text-[#1d9bf0]
                                    peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:scale-[0.76]">
                                    Email, phone number, or username
                                </label>
                            </div>

                            <div className="mt-auto sm:mt-8 pt-6">
                                <button
                                    onClick={handleNextStep1}
                                    disabled={!identity.trim()}
                                    className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-full text-[17px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
                            <h1 className="text-[31px] font-black tracking-tight leading-9 mb-6 text-white">How do you want to reset your password?</h1>
                            
                            {error && (
                                <div className="bg-[#f4212e]/10 border border-[#f4212e]/30 text-[#f4212e] p-3 rounded-md text-[15px] mb-6 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            
                            {success && (
                                <div className="bg-[#00ba7c]/10 border border-[#00ba7c]/30 text-[#00ba7c] p-3 rounded-md text-[15px] mb-6 flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <span>{success}</span>
                                </div>
                            )}

                            <div className="space-y-4 mb-auto">
                                <label className={`block border ${resetMethod === 'auto' ? 'border-[#1d9bf0]' : 'border-zinc-700'} rounded-[4px] p-4 cursor-pointer hover:bg-zinc-900/50 transition-colors`}>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${resetMethod === 'auto' ? 'border-[#1d9bf0] bg-[#1d9bf0]' : 'border-[#71767b] bg-transparent'}`}>
                                                {resetMethod === 'auto' && (
                                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-white"><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></svg>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-[17px] text-white">Auto-generate a secure password</div>
                                            <div className="text-[15px] text-[#71767b] mt-1 leading-snug">We will generate a random alphabetical password and send it to your registered email or phone via SMS.</div>
                                        </div>
                                    </div>
                                </label>

                                <label className={`block border ${resetMethod === 'manual' ? 'border-[#1d9bf0]' : 'border-zinc-700'} rounded-[4px] p-4 cursor-pointer hover:bg-zinc-900/50 transition-colors`}>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${resetMethod === 'manual' ? 'border-[#1d9bf0] bg-[#1d9bf0]' : 'border-[#71767b] bg-transparent'}`}>
                                                {resetMethod === 'manual' && (
                                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-white"><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></svg>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-[17px] text-white">Create a custom password manually</div>
                                            <div className="text-[15px] text-[#71767b] mt-1 leading-snug">Choose a new password right now. Best if you want to set something easy to remember immediately.</div>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <div className="mt-auto sm:mt-8 pt-6">
                                <button
                                    onClick={handleNextStep2}
                                    disabled={loading || !!success}
                                    className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-full text-[17px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Next"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleSubmitStep3} className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
                            <h1 className="text-[31px] font-black tracking-tight leading-9 mb-2 text-white">Choose a new password</h1>
                            <p className="text-[15px] text-[#71767b] leading-5 mb-8">
                                Make sure your new password is 8 characters or more. Try including numbers, letters, and punctuation marks for a strong password.
                            </p>

                            {error && (
                                <div className="bg-[#f4212e]/10 border border-[#f4212e]/30 text-[#f4212e] p-3 rounded-md text-[15px] mb-6 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            
                            {success && (
                                <div className="bg-[#00ba7c]/10 border border-[#00ba7c]/30 text-[#00ba7c] p-3 rounded-md text-[15px] mb-6 flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <span>{success}</span>
                                </div>
                            )}

                            <div className="space-y-6 mb-auto">
                                <div className="relative w-full border border-zinc-700 focus-within:border-[#1d9bf0] rounded-[4px] bg-black pt-4 pb-1 px-3 group transition-colors">
                                    <input
                                        type="password"
                                        value={manualPassword}
                                        onChange={(e) => setManualPassword(e.target.value)}
                                        disabled={loading || !!success}
                                        placeholder=" "
                                        className="w-full bg-transparent border-none text-[17px] text-white outline-none focus:ring-0 peer h-7 pt-1"
                                    />
                                    <label className="absolute left-3 text-[#71767b] pointer-events-none transition-all duration-150 transform origin-top-left
                                        top-4 text-[17px] scale-100
                                        peer-focus:top-1 peer-focus:scale-[0.76] peer-focus:text-[#1d9bf0]
                                        peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:scale-[0.76]">
                                        New password
                                    </label>
                                </div>

                                <div className="relative w-full border border-zinc-700 focus-within:border-[#1d9bf0] rounded-[4px] bg-black pt-4 pb-1 px-3 group transition-colors">
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading || !!success}
                                        placeholder=" "
                                        className="w-full bg-transparent border-none text-[17px] text-white outline-none focus:ring-0 peer h-7 pt-1"
                                    />
                                    <label className="absolute left-3 text-[#71767b] pointer-events-none transition-all duration-150 transform origin-top-left
                                        top-4 text-[17px] scale-100
                                        peer-focus:top-1 peer-focus:scale-[0.76] peer-focus:text-[#1d9bf0]
                                        peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:scale-[0.76]">
                                        Confirm password
                                    </label>
                                </div>
                            </div>

                            <div className="mt-auto sm:mt-8 pt-6">
                                <button
                                    type="submit"
                                    disabled={loading || !!success || !manualPassword.trim() || !confirmPassword.trim()}
                                    className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-full text-[17px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Change password"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function DedicatedForgotPasswordPage() {
    const router = useRouter();
    const [identity, setIdentity] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
            const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identity }), 
            });

            const data = await response.json();

            if (!response.ok) {
                // If the user tries more than once per day, display the mandatory system message
                setError(data.error || 'Something went wrong.');
            } else {
                setSuccess(data.message || 'A secure alpha-only temporary password has been successfully configured.');
                setIdentity('');

                // Smooth internal redirection sequence back to the gateway login
                setTimeout(() => {
                    router.push('/'); 
                }, 3000);
            }
        } catch (err) {
            setError('Failed to connect to the authentication server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center min-h-screen bg-black text-[#e7e9ea] antialiased select-none font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
            <div className="w-full max-w-[600px] min-h-screen flex flex-col justify-between p-4 sm:p-6 md:p-8 relative">
                
                {/* Upper Content Workspace */}
                <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col justify-start pt-8">
                    
                    {/* Return Navigation Anchor */}
                    <button 
                        onClick={() => router.push('/')}
                        className="absolute top-6 left-6 p-2 rounded-full hover:bg-zinc-900 text-white transition-colors cursor-pointer flex items-center justify-center"
                        aria-label="Back to home"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Centered Iconic Premium Branding Asset */}
                    <div className="flex justify-center pb-9">
                        <svg className="h-[36px] w-[36px] fill-white" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                    </div>

                    {/* Title Content Header */}
                    <div className="mb-6">
                        <h1 className="text-[31px] font-black text-white tracking-tight leading-9 mb-2">
                            Find your account
                        </h1>
                        <p className="text-[#71767b] text-[15px] font-medium leading-5">
                            Enter the email address or phone number associated with your profile to request an automated account credential reset.
                        </p>
                    </div>

                    {/* Operational Performance Feedback Alerts */}
                    {error && (
                        <div className="bg-[#f4212e]/10 border border-[#f4212e]/30 text-[#f4212e] px-4 py-3.5 rounded-xl text-[15px] mb-5 font-bold flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span className="leading-tight">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-[#00ba7c]/10 border border-[#00ba7c]/30 text-[#00ba7c] p-4 rounded-xl text-[15px] mb-5 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <strong className="block font-bold mb-0.5">Recovery Sequence Activated</strong>
                                <span className="text-[14px] text-zinc-300 leading-normal">
                                    {success} Check your communication log terminal for your raw letter-only password credentials.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Input Collection Form Wrapper */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow justify-between">
                        
                        {/* Interactive Float Floating Input Label Hook */}
                        <div className="relative w-full border border-[#333639] focus-within:border-[#1d9bf0] rounded-[4px] bg-black pt-4 pb-1 px-3 group transition-all duration-150">
                            <input
                                type="text"
                                value={identity}
                                onChange={(e) => setIdentity(e.target.value)}
                                required
                                disabled={loading || !!success}
                                placeholder=" "
                                className="w-full bg-transparent border-none text-[17px] text-white outline-none focus:ring-0 peer h-7 pt-1"
                            />
                            <label className="absolute left-3 text-[#71767b] pointer-events-none transition-all duration-150 transform origin-top-left
                                top-4 text-[17px] scale-100
                                peer-focus:top-1 peer-focus:scale-[0.76] peer-focus:text-[#1d9bf0]
                                peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:scale-[0.76]">
                                Email address or phone number
                            </label>
                        </div>

                        {/* Submission Action Blocks */}
                        <div className="mt-auto sm:mt-8 pt-6">
                            <button
                                type="submit"
                                disabled={loading || !!success || !identity.trim()}
                                className="w-full bg-[#eff3f4] hover:bg-[#d7dbdc] active:bg-[#cdd1d2] disabled:bg-[#eff3f4]/50 disabled:text-[#0f1419]/50 text-[#0f1419] font-bold py-3.5 px-4 rounded-full text-[17px] leading-5 transition-all duration-200 flex justify-center items-center gap-2 select-none shadow-sm cursor-pointer disabled:cursor-not-allowed transform active:scale-[0.99]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Searching records...</span>
                                    </>
                                ) : (
                                    <span>Next</span>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext"; 
import { LanguageProvider } from "@/context/LanguageContext";
// @ts-ignore: allow side-effect CSS import when no module declarations are present
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'X Clone - Social Media Platform',
  description: 'A modern Twitter clone built with Next.js',
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen overflow-x-hidden m-0 p-0`}>
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />

        <AuthProvider>
          <LanguageProvider>
            {/* Standard Twitter 1265px Outer Shell Wrapper */}
            <div className="w-full min-h-screen flex justify-center bg-background text-foreground">
              <div className="w-full max-w-[1265px] flex justify-center min-h-screen">
                {children}
              </div>
            </div>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
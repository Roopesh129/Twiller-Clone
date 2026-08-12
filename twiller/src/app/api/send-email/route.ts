import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { to, subject, html, text, proxySecret } = body;

        // Simple hardcoded secret to prevent unauthorized public abuse of this Vercel proxy
        if (proxySecret !== "TwillerProxySecureKey2026!") {
            return NextResponse.json({ error: "Unauthorized proxy access" }, { status: 401 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions: any = {
            from: process.env.EMAIL_USER,
            to,
            subject,
        };

        if (html) mailOptions.html = html;
        if (text) mailOptions.text = text;

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: "Email dispatched via Vercel Proxy" });
    } catch (error: any) {
        console.error("Vercel Proxy Email Error:", error);
        return NextResponse.json({ error: "Failed to dispatch email", details: error.message }, { status: 500 });
    }
}

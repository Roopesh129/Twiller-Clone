import express from 'express';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { UAParser } from 'ua-parser-js';
import User from '../models/user.js';

const router = express.Router();

// Dynamic Transporter Factory
const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Helper: Check 10:00 AM - 1:00 PM IST mobile curfew window
function isMobileCurfewAllowed() {
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const hours = istTime.getHours();
    
    // 10:00 AM to 1:00 PM (13:00)
    return hours >= 10 && hours < 13;
}

// Helper: Extract detailed metadata from incoming request headers
function parseUserAgentDetails(req) {
    const userAgentString = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgentString);
    const result = parser.getResult();

    let deviceCategory = result.device.type || 'desktop';

    const isMobileUA = /mobile|iphone|ipod|android|blackberry|opera mini|windows phone/i.test(userAgentString);
    const isTabletUA = /ipad|tablet/i.test(userAgentString);

    if (deviceCategory === 'desktop' && (isMobileUA || isTabletUA)) {
        deviceCategory = 'mobile';
    }

    const browser = result.browser.name 
        ? `${result.browser.name} ${result.browser.version || ''}`.trim() 
        : 'Unknown Browser';
    const os = result.os.name 
        ? `${result.os.name} ${result.os.version || ''}`.trim() 
        : 'Unknown OS';

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                      req.socket?.remoteAddress || 
                      '127.0.0.1';

    return { browser, os, deviceCategory, ipAddress, rawUserAgent: userAgentString };
}

// Helper: Generate temporary alpha passwords
function generateAlphaPassword(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// =========================================================================
// 1. POST: User Login & Verification Gateway
// =========================================================================
router.post('/login', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        // Step 1: Parse metadata first
        const sessionMeta = parseUserAgentDetails(req);

        // Step 2: Enforce Mobile Curfew (10:00 AM - 1:00 PM IST)
        if (sessionMeta.deviceCategory === 'mobile' && !isMobileCurfewAllowed()) {
            return res.status(403).json({
                error: "Access denied. Mobile logins are strictly limited to 10:00 AM - 1:00 PM IST."
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        let user = await User.findOne({ email: cleanEmail });

        if (!user) {
            user = new User({
                email: cleanEmail,
                username: cleanEmail.split('@')[0] + Math.floor(1000 + Math.random() * 9000),
                displayName: cleanEmail.split('@')[0],
                password: "OAUTH_BYPASS_TEMPORARY_SECRET",
                loginHistory: []
            });
            await user.save();
        }

        // Log session entry to history array
        user.loginHistory.unshift({
            browser: sessionMeta.browser,
            os: sessionMeta.os,
            deviceCategory: sessionMeta.deviceCategory,
            ipAddress: sessionMeta.ipAddress,
            loginTimestamp: new Date()
        });

        // Step 3: Browser MFA Check (Chrome vs Edge/Microsoft/Other)
        const isChrome = sessionMeta.rawUserAgent.includes('Chrome') && 
                        !sessionMeta.rawUserAgent.includes('Edg') && 
                        !sessionMeta.rawUserAgent.includes('OPR');

        if (isChrome) {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            user.tempOtp = otpCode;
            user.tempOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();

            try {
                const proxyRes = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        proxySecret: "TwillerProxySecureKey2026!",
                        to: cleanEmail,
                        subject: "Twiller Verification OTP Code",
                        text: `Your Twiller MFA Verification Code is: ${otpCode}`
                    })
                });
                if (!proxyRes.ok) {
                    const errorText = await proxyRes.text();
                    throw new Error(`Vercel Proxy Error: ${errorText}`);
                }
            } catch (mailError) {
                return res.status(500).json({ 
                    error: "Failed to dispatch OTP email. Check Nodemailer configuration.", 
                    details: mailError.message 
                });
            }

            return res.status(200).json({
                requiresOtp: true,
                email: cleanEmail,
                message: "OTP sent to your email address."
            });
        }

        await user.save();

        const userObj = user.toObject();
        delete userObj.password;

        return res.status(200).json({ requiresOtp: false, user: userObj });
    } catch (err) {
        return res.status(500).json({ error: "Server authentication error", details: err.message });
    }
});

// =========================================================================
// 2. POST: Secure Account Recovery & Password Reset
// =========================================================================
router.post('/forgot-password', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { identity, manualPassword } = req.body;

    if (!identity) {
        return res.status(400).json({ error: "Missing identity field parameter." });
    }

    try {
        const identityClean = identity.trim();
        const user = await User.findOne({
            $or: [
                { email: identityClean.toLowerCase() }, 
                { username: identityClean },
                { phone: identityClean }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: "No account matched those credentials." });
        }

        const now = new Date();
        if (user.lastPasswordResetDate) {
            const lastReset = new Date(user.lastPasswordResetDate);
            if (
                lastReset.getFullYear() === now.getFullYear() &&
                lastReset.getMonth() === now.getMonth() &&
                lastReset.getDate() === now.getDate()
            ) {
                return res.status(429).json({ error: "You can use this option only one time per day." });
            }
        }

        let passwordToSave = "";
        let isAutoGenerated = false;

        if (manualPassword && manualPassword.trim() !== "") {
            passwordToSave = manualPassword.trim();
            isAutoGenerated = false;
        } else {
            const tempPasswordText = generateAlphaPassword(12);
            passwordToSave = tempPasswordText;
            isAutoGenerated = true;

            const proxyRes = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proxySecret: "TwillerProxySecureKey2026!",
                    to: user.email,
                    subject: 'Account Recovery - Temporary Password Assigned',
                    html: `
                        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eff3f4; border-radius: 16px; background-color: #ffffff; color: #0f1419;">
                            <h2 style="color: #1d9bf0; font-size: 22px; font-weight: 800; margin-bottom: 8px; text-align: center;">Twiller Account Recovery</h2>
                            <hr style="border: 0; border-top: 1px solid #eff3f4; margin: 16px 0;"/>
                            <p style="font-size: 15px; line-height: 22px;">Hi <strong>${user.displayName || 'User'}</strong>,</p>
                            <p style="font-size: 15px; line-height: 22px;">A temporary letters-only security password has been successfully auto-generated.</p>
                            <div style="background-color: #f7f9fa; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; border: 1px dashed #1d9bf0;">
                                <span style="font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 1px; color: #0f1419;">${tempPasswordText}</span>
                            </div>
                        </div>
                    `
                })
            });
            
            if (!proxyRes.ok) {
                const errorText = await proxyRes.text();
                throw new Error(`Vercel Proxy Error: ${errorText}. Did you add EMAIL_USER and EMAIL_PASS to Vercel Environment Variables?`);
            }

            // If the user requested via phone, also send SMS via Fast2SMS
            if (identityClean === user.phone && process.env.FAST2SMS_API_KEY) {
                try {
                    await fetch('https://www.fast2sms.com/dev/bulkV2', {
                        method: 'POST',
                        headers: {
                            'authorization': process.env.FAST2SMS_API_KEY,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            route: "q",
                            message: `Your Twiller temporary secure password is: ${tempPasswordText}`,
                            language: "english",
                            flash: 0,
                            numbers: user.phone.replace(/\D/g, '') // strip non-digits
                        })
                    });
                } catch (smsErr) {
                    console.error("Fast2SMS failed:", smsErr);
                }
            }
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(passwordToSave, salt);
        user.lastPasswordResetDate = now;
        await user.save();

        if (!isAutoGenerated) {
            const proxyRes = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proxySecret: "TwillerProxySecureKey2026!",
                    to: user.email,
                    subject: 'Security Alert - Your Twiller Password Has Been Changed',
                    html: `
                        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eff3f4; border-radius: 16px; background-color: #ffffff; color: #0f1419;">
                            <h2 style="color: #1d9bf0; font-size: 22px; font-weight: 800; margin-bottom: 8px; text-align: center;">Password Changed Successfully</h2>
                            <hr style="border: 0; border-top: 1px solid #eff3f4; margin: 16px 0;"/>
                            <p style="font-size: 15px; line-height: 22px;">The security credentials for your account were recently updated via manual password reset.</p>
                        </div>
                    `
                })
            });
            
            if (!proxyRes.ok) {
                const errorText = await proxyRes.text();
                throw new Error(`Vercel Proxy Error: ${errorText}. Did you add EMAIL_USER and EMAIL_PASS to Vercel Environment Variables?`);
            }
        }

        return res.status(200).json({
            message: manualPassword
                ? "Your password has been manually updated successfully. An email notification confirming this change has been sent."
                : "A secure temporary password has been auto-generated and sent successfully to your email address."
        });

    } catch (error) {
        return res.status(500).json({ error: "Internal server error executing reset assignment routine." });
    }
});

// =========================================================================
// 3. POST: Multi-Factor OTP Verification Step
// =========================================================================
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required." });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({ error: "User account not found." });
        }

        if (!user.tempOtp || user.tempOtp !== otp.trim()) {
            return res.status(400).json({ error: "Invalid OTP code." });
        }

        if (user.tempOtpExpires && new Date() > user.tempOtpExpires) {
            return res.status(400).json({ error: "OTP code has expired. Please log in again." });
        }

        user.tempOtp = null;
        user.tempOtpExpires = null;
        await user.save();

        const userObj = user.toObject();
        delete userObj.password;

        return res.status(200).json({
            message: "OTP verified successfully.",
            user: userObj
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 4. GET: Fetch Session History
// =========================================================================
router.get('/login-history', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const sessionUserEmail = req.query.email || req.body?.email;

    if (!sessionUserEmail) {
        return res.status(400).json({ error: "Authentication identification details required." });
    }

    try {
        const user = await User.findOne({ email: sessionUserEmail.trim().toLowerCase() }).select('loginHistory');

        if (!user) {
            return res.status(404).json({ error: "Active profile context trace not found." });
        }

        return res.status(200).json(user.loginHistory || []);
    } catch (error) {
        return res.status(500).json({ error: "Internal validation tracking processing fault occurred." });
    }
});

export default router;
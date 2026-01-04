const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rate Limiting
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});

// Contact Endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
    const { name, email, subject, message, token, honeypot } = req.body;

    // 1. Honeypot check
    if (honeypot) {
        // Silently fail if honeypot is filled (bot)
        return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    }

    // 2. Turnstile Verification
    const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
    if (!SECRET_KEY) {
        console.error('TURNSTILE_SECRET_KEY is missing');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    try {
        const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const verifyResult = await fetch(verifyUrl, {
            method: 'POST',
            body: JSON.stringify({
                secret: SECRET_KEY,
                response: token
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        const outcome = await verifyResult.json();
        if (!outcome.success) {
            return res.status(400).json({ error: 'CAPTCHA verification failed.' });
        }
    } catch (err) {
        console.error('Turnstile verification error:', err);
        return res.status(500).json({ error: 'Verification failed.' });
    }

    // 3. Send Email
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: `"Website Contact" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO || 'contact@halghamdi.com',
        replyTo: email,
        subject: `[Website Inquiry] ${subject} - from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    try {
        if (process.env.NODE_ENV !== 'test' && process.env.SMTP_HOST) {
            await transporter.sendMail(mailOptions);
        } else {
            console.log('Mock email sent:', mailOptions);
        }
        res.status(200).json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ error: 'Failed to send message.' });
    }
});

// Serve static files for any other route (SPA-like behavior if needed, but we have static pages)
// For strict static structure, we rely on express.static above.
// But we might want to handle 404s gracefully
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/404.html')); // We'll create a 404 page later or just rely on browser default for now
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;

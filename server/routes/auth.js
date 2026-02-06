
import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendOTP } from '../mailer.js';
import { getUsers, saveUser } from '../github-db.js';

const router = express.Router();

// In-memory store for OTPs (Map<email, { otp, expires }>)
const otpStore = new Map();

// Generate random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Check if user already exists (optional: allow login via OTP? For now, just register flow)
    const users = await getUsers();
    if (users.find(u => u.email === email)) {
        return res.status(409).json({ error: 'User already exists. Please login.' });
    }

    const otp = generateOTP();
    const success = await sendOTP(email, otp);

    if (success) {
        otpStore.set(email, {
            otp,
            expires: Date.now() + 10 * 60 * 1000 // 10 mins
        });
        res.json({ message: 'OTP sent successfully' });
    } else {
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// 2. Verify OTP
router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);

    if (!stored) return res.status(400).json({ error: 'OTP expired or not sent' });
    if (Date.now() > stored.expires) {
        otpStore.delete(email);
        return res.status(400).json({ error: 'OTP expired' });
    }
    if (stored.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP verified
    res.json({ message: 'OTP verified' });
});

// 3. Register (Complete Profile)
router.post('/register', async (req, res) => {
    const { email, otp, password, name } = req.body;

    // re-verify OTP just to be safe (or rely on client flow? Safer to re-verify or use a temporary token)
    // For simplicity: We trust if the client sends the OTP again that matches logic, OR we could issue a temporary "register-token" in step 2.
    // Let's just re-check OTP store for simplicity in this MVP.
    const stored = otpStore.get(email);
    if (!stored || stored.otp !== otp) {
        return res.status(400).json({ error: 'Invalid or expired OTP session' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            email,
            name,
            passwordHash: hashedPassword,
            createdAt: new Date().toISOString()
        };

        await saveUser(newUser);
        otpStore.delete(email); // clear OTP

        res.status(201).json({ user: { id: newUser.id, email: newUser.email, name: newUser.name } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// 4. Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const users = await getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Success
        res.json({
            user: { id: user.id, email: user.email, name: user.name },
            // token: '...' // JWT could be added here later
        });

    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;

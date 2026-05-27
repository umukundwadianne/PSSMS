const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const SeedAdmin = require('../models/SeedAdmin');

const router = express.Router();


router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username and password are required' });

    const user = await User.findOne({ username: String(username).trim() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    req.session.userId = user._id;
    return res.json({ message: 'Logged in', user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username and password are required' });

    const uname = String(username).trim();
    if (uname.length < 3) return res.status(400).json({ message: 'username must be at least 3 characters' });
    if (String(password).length < 6) return res.status(400).json({ message: 'password must be at least 6 characters' });

    const exists = await User.findOne({ username: uname });
    if (exists) return res.status(409).json({ message: 'username already exists' });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({ username: uname, passwordHash, role: 'admin' });

    return res.json({ message: 'Registered', user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password (request reset token)
router.post('/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'username is required' });

    const uname = String(username).trim();
    const user = await User.findOne({ username: uname });

    // Always return generic response (avoid user enumeration)
    const message = { message: 'If the user exists, a reset token has been generated' };

    if (!user) return res.json(message);

    const rawToken = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetTokenHash = tokenHash;
    user.resetTokenExpiresAt = expiresAt;
    await user.save();

    // In dev, return token so you can test easily.
    if (process.env.NODE_ENV !== 'production') {
      return res.json({ ...message, devToken: rawToken });
    }

    return res.json(message);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Reset password (username-based, no token)
router.post('/reset-password', async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
      return res.status(400).json({ message: 'username and newPassword are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'password must be at least 6 characters' });
    }

    const uname = String(username).trim();

    const user = await User.findOne({ username: uname });
    if (!user) return res.status(400).json({ message: 'Invalid username or reset request' });

    user.passwordHash = await bcrypt.hash(String(newPassword), 10);

    // clear any existing token fields (optional but safe)
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;

    await user.save();

    return res.json({ message: 'Password updated. You can login now.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Seed default values (default admin user). Applies once.
router.post('/seed', async (req, res) => {
  try {
    // If already applied, do not re-create users.
    const existing = await SeedAdmin.findOne({}).sort({ appliedAt: -1 });
    if (existing) return res.json({ message: 'Seed already applied' });

    const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const passwordHash = await bcrypt.hash(String(defaultPassword), 10);
    const user = await User.findOneAndUpdate(
      { username: defaultUsername },
      { $set: { username: defaultUsername, passwordHash, role: 'admin' }, $unset: { resetTokenHash: '', resetTokenExpiresAt: '' } },
      { upsert: true, new: true }
    );

    await SeedAdmin.create({ appliedAt: new Date() });
    return res.json({ message: 'Seed applied', admin: { username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;





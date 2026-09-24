import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const token = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = user => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const normalizeEmail = email => String(email || '').trim().toLowerCase();

function nameFromEmail(email) {
  const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
  return local ? local.replace(/\w/g, c => c.toUpperCase()) : 'Customer';
}

/**
 * Passwordless registration flow from the user's perspective:
 * - New email: create a user automatically with the supplied password.
 * - Existing email: the supplied password must match that account.
 * Email verification is intentionally not required.
 */
export async function login(req, res) {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  let user = await User.findOne({ email });

  if (!user) {
    try {
      user = await User.create({
        name: nameFromEmail(email),
        email,
        password: await bcrypt.hash(password, 10)
      });
    } catch (e) {
      // Handle a simultaneous first login for the same email safely.
      if (e?.code === 11000) {
        user = await User.findOne({ email });
      } else {
        throw e;
      }
    }
  }

  if (!user) return res.status(500).json({ message: 'Could not create account' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({
      message: 'Incorrect password for this email'
    });
  }

  return res.json({ token: token(user._id), user: publicUser(user) });
}

// Kept for API compatibility. The UI no longer needs a separate registration page.
export async function register(req, res) {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  const name = String(req.body.name || '').trim();

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const validPassword = await bcrypt.compare(password, existing.password);
    if (!validPassword) return res.status(401).json({ message: 'Incorrect password for this email' });
    return res.json({ token: token(existing._id), user: publicUser(existing) });
  }

  const user = await User.create({
    name: name || nameFromEmail(email),
    email,
    password: await bcrypt.hash(password, 10)
  });

  return res.status(201).json({ token: token(user._id), user: publicUser(user) });
}

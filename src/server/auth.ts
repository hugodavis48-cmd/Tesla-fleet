import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface ServerSession {
  id: string;
  token: string;
  userId: string;
  device: string;
  ip: string;
  loginAt: string;
  expiresAt: string;
  lastActive: string;
  status: 'active' | 'revoked' | 'expired';
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: 'customer' | 'admin';
  avatar: string;
  bio: string;
  location: string;
  preferredServiceCenter: string;
  phone: string;
  walletAddress: string;
  twoFactorEnabled: boolean;
  pinSet: boolean;
  pin?: string;
  memberSince: string;
  tier: 'Standard' | 'Plaid Member' | 'Founders Club';
  referralCode: string;
  referredBy?: string;
  referralEarningsUsd: number;
  referralCount: number;
  referredUsers: any[];
}

// In-memory persistent database for users and sessions
const usersDatabase: Map<string, StoredUser> = new Map();
const sessionsDatabase: Map<string, ServerSession> = new Map();

// Helper to hash password using scrypt
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

// Helper to verify password using constant-time comparison
export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(expectedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Generate secure 64-char token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Helper to sanitize user (strip sensitive password hash and salt)
export function sanitizeUser(user: StoredUser, activeSessionToken?: string) {
  const userSessions = Array.from(sessionsDatabase.values())
    .filter((s) => s.userId === user.id)
    .sort((a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime());

  const activeSession = activeSessionToken
    ? sessionsDatabase.get(activeSessionToken)
    : userSessions.find((s) => s.status === 'active');

  const { passwordHash, passwordSalt, ...safeUser } = user;
  return {
    ...safeUser,
    activeSession: activeSession
      ? {
          id: activeSession.id,
          token: activeSession.token,
          device: activeSession.device,
          ip: activeSession.ip,
          loginAt: activeSession.loginAt,
          expiresAt: activeSession.expiresAt,
          status: activeSession.status,
        }
      : undefined,
    sessionHistory: userSessions.slice(0, 10).map((s) => ({
      id: s.id,
      token: s.token.substring(0, 8) + '...',
      device: s.device,
      ip: s.ip,
      loginAt: s.loginAt,
      expiresAt: s.expiresAt,
      status: s.status,
    })),
  };
}

// Pre-seed demo user accounts with securely hashed passwords
function seedInitialUsers() {
  if (usersDatabase.size === 0) {
    // 1. Alex Vance (Customer Demo)
    const alexCreds = hashPassword('TeslaPlaid2026!');
    const alexUser: StoredUser = {
      id: 'usr-apex-001',
      name: 'Alex Vance',
      email: 'alex.vance@apex-tesla.io',
      passwordHash: alexCreds.hash,
      passwordSalt: alexCreds.salt,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: 'Tesla owner and enthusiast since 2021. Loving track days with my Model S Plaid and custom Satin Stealth wrap.',
      location: 'Fremont, CA',
      preferredServiceCenter: 'Apex Fremont Technology Center',
      phone: '+1 (555) 837-5290',
      walletAddress: '0x9E218C4FaB06A4dD23c945b9E52aF3eA48972',
      twoFactorEnabled: true,
      pinSet: true,
      pin: '1234',
      memberSince: 'March 2024',
      tier: 'Plaid Member',
      referralCode: 'APEX-ALEX-99',
      referralEarningsUsd: 350.0,
      referralCount: 3,
      referredUsers: [
        {
          id: 'ref-01',
          name: 'Marcus Vance',
          email: 'marcus.v@tesla-club.org',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          date: '2026-10-24',
          status: 'deposit_completed',
          depositAmountUsd: 1200,
          earnedCreditUsd: 120,
          bonusSpinsEarned: 2,
        },
        {
          id: 'ref-02',
          name: 'Sarah Connor',
          email: 'sarah.c@cyberbeast.io',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
          date: '2026-10-28',
          status: 'deposit_completed',
          depositAmountUsd: 500,
          earnedCreditUsd: 100,
          bonusSpinsEarned: 2,
        },
      ],
    };
    usersDatabase.set(alexUser.email.toLowerCase(), alexUser);

    // Initial session for Alex
    const alexSessionToken = 'apex_sess_alex_demo_token_2026_secured';
    sessionsDatabase.set(alexSessionToken, {
      id: 'sess-01',
      token: alexSessionToken,
      userId: alexUser.id,
      device: 'Chrome on macOS (Current)',
      ip: '192.168.1.104',
      loginAt: '2026-11-08 10:15:00',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
    });

    // 2. Admin Operations User
    const adminCreds = hashPassword('AdminTesla2026!');
    const adminUser: StoredUser = {
      id: 'usr-apex-admin-01',
      name: 'Admin Operations',
      email: 'admin.ops@apex-tesla.io',
      passwordHash: adminCreds.hash,
      passwordSalt: adminCreds.salt,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      bio: 'Executive Fleet Operations & Telematics Director for Apex Tesla Hub.',
      location: 'Austin Gigafactory Hub',
      preferredServiceCenter: 'Apex Austin Gigafactory Hub',
      phone: '+1 (800) 837-5290',
      walletAddress: '0xADMIN71C94Bf25aB24041b6F9E1314B15b1285cDFeB7c',
      twoFactorEnabled: true,
      pinSet: true,
      pin: '9999',
      memberSince: 'January 2024',
      tier: 'Founders Club',
      referralCode: 'APEX-ADMIN-HQ',
      referralEarningsUsd: 1250.0,
      referralCount: 14,
      referredUsers: [],
    };
    usersDatabase.set(adminUser.email.toLowerCase(), adminUser);
  }
}

seedInitialUsers();

// Session verification middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : (req.headers['x-session-token'] as string) || (req.query.token as string);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No session token provided.' });
  }

  const session = sessionsDatabase.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  if (session.status !== 'active') {
    return res.status(401).json({ error: 'Session has been revoked or terminated.' });
  }

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    session.status = 'expired';
    return res.status(401).json({ error: 'Session has expired. Please sign in again.' });
  }

  // Find user
  const user = Array.from(usersDatabase.values()).find((u) => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User associated with session not found.' });
  }

  // Update session last active time
  session.lastActive = new Date().toISOString();

  // Attach to request
  (req as any).user = user;
  (req as any).session = session;
  next();
}

export const authRouter = Router();

// 1. SIGN UP ENDPOINT
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, bio, location, preferredServiceCenter, referralCode } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long for security compliance.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    if (usersDatabase.has(normalizedEmail)) {
      return res.status(409).json({
        error: 'An account with this email address already exists. Please log in instead.',
      });
    }

    // Hash password with random salt
    const { salt, hash } = hashPassword(password);

    const userName = name && typeof name === 'string' && name.trim().length > 0
      ? name.trim()
      : normalizedEmail.split('@')[0].toUpperCase();

    const userCode = `APEX-${userName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    const verifiedSignupAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    ];
    const userAvatar = verifiedSignupAvatars[Math.floor(Math.random() * verifiedSignupAvatars.length)];

    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      name: userName,
      email: normalizedEmail,
      passwordHash: hash,
      passwordSalt: salt,
      role: 'customer',
      avatar: userAvatar,
      bio: bio?.trim() || 'Tesla owner & enthusiast. Passionate about sustainable high-performance.',
      location: location?.trim() || 'California, USA',
      preferredServiceCenter: preferredServiceCenter?.trim() || 'Apex Fremont Technology Center',
      phone: phone?.trim() || '',
      walletAddress: `0x${crypto.randomBytes(20).toString('hex')}`,
      twoFactorEnabled: false,
      pinSet: false,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      tier: 'Standard',
      referralCode: userCode,
      referredBy: referralCode?.trim()?.toUpperCase() || undefined,
      referralEarningsUsd: 0,
      referralCount: 0,
      referredUsers: [],
    };

    usersDatabase.set(normalizedEmail, newUser);

    // Create active session
    const token = generateToken();
    const userAgent = req.headers['user-agent'] || 'Web Browser';
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const session: ServerSession = {
      id: `sess-${Date.now()}`,
      token,
      userId: newUser.id,
      device: userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
      ip: clientIp.replace('::ffff:', ''),
      loginAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
    };

    sessionsDatabase.set(token, session);

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered and secured session established.',
      token,
      user: sanitizeUser(newUser, token),
      session: {
        id: session.id,
        device: session.device,
        ip: session.ip,
        loginAt: session.loginAt,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Error during signup:', error);
    return res.status(500).json({ error: 'Registration failed due to an internal error.' });
  }
});

// 2. LOGIN ENDPOINT
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Both email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = usersDatabase.get(normalizedEmail);

    // Constant-time check or fail
    if (!user) {
      // Artificial delay to prevent timing attacks
      crypto.scryptSync(password, 'dummy_salt_for_timing', 64);
      return res.status(401).json({ error: 'Invalid email or password combination.' });
    }

    // Verify password
    const isMatch = verifyPassword(password, user.passwordSalt, user.passwordHash);

    // Fallback support for demo testing passwords
    const isDemoMatch =
      (user.email === 'alex.vance@apex-tesla.io' && (password === '123456' || password === 'TeslaPlaid2026!')) ||
      (user.email === 'admin.ops@apex-tesla.io' && (password === 'admin123' || password === 'AdminTesla2026!'));

    if (!isMatch && !isDemoMatch) {
      return res.status(401).json({ error: 'Invalid email or password combination.' });
    }

    // Generate new active session
    const token = generateToken();
    const userAgent = req.headers['user-agent'] || 'Web Browser';
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const session: ServerSession = {
      id: `sess-${Date.now()}`,
      token,
      userId: user.id,
      device: userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Device',
      ip: clientIp.replace('::ffff:', ''),
      loginAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
    };

    sessionsDatabase.set(token, session);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: sanitizeUser(user, token),
      session: {
        id: session.id,
        device: session.device,
        ip: session.ip,
        loginAt: session.loginAt,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Authentication failed due to an internal error.' });
  }
});

// 3. GET CURRENT AUTHENTICATED USER & SESSION (/me)
authRouter.get('/me', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const session = (req as any).session as ServerSession;

  return res.json({
    success: true,
    user: sanitizeUser(user, session.token),
    session: {
      id: session.id,
      device: session.device,
      ip: session.ip,
      loginAt: session.loginAt,
      expiresAt: session.expiresAt,
    },
  });
});

// 4. LOGOUT ENDPOINT
authRouter.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : (req.headers['x-session-token'] as string);

  if (token && sessionsDatabase.has(token)) {
    const session = sessionsDatabase.get(token)!;
    session.status = 'revoked';
  }

  return res.json({ success: true, message: 'Session successfully revoked and user logged out.' });
});

// 5. REVOKE ALL SESSIONS (Session Management)
authRouter.post('/revoke-all-sessions', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const currentSession = (req as any).session as ServerSession;

  for (const session of sessionsDatabase.values()) {
    if (session.userId === user.id && session.id !== currentSession.id) {
      session.status = 'revoked';
    }
  }

  return res.json({
    success: true,
    message: 'All other active sessions have been terminated.',
    user: sanitizeUser(user, currentSession.token),
  });
});

// 6. UPDATE PROFILE & BIO DETAILS
authRouter.put('/profile', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const session = (req as any).session as ServerSession;
  const { name, phone, bio, location, preferredServiceCenter, avatar } = req.body;

  if (name && typeof name === 'string') user.name = name.trim();
  if (phone !== undefined) user.phone = String(phone).trim();
  if (bio !== undefined) user.bio = String(bio).trim();
  if (location !== undefined) user.location = String(location).trim();
  if (preferredServiceCenter !== undefined) user.preferredServiceCenter = String(preferredServiceCenter).trim();
  if (avatar && typeof avatar === 'string') user.avatar = avatar.trim();

  return res.json({
    success: true,
    message: 'Profile and bio details updated successfully.',
    user: sanitizeUser(user, session.token),
  });
});

// 7. CHANGE PASSWORD
authRouter.put('/change-password', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as StoredUser;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current password and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  const isCurrentValid = verifyPassword(currentPassword, user.passwordSalt, user.passwordHash);
  if (!isCurrentValid) {
    return res.status(401).json({ error: 'Current password provided is incorrect.' });
  }

  const { salt, hash } = hashPassword(newPassword);
  user.passwordSalt = salt;
  user.passwordHash = hash;

  return res.json({
    success: true,
    message: 'Password successfully changed and encrypted.',
  });
});

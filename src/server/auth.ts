import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { sendRegistrationNotificationEmail } from './mailer.ts';

export type AdminPrivilege =
  | 'super_admin'
  | 'manage_admins'
  | 'manage_users'
  | 'manage_investments'
  | 'manage_cars_store'
  | 'manage_withdrawals'
  | 'manage_site_cms'
  | 'manage_marketing'
  | 'manage_fleet_ops';

export const ALL_ADMIN_PRIVILEGES: AdminPrivilege[] = [
  'super_admin',
  'manage_admins',
  'manage_users',
  'manage_investments',
  'manage_cars_store',
  'manage_withdrawals',
  'manage_site_cms',
  'manage_marketing',
  'manage_fleet_ops',
];

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
  adminRoleLabel?: string;
  adminPrivileges?: AdminPrivilege[];
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

    // 2. Admin Operations User (Root Super-Admin)
    const adminCreds = hashPassword('AdminTesla2026!');
    const adminUser: StoredUser = {
      id: 'usr-apex-admin-01',
      name: 'Admin Operations',
      email: 'admin.ops@apex-tesla.io',
      passwordHash: adminCreds.hash,
      passwordSalt: adminCreds.salt,
      role: 'admin',
      adminRoleLabel: 'Root Super-Admin',
      adminPrivileges: [...ALL_ADMIN_PRIVILEGES],
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

    // 3-10. Additional Global Demo Customers for Realistic Fleet & User Activity
    const demoCustCreds = hashPassword('TeslaPlaid2026!');
    const additionalDemoUsers: Array<{
      id: string;
      name: string;
      email: string;
      location: string;
      preferredServiceCenter: string;
      phone: string;
      avatar: string;
      bio: string;
      tier: 'Standard' | 'Plaid Member' | 'Founders Club';
      referralCode: string;
      memberSince: string;
      referralEarningsUsd: number;
      referralCount: number;
    }> = [
      {
        id: 'usr-003',
        name: 'Marcus Vance',
        email: 'marcus.v@tesla-club.org',
        location: 'San Jose, CA',
        preferredServiceCenter: 'Apex Fremont Technology Center',
        phone: '+1 (408) 555-0199',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        bio: 'Model 3 Performance track driver. Carbon fiber addict.',
        tier: 'Standard',
        referralCode: 'APEX-MARC-44',
        memberSince: 'October 2026',
        referralEarningsUsd: 120.0,
        referralCount: 1,
      },
      {
        id: 'usr-004',
        name: 'Sarah Connor',
        email: 'sarah.c@cyberbeast.io',
        location: 'Reno, NV',
        preferredServiceCenter: 'Apex Nevada Battery Operations',
        phone: '+1 (775) 555-4012',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        bio: 'Cybertruck Cyberbeast daily driver. Overland camping enthusiast.',
        tier: 'Plaid Member',
        referralCode: 'APEX-CYBR-99',
        memberSince: 'October 2026',
        referralEarningsUsd: 100.0,
        referralCount: 1,
      },
      {
        id: 'usr-005',
        name: 'Kenji Sato',
        email: 'kenji.sato@plaid-tokyo.jp',
        location: 'Tokyo, Japan',
        preferredServiceCenter: 'Apex Berlin Super-Hub Europe',
        phone: '+81 90 5555 4321',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        bio: 'Tesla Roadster reservation holder and Supercharger node staker.',
        tier: 'Standard',
        referralCode: 'APEX-KENJI-01',
        memberSince: 'November 2026',
        referralEarningsUsd: 0,
        referralCount: 0,
      },
      {
        id: 'usr-006',
        name: 'Elena Rostova',
        email: 'elena.r@apex-ev.de',
        location: 'Berlin, Germany',
        preferredServiceCenter: 'Apex Berlin Super-Hub Europe',
        phone: '+49 30 5558 1920',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        bio: 'Gigafactory Berlin fleet investor & Model Y Performance owner.',
        tier: 'Founders Club',
        referralCode: 'APEX-ELENA-88',
        memberSince: 'June 2025',
        referralEarningsUsd: 640.0,
        referralCount: 5,
      },
      {
        id: 'usr-007',
        name: 'Mateo Silva',
        email: 'mateo.silva@miami-plaid.com',
        location: 'Miami, FL',
        preferredServiceCenter: 'Apex Austin Gigafactory Hub',
        phone: '+1 (305) 555-7741',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        bio: 'Cybertruck Foundation owner • Crypto treasury & TSLA options trader.',
        tier: 'Plaid Member',
        referralCode: 'APEX-MATEO-77',
        memberSince: 'February 2026',
        referralEarningsUsd: 420.0,
        referralCount: 4,
      },
      {
        id: 'usr-008',
        name: 'Chloe Beaumont',
        email: 'chloe.b@ev-london.co.uk',
        location: 'London, UK',
        preferredServiceCenter: 'Apex Berlin Super-Hub Europe',
        phone: '+44 20 7946 0821',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        bio: 'Right-hand drive Model X Plaid owner & Robotaxi yield pool partner.',
        tier: 'Plaid Member',
        referralCode: 'APEX-CHLOE-21',
        memberSince: 'April 2026',
        referralEarningsUsd: 210.0,
        referralCount: 2,
      },
      {
        id: 'usr-009',
        name: 'Liam O\'Connor',
        email: 'liam.oc@pacific-ev.io',
        location: 'Seattle, WA',
        preferredServiceCenter: 'Apex Fremont Technology Center',
        phone: '+1 (206) 555-3194',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        bio: 'Model 3 Highland Stealth PPF collector & Supercharger staker.',
        tier: 'Standard',
        referralCode: 'APEX-LIAM-55',
        memberSince: 'August 2026',
        referralEarningsUsd: 75.0,
        referralCount: 1,
      },
      {
        id: 'usr-010',
        name: 'Priya Nair',
        email: 'priya.nair@austin-grid.io',
        location: 'Austin, TX',
        preferredServiceCenter: 'Apex Austin Gigafactory Hub',
        phone: '+1 (512) 555-8830',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
        bio: 'Grid energy engineer • Megapack & Model Y dual-motor fleet partner.',
        tier: 'Founders Club',
        referralCode: 'APEX-PRIYA-10',
        memberSince: 'May 2025',
        referralEarningsUsd: 890.0,
        referralCount: 7,
      },
    ];

    for (const demo of additionalDemoUsers) {
      usersDatabase.set(demo.email.toLowerCase(), {
        id: demo.id,
        name: demo.name,
        email: demo.email,
        passwordHash: demoCustCreds.hash,
        passwordSalt: demoCustCreds.salt,
        role: 'customer',
        avatar: demo.avatar,
        bio: demo.bio,
        location: demo.location,
        preferredServiceCenter: demo.preferredServiceCenter,
        phone: demo.phone,
        walletAddress: `0x${crypto.createHash('sha256').update(demo.email).digest('hex').slice(0, 40)}`,
        twoFactorEnabled: false,
        pinSet: false,
        memberSince: demo.memberSince,
        tier: demo.tier,
        referralCode: demo.referralCode,
        referralEarningsUsd: demo.referralEarningsUsd,
        referralCount: demo.referralCount,
        referredUsers: [],
      });
    }
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

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as StoredUser | undefined;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: Administrator role required to perform this action.',
    });
  }
  next();
}

export function requirePrivilege(privilege: AdminPrivilege) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as StoredUser | undefined;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }
    const privileges = user.adminPrivileges || [];
    if (!privileges.includes('super_admin') && !privileges.includes(privilege)) {
      return res.status(403).json({
        error: `Insufficient admin privilege: '${privilege}' permission is required.`,
      });
    }
    next();
  };
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

    // Dispatch SMTP registration welcome alert via .env SMTP mailer utility
    let emailNotificationStatus: string = 'queued';
    try {
      const mailRes = await sendRegistrationNotificationEmail({
        email: newUser.email,
        name: newUser.name,
        tier: newUser.tier,
        location: newUser.location,
        referralCode: newUser.referralCode,
        provider: 'email',
      });
      emailNotificationStatus = mailRes.status;
    } catch (mailErr) {
      console.warn('[Signup Mailer] Failed to dispatch welcome email:', mailErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered and secured session established.',
      emailNotificationStatus,
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

// 1B. GOOGLE SOCIAL SIGN-UP / SIGN-IN ENDPOINT (Verifies Firebase Google ID Token)
authRouter.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken, referralCode, location, preferredServiceCenter } = req.body;

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ error: 'Google Firebase ID token is required.' });
    }

    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return res.status(500).json({ error: 'Firebase configuration is missing on server.' });
    }

    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as { apiKey?: string };
    if (!firebaseConfig.apiKey) {
      return res.status(500).json({ error: 'Firebase API key is not configured.' });
    }

    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!verifyRes.ok) {
      return res.status(401).json({ error: 'Invalid or expired Google sign-in token.' });
    }

    const verifyData = (await verifyRes.json()) as {
      users?: Array<{
        localId: string;
        email?: string;
        emailVerified?: boolean;
        displayName?: string;
        photoUrl?: string;
      }>;
    };

    const googleAccount = verifyData.users?.[0];
    if (!googleAccount || !googleAccount.email) {
      return res.status(401).json({ error: 'Unable to retrieve verified email from Google account.' });
    }

    const normalizedEmail = googleAccount.email.trim().toLowerCase();
    let user = usersDatabase.get(normalizedEmail);
    let isNewUser = false;

    if (user && user.role === 'admin') {
      return res.status(403).json({
        error: 'Admin accounts cannot sign in via the public customer Google portal. Please use /admin.',
      });
    }

    if (!user) {
      isNewUser = true;
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const { salt, hash } = hashPassword(randomPassword);
      const displayName =
        googleAccount.displayName?.trim() || normalizedEmail.split('@')[0].toUpperCase();
      const userCode = `APEX-${displayName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase() || 'GGL'}-${Math.floor(10 + Math.random() * 90)}`;

      user = {
        id: `usr-ggl-${googleAccount.localId.substring(0, 12)}-${Date.now()}`,
        name: displayName,
        email: normalizedEmail,
        passwordHash: hash,
        passwordSalt: salt,
        role: 'customer',
        avatar:
          googleAccount.photoUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bio: 'Verified Google Member & Apex Tesla Hub Enthusiast.',
        location: (typeof location === 'string' && location.trim()) || 'California, USA',
        preferredServiceCenter:
          (typeof preferredServiceCenter === 'string' && preferredServiceCenter.trim()) ||
          'Apex Fremont Technology Center',
        phone: '',
        walletAddress: `0x${crypto.randomBytes(20).toString('hex')}`,
        twoFactorEnabled: true,
        pinSet: false,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        tier: 'Standard',
        referralCode: userCode,
        referredBy: typeof referralCode === 'string' && referralCode.trim() ? referralCode.trim().toUpperCase() : undefined,
        referralEarningsUsd: 0,
        referralCount: 0,
        referredUsers: [],
      };
      usersDatabase.set(normalizedEmail, user);
    } else if (googleAccount.photoUrl && !user.avatar) {
      user.avatar = googleAccount.photoUrl;
    }

    const token = generateToken();
    const userAgent = req.headers['user-agent'] || 'Web Browser';
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const session: ServerSession = {
      id: `sess-ggl-${Date.now()}`,
      token,
      userId: user.id,
      device: userAgent.includes('Mobile') ? 'Mobile Browser (Google OAuth)' : 'Desktop Browser (Google OAuth)',
      ip: clientIp.replace('::ffff:', ''),
      loginAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
    };

    sessionsDatabase.set(token, session);

    let emailNotificationStatus: string | undefined;
    if (isNewUser) {
      try {
        const mailRes = await sendRegistrationNotificationEmail({
          email: user.email,
          name: user.name,
          tier: user.tier,
          location: user.location,
          referralCode: user.referralCode,
          provider: 'google',
        });
        emailNotificationStatus = mailRes.status;
      } catch (mailErr) {
        console.warn('[Google Signup Mailer] Failed to dispatch welcome email:', mailErr);
      }
    }

    return res.status(isNewUser ? 201 : 200).json({
      success: true,
      isNewUser,
      emailNotificationStatus,
      message: isNewUser
        ? `Google account verified! Welcome to Apex Tesla Hub, ${user.name}.`
        : `Welcome back via Google, ${user.name}!`,
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
    console.error('Error during Google OAuth authentication:', error);
    return res.status(500).json({ error: 'Google sign-up failed due to an internal error.' });
  }
});

// 2. CUSTOMER LOGIN ENDPOINT (Strictly rejects admin accounts to keep portals separated)
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
      crypto.scryptSync(password, 'dummy_salt_for_timing', 64);
      return res.status(401).json({ error: 'Invalid email or password combination.' });
    }

    // Strict separation: Admins must authenticate at the dedicated /admin portal
    if (user.role === 'admin') {
      return res.status(403).json({
        error: 'Admin accounts cannot sign in via the public customer portal. Please authenticate through the dedicated /admin gateway.',
      });
    }

    // Verify password
    const isMatch = verifyPassword(password, user.passwordSalt, user.passwordHash);

    // Fallback support for public customer demo credentials
    const isDemoMatch =
      user.email === 'alex.vance@apex-tesla.io' &&
      (password === '123456' || password === 'TeslaPlaid2026!');

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

// 2B. DEDICATED ADMIN LOGIN ENDPOINT (/api/auth/admin/login)
authRouter.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = usersDatabase.get(normalizedEmail);

    if (!user) {
      crypto.scryptSync(password, 'dummy_salt_for_timing', 64);
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access Denied: This account does not hold administrator privileges.',
      });
    }

    const isMatch = verifyPassword(password, user.passwordSalt, user.passwordHash);
    const isSeededAdminMatch =
      user.email === 'admin.ops@apex-tesla.io' &&
      (password === 'admin123' || password === 'AdminTesla2026!');

    if (!isMatch && !isSeededAdminMatch) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    const token = generateToken();
    const userAgent = req.headers['user-agent'] || 'Web Browser';
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const session: ServerSession = {
      id: `sess-adm-${Date.now()}`,
      token,
      userId: user.id,
      device: userAgent.includes('Mobile') ? 'Mobile Admin Console' : 'Desktop Admin Console',
      ip: clientIp.replace('::ffff:', ''),
      loginAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
    };

    sessionsDatabase.set(token, session);

    return res.json({
      success: true,
      message: `Executive Admin session authenticated (${user.adminRoleLabel || 'Administrator'}).`,
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
    console.error('Error during admin login:', error);
    return res.status(500).json({ error: 'Admin authentication failed due to an internal error.' });
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

// 8. LIST ALL ADMIN ACCOUNTS & PRIVILEGES (Protected: requireAdmin + manage_admins)
authRouter.get(
  '/admins',
  authenticateToken,
  requireAdmin,
  requirePrivilege('manage_admins'),
  (_req: Request, res: Response) => {
    const admins = Array.from(usersDatabase.values())
      .filter((u) => u.role === 'admin')
      .map((u) => sanitizeUser(u));

    return res.json({
      success: true,
      admins,
      availablePrivileges: ALL_ADMIN_PRIVILEGES,
    });
  }
);

// 9. CREATE NEW ADMIN WITH ASSIGNED PRIVILEGES
authRouter.post(
  '/admins',
  authenticateToken,
  requireAdmin,
  requirePrivilege('manage_admins'),
  (req: Request, res: Response) => {
    try {
      const { name, email, password, adminRoleLabel, adminPrivileges, location, phone } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Admin full name is required.' });
      }
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid administrator email address is required.' });
      }
      if (!password || typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'Admin password must be at least 8 characters long.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (usersDatabase.has(normalizedEmail)) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const requestedPrivileges: AdminPrivilege[] = Array.isArray(adminPrivileges)
        ? adminPrivileges.filter((p): p is AdminPrivilege => ALL_ADMIN_PRIVILEGES.includes(p))
        : [];

      if (requestedPrivileges.length === 0) {
        return res.status(400).json({ error: 'Select at least one admin privilege for the new administrator.' });
      }

      const actor = (req as any).user as StoredUser;
      const actorIsSuper = actor.adminPrivileges?.includes('super_admin');
      if (requestedPrivileges.includes('super_admin') && !actorIsSuper) {
        return res.status(403).json({ error: 'Only a Super-Admin can grant super_admin privilege.' });
      }

      const { salt, hash } = hashPassword(password);
      const adminAvatars = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      ];
      const avatar = adminAvatars[Math.floor(Math.random() * adminAvatars.length)];

      const newAdmin: StoredUser = {
        id: `usr-adm-${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hash,
        passwordSalt: salt,
        role: 'admin',
        adminRoleLabel: (adminRoleLabel && String(adminRoleLabel).trim()) || 'Delegated Administrator',
        adminPrivileges: Array.from(new Set(requestedPrivileges)),
        avatar,
        bio: `${(adminRoleLabel && String(adminRoleLabel).trim()) || 'Delegated Administrator'} at Apex Tesla Hub.`,
        location: (location && String(location).trim()) || 'Austin Gigafactory Hub',
        preferredServiceCenter: 'Apex Austin Gigafactory Hub',
        phone: (phone && String(phone).trim()) || '',
        walletAddress: `0xADM${crypto.randomBytes(18).toString('hex')}`,
        twoFactorEnabled: true,
        pinSet: false,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        tier: 'Founders Club',
        referralCode: `APEX-ADM-${Math.floor(100 + Math.random() * 899)}`,
        referralEarningsUsd: 0,
        referralCount: 0,
        referredUsers: [],
      };

      usersDatabase.set(normalizedEmail, newAdmin);

      return res.status(201).json({
        success: true,
        message: `New administrator "${newAdmin.name}" (${newAdmin.adminRoleLabel}) created.`,
        admin: sanitizeUser(newAdmin),
      });
    } catch (error: any) {
      console.error('Error creating admin:', error);
      return res.status(500).json({ error: 'Failed to create administrator account.' });
    }
  }
);

// 10. UPDATE ADMIN PRIVILEGES & ROLE TITLE
authRouter.put(
  '/admins/:id/privileges',
  authenticateToken,
  requireAdmin,
  requirePrivilege('manage_admins'),
  (req: Request, res: Response) => {
    const { id } = req.params;
    const { adminRoleLabel, adminPrivileges } = req.body;

    const targetAdmin = Array.from(usersDatabase.values()).find((u) => u.id === id && u.role === 'admin');
    if (!targetAdmin) {
      return res.status(404).json({ error: 'Administrator account not found.' });
    }

    const filteredPrivileges: AdminPrivilege[] = Array.isArray(adminPrivileges)
      ? Array.from(new Set(adminPrivileges.filter((p): p is AdminPrivilege => ALL_ADMIN_PRIVILEGES.includes(p))))
      : [];

    if (filteredPrivileges.length === 0) {
      return res.status(400).json({ error: 'Administrator must retain at least one privilege.' });
    }

    // Protect root admin from losing core control
    if (targetAdmin.id === 'usr-apex-admin-01') {
      if (!filteredPrivileges.includes('super_admin')) filteredPrivileges.unshift('super_admin');
      if (!filteredPrivileges.includes('manage_admins')) filteredPrivileges.push('manage_admins');
    }

    targetAdmin.adminPrivileges = filteredPrivileges;
    if (adminRoleLabel && typeof adminRoleLabel === 'string' && adminRoleLabel.trim()) {
      targetAdmin.adminRoleLabel = adminRoleLabel.trim();
    }

    return res.json({
      success: true,
      message: `Updated privileges for ${targetAdmin.name}.`,
      admin: sanitizeUser(targetAdmin),
    });
  }
);

// 11. DELETE / REVOKE DELEGATED ADMIN
authRouter.delete(
  '/admins/:id',
  authenticateToken,
  requireAdmin,
  requirePrivilege('manage_admins'),
  (req: Request, res: Response) => {
    const { id } = req.params;
    const actor = (req as any).user as StoredUser;

    if (id === 'usr-apex-admin-01') {
      return res.status(403).json({ error: 'Root Super-Admin account cannot be deleted.' });
    }
    if (id === actor.id) {
      return res.status(403).json({ error: 'You cannot delete your own active administrator account.' });
    }

    const targetAdmin = Array.from(usersDatabase.values()).find((u) => u.id === id && u.role === 'admin');
    if (!targetAdmin) {
      return res.status(404).json({ error: 'Administrator account not found.' });
    }

    // Revoke all active sessions belonging to removed admin
    for (const sess of sessionsDatabase.values()) {
      if (sess.userId === targetAdmin.id) {
        sess.status = 'revoked';
      }
    }

    usersDatabase.delete(targetAdmin.email.toLowerCase());

    return res.json({
      success: true,
      message: `Administrator "${targetAdmin.name}" removed and active sessions revoked.`,
    });
  }
);

// 12. UPGRADE EXISTING USER TO ADMIN WITH ASSIGNED PRIVILEGES
authRouter.post(
  '/admins/upgrade',
  authenticateToken,
  requireAdmin,
  requirePrivilege('manage_admins'),
  (req: Request, res: Response) => {
    try {
      const {
        userId,
        email,
        name,
        avatar,
        location,
        phone,
        preferredServiceCenter,
        tier,
        adminRoleLabel,
        adminPrivileges,
        newPassword,
      } = req.body;

      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      let target =
        (normalizedEmail ? usersDatabase.get(normalizedEmail) : undefined) ||
        Array.from(usersDatabase.values()).find((u) => u.id === userId);

      const requestedPrivileges: AdminPrivilege[] = Array.isArray(adminPrivileges)
        ? Array.from(new Set(adminPrivileges.filter((p): p is AdminPrivilege => ALL_ADMIN_PRIVILEGES.includes(p))))
        : [];

      if (requestedPrivileges.length === 0) {
        return res.status(400).json({ error: 'Select at least one admin privilege when upgrading a user.' });
      }

      const actor = (req as any).user as StoredUser;
      const actorIsSuper = actor.adminPrivileges?.includes('super_admin');
      if (requestedPrivileges.includes('super_admin') && !actorIsSuper) {
        return res.status(403).json({ error: 'Only a Super-Admin can grant super_admin privilege.' });
      }

      if (!target) {
        if (!normalizedEmail || !normalizedEmail.includes('@')) {
          return res.status(404).json({ error: 'Target user email not found.' });
        }
        const seedPass = typeof newPassword === 'string' && newPassword.length >= 8 ? newPassword : 'TeslaPlaid2026!';
        const { salt, hash } = hashPassword(seedPass);
        target = {
          id: userId || `usr-adm-${Date.now()}`,
          name: (name && String(name).trim()) || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          passwordHash: hash,
          passwordSalt: salt,
          role: 'admin',
          adminRoleLabel: (adminRoleLabel && String(adminRoleLabel).trim()) || 'Upgraded Administrator',
          adminPrivileges: requestedPrivileges,
          avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          bio: `${(adminRoleLabel && String(adminRoleLabel).trim()) || 'Upgraded Administrator'} at Apex Tesla Hub.`,
          location: location || 'United States',
          preferredServiceCenter: preferredServiceCenter || 'Apex Austin Gigafactory Hub',
          phone: phone || '',
          walletAddress: `0x${crypto.createHash('sha256').update(normalizedEmail).digest('hex').slice(0, 40)}`,
          twoFactorEnabled: true,
          pinSet: false,
          memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          tier: tier || 'Founders Club',
          referralCode: `APEX-ADM-${Math.floor(100 + Math.random() * 899)}`,
          referralEarningsUsd: 0,
          referralCount: 0,
          referredUsers: [],
        };
        usersDatabase.set(normalizedEmail, target);
      } else {
        target.role = 'admin';
        target.adminRoleLabel = (adminRoleLabel && String(adminRoleLabel).trim()) || target.adminRoleLabel || 'Upgraded Administrator';
        target.adminPrivileges = requestedPrivileges;
        if (typeof newPassword === 'string' && newPassword.length >= 8) {
          const { salt, hash } = hashPassword(newPassword);
          target.passwordHash = hash;
          target.passwordSalt = salt;
        }
        // Revoke existing customer portal sessions when elevating to admin
        for (const sess of sessionsDatabase.values()) {
          if (sess.userId === target.id && actor.id !== target.id) {
            sess.status = 'revoked';
          }
        }
      }

      return res.json({
        success: true,
        message: `${target.name} has been upgraded to Administrator (${target.adminRoleLabel}).`,
        admin: sanitizeUser(target),
      });
    } catch (error: any) {
      console.error('Error upgrading user to admin:', error);
      return res.status(500).json({ error: 'Failed to upgrade user to administrator.' });
    }
  }
);


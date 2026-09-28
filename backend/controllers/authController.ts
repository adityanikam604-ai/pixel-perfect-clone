import { Request, Response } from 'express';
import { db } from '../../src/lib/db-store';
import { createTokenForUser, revokeToken, AuthenticatedRequest } from '../middleware/authMiddleware';

// Password credentials mapping for demo hospital environment
const CREDENTIALS: Record<string, string> = {
  'doctor@medguard.demo': 'doctor123',
  'nurse@medguard.demo': 'nurse123',
  'security@medguard.demo': 'security123',
  'admin@medguard.demo': 'admin123',
  'sameer@medguard.demo': 'sameer123',
  'priya.nair@medguard.demo': 'priya123',
  'anil.menon@medguard.demo': 'anil123',
  'vikram.patel@medguard.demo': 'vikram123',
};

// Track recent failed logins in-memory for Rule 1 (>= 5 in 5 minutes)
const failedAttemptsMap = new Map<string, { count: number; timestamps: number[] }>();

export const login = (req: Request, res: Response): void => {
  const { email, password } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '198.51.100.24';

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.getUserByEmail(email);
  const expectedPassword = CREDENTIALS[email.toLowerCase()];

  if (!user || expectedPassword !== password) {
    // Record failed login attempt
    db.addLoginAttempt({
      email,
      userId: user?.id,
      success: false,
      ipAddress: clientIp,
      failureReason: !user ? 'Unknown user account' : 'Invalid password',
    });

    // Anomaly Check: Repeated Failed Logins (Rule 1)
    const now = Date.now();
    const windowMs = 5 * 60 * 1000;
    const ipKey = clientIp;
    const tracker = failedAttemptsMap.get(ipKey) || { count: 0, timestamps: [] };
    
    // Filter timestamps inside window
    tracker.timestamps = tracker.timestamps.filter(t => now - t <= windowMs);
    tracker.timestamps.push(now);
    tracker.count = tracker.timestamps.length;
    failedAttemptsMap.set(ipKey, tracker);

    if (tracker.count >= 5) {
      // Create high-severity repeated failed login alert
      db.addAlert({
        alertType: 'REPEATED_FAILED_LOGIN',
        typeDisplayName: 'Multiple failed login attempts',
        userName: user?.name || `Target: ${email}`,
        userId: user?.id,
        userRole: user?.role,
        userDepartment: user?.department,
        severity: 'High',
        status: 'New',
        title: 'Potential brute-force authentication pattern',
        detail: `${tracker.count} failed sign-in attempts were recorded from ${clientIp} targeting ${email} within 5 minutes.`,
        ruleId: 'RULE-01-FAILED-LOGIN',
        evidence: {
          failedAttempts: tracker.count,
          threshold: 5,
          timeWindowMinutes: 5,
          ipAddress: clientIp,
          targetEmails: [email],
          trigger: 'Threshold exceeded (>= 5 failed attempts in 5 min)',
        },
        timestamp: 'Just now',
      });
    }

    res.status(401).json({
      error: 'Invalid email or password',
      failedAttemptsInWindow: tracker.count,
    });
    return;
  }

  // Successful login
  db.addLoginAttempt({
    email: user.email,
    userId: user.id,
    success: true,
    ipAddress: clientIp,
  });

  // Reset failed tracker on valid auth from this IP
  failedAttemptsMap.delete(clientIp);

  const token = createTokenForUser(user.id);

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
    },
  });
};

export const logout = (req: AuthenticatedRequest, res: Response): void => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    revokeToken(token);
  }
  res.json({ message: 'Logout successful' });
};

export const getCurrentUser = (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ user: req.user });
};

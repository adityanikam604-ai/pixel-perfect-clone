import { Request, Response, NextFunction } from 'express';
import { db } from '../../src/lib/db-store';
import { User, UserRole } from '../../src/lib/db-types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// In-memory token/session lookup for demonstration and Supabase Auth token verification
const tokenStore = new Map<string, string>(); // token -> userId

export function createTokenForUser(userId: string): string {
  const token = `mg_${userId.toLowerCase()}_${Date.now()}`;
  tokenStore.set(token, userId);
  return token;
}

export function revokeToken(token: string): void {
  tokenStore.delete(token);
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Check for demo fallback header or cookies
    const demoUserHeader = req.headers['x-demo-user-id'] as string;
    if (demoUserHeader) {
      const user = db.getUserById(demoUserHeader);
      if (user) {
        req.user = user;
        return next();
      }
    }
    res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
    return;
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  
  // Try direct demo token match
  let userId = tokenStore.get(token);
  
  // Also support direct ID demo pass: e.g. "Bearer USR-001"
  if (!userId && token.startsWith('USR-')) {
    userId = token;
  }

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }

  const user = db.getUserById(userId);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: User not found' });
    return;
  }

  req.user = user;
  next();
}

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../../src/lib/db-store';
import { UserRole } from '../../src/lib/db-types';

export function listUsers(req: AuthenticatedRequest, res: Response): void {
  try {
    const users = db.getUsers();
    res.json({
      data: users,
      count: users.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve users', message: error.message });
  }
}

export function getUserById(req: AuthenticatedRequest, res: Response): void {
  try {
    const user = db.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ data: user });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve user', message: error.message });
  }
}

export function createUser(req: AuthenticatedRequest, res: Response): void {
  try {
    const { name, email, role, department } = req.body;
    if (!name || !email || !role || !department) {
      res.status(400).json({ error: 'Missing required user fields (name, email, role, department)' });
      return;
    }

    const newUser = db.addUser({
      name,
      email,
      role: role as UserRole,
      department,
      status: 'Active',
    });

    res.status(201).json({
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create user', message: error.message });
  }
}

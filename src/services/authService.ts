import { supabase } from '../lib/supabase';
import { db } from '../lib/db-store';
import { UserRole } from '../lib/db-types';

export interface Account {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  department: string;
}

export interface AuthResponse {
  success: boolean;
  account?: Account;
  error?: string;
}

const defaultAccounts: Record<string, Account> = {
  doctor: { id: "USR-001", email: "doctor@medguard.demo", password: "doctor123", name: "Dr. Rahul Sharma", role: "Doctor", department: "Cardiology" },
  nurse: { id: "USR-002", email: "nurse@medguard.demo", password: "nurse123", name: "Neha Verma", role: "Nurse", department: "Cardiology" },
  security: { id: "USR-003", email: "security@medguard.demo", password: "security123", name: "Arjun Patel", role: "Security officer", department: "Security" },
  admin: { id: "USR-004", email: "admin@medguard.demo", password: "admin123", name: "Kavita Shah", role: "Administrator", department: "Operations" },
};

let memoryAccounts: Record<string, Account> = { ...defaultAccounts };

function getStoredAccounts(): Record<string, Account> {
  if (typeof window === 'undefined') return memoryAccounts;
  const stored = localStorage.getItem('medguard_accounts');
  if (stored) {
    try {
      return { ...defaultAccounts, ...JSON.parse(stored) };
    } catch {
      return defaultAccounts;
    }
  }
  return defaultAccounts;
}

export function saveAccount(account: Account): void {
  const accounts = getStoredAccounts();
  accounts[account.email.toLowerCase()] = account;
  memoryAccounts[account.email.toLowerCase()] = account;
  if (typeof window !== 'undefined') {
    localStorage.setItem('medguard_accounts', JSON.stringify(accounts));
  }
  db.addUser({
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    department: account.department,
    status: 'Active',
  });
  db.addAccessLog({
    userId: account.id,
    userName: account.name,
    userRole: account.role,
    userDepartment: account.department,
    action: 'SEARCH',
    emergencyMode: false,
    success: true,
    result: 'Allowed',
    reason: 'Account registered and synchronized',
    ipAddress: '127.0.0.1',
    riskLevel: 'Low',
  });
}

export function getAccountsList(): Account[] {
  return Object.values(getStoredAccounts());
}

/**
 * Register a new user using Supabase Auth & public.users table
 */
export async function registerWithSupabase(
  name: string,
  email: string,
  password: string,
  role: UserRole,
  department: string
): Promise<AuthResponse> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // 1. Basic Field Validation
  if (!cleanName) {
    return { success: false, error: 'Full name is required.' };
  }
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address (e.g. name@hospital.org).' };
  }
  if (!cleanPassword || cleanPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters in length.' };
  }

  // Check duplicate in known accounts
  const existingAccounts = getStoredAccounts();
  if (existingAccounts[cleanEmail]) {
    return {
      success: false,
      error: 'This email address is already registered. Please sign in.',
    };
  }

  // 2. Strict Role-Department Validation (PRD & RBAC Enforcement)
  const clinicalDepartments = ['Cardiology', 'Neurology', 'Pediatrics', 'Oncology', 'Orthopedics'];
  if ((role === 'Doctor' || role === 'Nurse') && !clinicalDepartments.includes(department)) {
    return {
      success: false,
      error: `Clinical staff (${role}) must be assigned to an authorized clinical department (${clinicalDepartments.join(', ')}).`,
    };
  }
  if (role === 'Security officer' && department !== 'Security') {
    return {
      success: false,
      error: 'Security Officers must be assigned to the Security department.',
    };
  }
  if (role === 'Administrator' && department !== 'Operations') {
    return {
      success: false,
      error: 'Administrators must be assigned to the Operations department.',
    };
  }

  const userId = `USR-${Math.floor(100 + Math.random() * 900)}`;
  const account: Account = {
    id: userId,
    email: cleanEmail,
    password: cleanPassword,
    name: cleanName,
    role,
    department,
  };

  // 3. Supabase Auth Registration
  if (supabase) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            name: account.name,
            role: account.role,
            department: account.department,
          },
        },
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already exists')) {
          return {
            success: false,
            error: 'This email address is already registered. Please sign in.',
          };
        }
        if (msg.includes('password') || msg.includes('weak')) {
          return {
            success: false,
            error: 'Password is too weak. Please use at least 6 characters.',
          };
        }
        if (msg.includes('invalid') || msg.includes('valid email')) {
          return {
            success: false,
            error: `Invalid email: ${authError.message}`,
          };
        }
        if (msg.includes('rate limit')) {
          console.warn('[Supabase Auth Rate Limit]: Free tier email limit reached; creating profile in database and storage.');
        } else {
          return {
            success: false,
            error: authError.message || 'Supabase authentication failed. Please try again.',
          };
        }
      }

      // 4. Create or Update User Profile in public.users table
      const authUserId = authData?.user?.id || null;
      account.id = userId;

      try {
        const payload: Record<string, any> = {
          id: userId,
          name: account.name,
          email: cleanEmail,
          role: account.role,
          department: account.department,
          status: 'Active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (authUserId) {
          payload.auth_user_id = authUserId;
        }

        let { error: dbError } = await supabase.from('users').upsert(payload, { onConflict: 'email' });

        if (dbError && dbError.message.includes('auth_user_id')) {
          delete payload.auth_user_id;
          const retry = await supabase.from('users').upsert(payload, { onConflict: 'email' });
          dbError = retry.error;
        }

        if (dbError) {
          console.warn('[Supabase users table insert warning]:', dbError.message);
        }
      } catch (dbErr: any) {
        console.warn('[Supabase users table catch]:', dbErr?.message);
      }

      // Log successful registration in public.login_attempts
      try {
        await supabase.from('login_attempts').insert({
          email: cleanEmail,
          user_id: account.id,
          success: true,
          ip_address: '127.0.0.1',
        });
      } catch {}
    } catch (err: any) {
      console.warn('[Supabase Register Error]:', err?.message);
      return {
        success: false,
        error: err?.message || 'Failed to connect to authentication server.',
      };
    }
  }

  // 5. Save locally and in database store
  saveAccount(account);

  return {
    success: true,
    account,
  };
}

/**
 * Log in with Email & Password using Supabase Auth (with instant demo fallback)
 */
export async function loginWithSupabase(email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase();
  const clientIp = '127.0.0.1';

  // 1. If Supabase is connected, attempt Supabase Auth SignIn
  if (supabase) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!authError && authData?.user) {
        // Fetch extended user profile from public.users table
        let userRecord = null;
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .or(`auth_user_id.eq.${authData.user.id},email.eq.${cleanEmail}`)
            .maybeSingle();
          if (!error && data) {
            userRecord = data;
          }
        } catch {
          // Schema fallback if column not yet added
        }

        if (!userRecord) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();
          userRecord = data;
        }

        const metadata: Record<string, any> = authData.user.user_metadata || {};
        const account: Account = {
          id: userRecord?.id || `USR-${Math.floor(100 + Math.random() * 900)}`,
          email: cleanEmail,
          password,
          name: userRecord?.name || (metadata['name'] as string) || cleanEmail.split('@')[0],
          role: (userRecord?.role as UserRole) || (metadata['role'] as UserRole) || 'Doctor',
          department: userRecord?.department || (metadata['department'] as string) || 'Cardiology',
        };

        // Record successful login in Supabase
        try {
          await supabase.from('login_attempts').insert({
            email: cleanEmail,
            user_id: account.id,
            success: true,
            ip_address: clientIp,
          });
        } catch {}

        if (typeof window !== 'undefined') {
          localStorage.setItem('medguard_current_user', JSON.stringify(account));
        }

        saveAccount(account);
        return { success: true, account };
      }
    } catch (err: any) {
      console.warn('[Supabase Auth Login Check]:', err?.message);
    }
  }

  // 2. Fallback: Authenticate against local/demo accounts list (Doctor, Nurse, Security, Admin, etc.)
  const localAccount = authenticate(cleanEmail, password);
  if (localAccount) {
    if (supabase) {
      void supabase.from('login_attempts').insert({
        email: cleanEmail,
        user_id: localAccount.id,
        success: true,
        ip_address: clientIp,
      });
    }
    return { success: true, account: localAccount };
  }

  // 3. Record failed login attempt in both Supabase & local DB
  if (supabase) {
    void supabase.from('login_attempts').insert({
      email: cleanEmail,
      success: false,
      failure_reason: 'Invalid credentials',
      ip_address: clientIp,
    });
  }

  db.addLoginAttempt({
    email: cleanEmail,
    success: false,
    failureReason: 'Invalid credentials',
    ipAddress: clientIp,
  });

  return {
    success: false,
    error: 'Invalid hospital email or password. Please check your credentials or register a new account.',
  };
}

/**
 * Synchronous local auth helper
 */
export function authenticate(email: string, password?: string): Account | null {
  const accounts = getStoredAccounts();
  const found = Object.values(accounts).find(
    (acc) => acc.email.toLowerCase() === email.toLowerCase() && (!password || acc.password === password)
  );

  if (found) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('medguard_current_user', JSON.stringify(found));
    }
    return found;
  }
  return null;
}

export function getCurrentUser(): Account {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem('medguard_current_user');
    if (userJson) {
      try {
        const parsed = JSON.parse(userJson);
        if (parsed && parsed.email) return parsed;
      } catch {
        // Fallback
      }
    }
  }
  return { id: "USR-001", email: "doctor@medguard.demo", password: "doctor123", name: "Dr. Rahul Sharma", role: "Doctor", department: "Cardiology" };
}

export async function logoutSupabase(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {}
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('medguard_current_user');
  }
}

export function logout(): void {
  logoutSupabase();
}
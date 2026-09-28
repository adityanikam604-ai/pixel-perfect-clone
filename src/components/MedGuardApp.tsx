import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Download,
  Eye,
  FileKey2,
  FileText,
  Filter,
  Hospital,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings2,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Stethoscope,
  UserPlus,
  UserRound,
  Users,
  X,
  Zap,
  Loader2,
  Database,
} from "lucide-react";
import { patients as staticPatients } from "../lib/medguard-data";
import { db } from "../lib/db-store";
import { Alert, AlertStatus, UserRole } from "../lib/db-types";
import {
  authenticate,
  getCurrentUser,
  saveAccount,
  logout as authLogout,
  Account,
  loginWithSupabase,
  registerWithSupabase,
} from "../services/authService";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  canAccessPage,
  getDefaultRouteForRole,
  hasPermission,
  normalizeRole,
  Permission,
} from "../lib/rbac";

type Page =
  | "login"
  | "dashboard"
  | "patients"
  | "patient-detail"
  | "activity"
  | "emergency"
  | "security-dashboard"
  | "alerts"
  | "investigation"
  | "logs"
  | "users"
  | "rules"
  | "profile";

const navClinical = [
  { href: "/doctor/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/patients", label: "Patients", Icon: Users },
  { href: "/activity", label: "Recent activity", Icon: Clock3 },
  { href: "/profile", label: "Profile", Icon: UserRound },
];

const navSecurity = [
  { href: "/security/dashboard", label: "Security dashboard", Icon: LayoutDashboard },
  { href: "/security/alerts", label: "Alerts", Icon: ShieldAlert },
  { href: "/security/logs", label: "Access logs", Icon: FileText },
  { href: "/security/users", label: "Users", Icon: Users },
  { href: "/security/rules", label: "Security rules", Icon: SlidersHorizontal },
  { href: "/profile", label: "Profile", Icon: UserRound },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-xl bg-brand text-brand-foreground shadow-sm">
        <Shield size={21} strokeWidth={1.8} />
      </div>
      {!compact && (
        <div>
          <div className="font-display text-[19px] font-extrabold tracking-[-0.03em] text-foreground">MedGuard</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.17em] text-muted-foreground">Clinical access security</div>
        </div>
      )}
    </div>
  );
}

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-brand/40 hover:bg-brand-soft hover:text-brand"
    >
      {children}
    </button>
  );
}

function StatusBadge({ children, tone = "success" }: { children: React.ReactNode; tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
  const colors = {
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
    info: "bg-info text-info-foreground",
    neutral: "bg-secondary text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${colors[tone]}`}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">{eyebrow}</div>}
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.04em] text-foreground sm:text-[35px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, note, icon: Icon, tone = "brand" }: { label: string; value: string; note: string; icon: React.ElementType; tone?: "brand" | "success" | "warning" | "danger" }) {
  const tones = {
    brand: "bg-brand-soft text-brand",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground">{label}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-[32px] font-extrabold tracking-[-0.05em] text-foreground">{value}</span>
            <span className="text-[11px] font-medium text-muted-foreground">{note}</span>
          </div>
        </div>
        <div className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={18} strokeWidth={1.7} />
        </div>
      </div>
    </div>
  );
}

function Sidebar({ page, security = false, mobileOpen, setMobileOpen }: { page: Page; security?: boolean; mobileOpen: boolean; setMobileOpen: (open: boolean) => void }) {
  const [currentUser] = useState<Account>(() => getCurrentUser());
  const navigate = useNavigate();

  const isSecOrAdmin = currentUser.role === "Security officer" || currentUser.role === "Administrator";
  const items = useMemo(() => {
    if (currentUser.role === "Doctor" || currentUser.role === "Nurse") {
      return [
        { href: "/doctor/dashboard", label: "Dashboard", Icon: LayoutDashboard, badge: undefined },
        { href: "/patients", label: "Patients", Icon: Users, badge: undefined },
        { href: "/activity", label: "Recent activity", Icon: Clock3, badge: undefined },
        { href: "/profile", label: "Profile", Icon: UserRound, badge: undefined },
      ];
    }
    if (currentUser.role === "Security officer") {
      return [
        { href: "/security/dashboard", label: "Security dashboard", Icon: LayoutDashboard, badge: undefined },
        { href: "/security/alerts", label: "Alerts", Icon: ShieldAlert, badge: "3" },
        { href: "/security/logs", label: "Access logs", Icon: FileText, badge: undefined },
        { href: "/profile", label: "Profile", Icon: UserRound, badge: undefined },
      ];
    }
    // Administrator
    return [
      { href: "/security/users", label: "Users", Icon: Users, badge: undefined },
      { href: "/patients", label: "Patient records", Icon: FileText, badge: undefined },
      { href: "/security/logs", label: "Access logs", Icon: FileText, badge: undefined },
      { href: "/security/rules", label: "Security rules", Icon: SlidersHorizontal, badge: undefined },
      { href: "/profile", label: "Profile", Icon: UserRound, badge: undefined },
    ];
  }, [currentUser.role]);

  const current =
    page === "security-dashboard"
      ? "/security/dashboard"
      : page === "dashboard"
      ? "/doctor/dashboard"
      : page === "patients" || page === "patient-detail"
      ? "/patients"
      : page === "activity"
      ? "/activity"
      : page === "profile"
      ? "/profile"
      : page === "alerts" || page === "investigation"
      ? "/security/alerts"
      : page === "logs"
      ? "/security/logs"
      : page === "users"
      ? "/security/users"
      : page === "rules"
      ? "/security/rules"
      : "";

  const handleLogout = () => {
    authLogout();
    navigate({ to: "/" as any });
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-[255px] flex-col bg-brand px-4 py-5 text-brand-foreground transition-transform lg:static lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-10 flex items-center justify-between px-2">
        <Brand />
        <IconButton label="Close menu" onClick={() => setMobileOpen(false)}>
          <PanelLeftClose size={18} />
        </IconButton>
      </div>
      <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-foreground/55">
        {isSecOrAdmin ? "Security operations" : "Clinical workspace"}
      </div>
      <nav className="space-y-1">
        {items.map(({ href, label, Icon, badge }) => (
          <Link
            key={href}
            to={href as any}
            onClick={() => setMobileOpen(false)}
            className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition ${
              current === href ? "bg-brand-foreground/13 text-brand-foreground shadow-inner" : "text-brand-foreground/66 hover:bg-brand-foreground/8 hover:text-brand-foreground"
            }`}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
            {badge && <span className="ml-auto rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-danger-foreground">{badge}</span>}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-brand-foreground/12 bg-brand-foreground/7 p-4">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 text-brand-foreground/80">
            <Shield size={16} />
          </div>
          <div>
            <p className="text-xs font-bold">Protection active</p>
            <p className="mt-1 text-[11px] leading-4 text-brand-foreground/55">All access attempts are monitored and recorded.</p>
          </div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold text-brand-foreground/65 transition hover:bg-brand-foreground/8 hover:text-brand-foreground"
      >
        <LogOut size={18} />
        Log out
      </button>
    </aside>
  );
}

function AppShell({ children, page, security = false }: { children: React.ReactNode; page: Page; security?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Account>(() => getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar page={page} security={security} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <IconButton label="Open menu" onClick={() => setMobileOpen(true)}>
              <Menu size={19} />
            </IconButton>
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-muted-foreground sm:flex sm:w-[300px]">
              <Search size={17} />
              <span className="text-xs">Search patients, IDs, or records</span>
              <span className="ml-auto rounded-md border border-border px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">⌘ K</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IconButton label="Notifications">
              <Bell size={18} />
            </IconButton>
            <button
              onClick={() => navigate({ to: "/profile" as any })}
              className="flex items-center gap-2.5 border-l border-border pl-3 text-left"
            >
              <div className="grid size-9 place-items-center rounded-full bg-brand-soft text-xs font-extrabold text-brand">{initials || "MG"}</div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-foreground">{currentUser.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {currentUser.role} · {currentUser.department}
                </p>
              </div>
              <ChevronDown size={15} className="text-muted-foreground" />
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

// ==========================================
// ROLE-DEPENDENT DEPARTMENT CONFIGURATION
// ==========================================
function getDepartmentsForRole(role: UserRole): string[] {
  if (role === "Doctor" || role === "Nurse") {
    return ["Cardiology", "Neurology", "Pediatrics", "Oncology", "Orthopedics"];
  }
  if (role === "Security officer") {
    return ["Security"];
  }
  if (role === "Administrator") {
    return ["Operations"];
  }
  return ["Cardiology", "Neurology", "Pediatrics", "Oncology", "Orthopedics"];
}

// ==========================================
// ADD ACCOUNT / REGISTER MODAL COMPONENT (SUPABASE ENABLED)
// ==========================================
function AddAccountModal({ onClose, onCreated }: { onClose: () => void; onCreated: (acc: Account) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("pass123");
  const [role, setRole] = useState<UserRole>("Doctor");
  const [department, setDepartment] = useState("Cardiology");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    const validDepts = getDepartmentsForRole(newRole);
    if (!validDepts.includes(department)) {
      setDepartment(validDepts[0] || "Cardiology");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const validDepts = getDepartmentsForRole(role);
    const safeDept = (validDepts.includes(department) ? department : validDepts[0]) || "Cardiology";

    setError("");
    setLoading(true);

    try {
      const res = await registerWithSupabase(name, email, password, role, safeDept);
      if (!res.success || !res.account) {
        setError(res.error || "Failed to register account.");
        setLoading(false);
        return;
      }
      onCreated(res.account);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during registration.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-[480px] rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-brand text-brand-foreground">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-foreground">Register Staff Account</h2>
              <p className="text-xs text-muted-foreground">Create a new authorized personnel account</p>
            </div>
          </div>
          <IconButton label="Close modal" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>

        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          {error && <div className="rounded-lg bg-danger/10 border border-danger/20 px-3.5 py-2 text-xs font-bold text-danger">{error}</div>}

          <div>
            <label className="mb-1.5 block text-xs font-bold text-foreground">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Ayesha Roy"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-foreground">Hospital Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@medguard.org"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-foreground">Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-foreground">Role</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              >
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Security officer">Security Officer</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-foreground">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              >
                {getDepartmentsForRole(role).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-muted-foreground transition hover:bg-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-xs font-bold text-brand-foreground shadow-md transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Registering..." : "Save & Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// LOGIN & REGISTRATION PAGE (SUPABASE INTEGRATED)
// ==========================================
function LoginPage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("doctor@medguard.demo");
  const [password, setPassword] = useState("doctor123");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("Doctor");
  const [department, setDepartment] = useState("Cardiology");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState("");

  const demoQuickSelect = [
    { label: "Doctor", email: "doctor@medguard.demo", pass: "doctor123", icon: Stethoscope, dept: "Cardiology" },
    { label: "Nurse", email: "nurse@medguard.demo", pass: "nurse123", icon: Users, dept: "Cardiology" },
    { label: "Security", email: "security@medguard.demo", pass: "security123", icon: Shield, dept: "SecOps" },
    { label: "Admin", email: "admin@medguard.demo", pass: "admin123", icon: Settings2, dept: "Operations" },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    const validDepts = getDepartmentsForRole(newRole);
    if (!validDepts.includes(department)) {
      setDepartment(validDepts[0] || "Cardiology");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setCreatedSuccess("");
    setLoading(true);

    if (authMode === "login") {
      try {
        const res = await loginWithSupabase(email, password);
        if (!res.success || !res.account) {
          setError(res.error || "Invalid hospital email or password.");
          setLoading(false);
          return;
        }

        const target =
          res.account.role === "Security officer" || res.account.role === "Administrator"
            ? "/security/dashboard"
            : "/doctor/dashboard";

        navigate({ to: target as any });
      } catch (err: any) {
        setError(err?.message || "Login failed. Please check network connection.");
        setLoading(false);
      }
    } else {
      // Register Mode
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setError("Please enter your name, email, and password.");
        setLoading(false);
        return;
      }

      const validDepts = getDepartmentsForRole(role);
      const safeDept = (validDepts.includes(department) ? department : validDepts[0]) || "Cardiology";

      try {
        const res = await registerWithSupabase(fullName, email, password, role, safeDept);
        if (!res.success || !res.account) {
          setError(res.error || "Failed to register account.");
          setLoading(false);
          return;
        }

        setCreatedSuccess(`Account registered successfully for ${res.account.name}! You can now sign in with your credentials.`);
        setAuthMode("login");
        setEmail(email.trim().toLowerCase());
        setPassword("");
        setLoading(false);
      } catch (err: any) {
        setError(err?.message || "Registration error occurred.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-card lg:grid lg:grid-cols-[48%_52%]">
      <section className="relative hidden overflow-hidden bg-brand px-[8%] py-12 text-brand-foreground lg:flex lg:flex-col">
        <div className="absolute -left-28 -top-28 size-[450px] rounded-full border-[70px] border-brand-foreground/6" />
        <div className="absolute -bottom-40 -right-36 size-[520px] rounded-full border-[90px] border-brand-foreground/5" />
        <Brand />
        <div className="relative mt-[12vh] max-w-[530px]">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-foreground/65">Trusted clinical access</p>
          <h1 className="font-display text-[clamp(40px,4vw,60px)] font-extrabold leading-[1.05] tracking-[-0.055em]">
            Patient information,
            <br />
            protected at every access.
          </h1>
          <p className="mt-7 max-w-[500px] text-[16px] leading-7 text-brand-foreground/65">
            MedGuard continuously audits EHR queries, detects unauthorized department access, and provides explainable evidence for security teams.
          </p>
        </div>

        <div className="relative mt-auto max-w-[580px] rounded-[22px] border border-brand-foreground/18 bg-brand-foreground/7 p-5 shadow-2xl">
          <div className="absolute -right-4 -top-5 grid size-24 place-items-center rounded-[24px] border-[7px] border-brand bg-success text-success-foreground shadow-xl">
            <Shield size={39} strokeWidth={1.35} />
          </div>
          <div className="rounded-xl bg-card p-5 text-foreground">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand">
                <UserRound size={19} />
              </div>
              <div>
                <p className="text-sm font-bold">Patient record</p>
                <p className="text-xs text-muted-foreground">MG-10482 · Cardiology</p>
              </div>
              <StatusBadge>Verified</StatusBadge>
            </div>
            <div className="space-y-3 pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blood pressure</span>
                <b>118 / 76 mmHg</b>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last consultation</span>
                <b>Today, 08:42 AM</b>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accessed by</span>
                <b>Dr. Rahul Sharma</b>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-success px-3 py-2.5 text-xs font-semibold text-success-foreground">
              <Check size={15} />
              Access verified and securely logged in audit trail
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[480px]">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          
          <div className="mb-6">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.17em] text-brand">Hospital workspace</p>
            <h2 className="font-display text-[30px] font-extrabold tracking-[-0.05em] text-foreground">
              {authMode === "login" ? "Sign in to portal" : "Register new staff"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {authMode === "login" ? "Role-based authentication & session logging." : "Create new authorized staff credentials."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mb-5 flex rounded-xl border border-border bg-secondary/50 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setError("");
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                authMode === "login"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setError("");
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                authMode === "register"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register / Sign Up
            </button>
          </div>

          {createdSuccess && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-success px-4 py-3 text-xs font-bold text-success-foreground animate-in fade-in">
              <Check size={16} />
              {createdSuccess}
            </div>
          )}

          {/* Quick Select Persona Badges (Shown in Login mode) */}
          {authMode === "login" && (
            <div className="mb-6">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Demo Persona Quick Select
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {demoQuickSelect.map((demo) => {
                  const isSelected = email === demo.email;
                  const Icon = demo.icon;
                  return (
                    <button
                      key={demo.label}
                      type="button"
                      onClick={() => {
                        setEmail(demo.email);
                        setPassword(demo.pass);
                        setError("");
                      }}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition cursor-pointer ${
                        isSelected
                          ? "border-brand bg-brand-soft text-brand font-bold shadow-xs"
                          : "border-border bg-card text-muted-foreground hover:border-brand/40"
                      }`}
                    >
                      <Icon size={16} className="mb-1" />
                      <span className="text-xs">{demo.label}</span>
                      <span className="text-[9px] opacity-70">{demo.dept}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "register" && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Ayesha Roy"
                  className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                  required
                />
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-bold text-foreground">Hospital Email</span>
              <div className="flex items-center gap-3 rounded-xl border border-input bg-card px-4 py-2.5 transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                <Hospital size={17} className="text-muted-foreground" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={authMode === "register" ? "doctor@hospital.org" : "name@hospital.org"}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-bold text-foreground">Password</span>
              <div className="flex items-center gap-3 rounded-xl border border-input bg-card px-4 py-2.5 transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                <LockKeyhole size={17} className="text-muted-foreground" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-brand cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Eye size={17} />
                </button>
              </div>
            </label>

            {authMode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-foreground">Role</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Security officer">Security Officer</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-foreground">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                  >
                    {getDepartmentsForRole(role).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {authMode === "login" && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" defaultChecked className="size-4 accent-brand rounded" />
                  Remember credentials
                </label>
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="text-xs font-bold text-brand hover:underline cursor-pointer"
                >
                  New here? Register
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-danger/10 border border-danger/20 px-3.5 py-2.5 text-xs font-semibold text-danger">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/15 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowRight size={17} />
              )}
              {loading
                ? authMode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : authMode === "login"
                ? "Sign in securely"
                : "Complete Registration"}
            </button>
          </form>

          <div className="mt-6 flex gap-3 rounded-xl border border-border bg-secondary/40 p-3.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
              <Shield size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Authorized personnel only</p>
              <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                All logins and clinical queries are strictly audited for compliance and patient safety.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ==========================================
// DASHBOARD COMPONENTS
// ==========================================
function ActivityIcon(props: { size?: number; strokeWidth?: number }) {
  return <Zap {...props} />;
}

function PatientTable({ rows, onPatient }: { rows: typeof staticPatients; onPatient: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left">
        <thead className="bg-secondary/40 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-5 py-3.5">Patient ID</th>
            <th className="px-5 py-3.5">Patient name</th>
            <th className="px-5 py-3.5">Age</th>
            <th className="px-5 py-3.5">Department</th>
            <th className="px-5 py-3.5">Last access</th>
            <th className="px-5 py-3.5">Access</th>
            <th className="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((patient) => (
            <tr key={patient.id} className="group text-sm transition hover:bg-secondary/30">
              <td className="px-5 py-4 font-bold text-brand">{patient.id}</td>
              <td className="px-5 py-4">
                <button onClick={() => onPatient(patient.id)} className="flex items-center gap-3 text-left cursor-pointer">
                  <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-[10px] font-extrabold text-brand">
                    {patient.initials}
                  </span>
                  <span className="font-semibold text-foreground">{patient.name}</span>
                </button>
              </td>
              <td className="px-5 py-4 text-muted-foreground">{patient.age}</td>
              <td className="px-5 py-4 text-muted-foreground">{patient.department}</td>
              <td className="px-5 py-4 text-muted-foreground">{patient.lastAccess}</td>
              <td className="px-5 py-4">
                {patient.status === "Authorized" ? (
                  <StatusBadge>Authorized</StatusBadge>
                ) : (
                  <button
                    onClick={() => onPatient(patient.id)}
                    className="rounded-lg border border-brand px-2.5 py-1.5 text-[11px] font-bold text-brand transition hover:bg-brand hover:text-brand-foreground cursor-pointer"
                  >
                    Request access
                  </button>
                )}
              </td>
              <td className="px-5 py-4 text-right">
                <button
                  onClick={() => onPatient(patient.id)}
                  className="text-muted-foreground opacity-0 transition hover:text-brand group-hover:opacity-100 cursor-pointer"
                  aria-label={`Open ${patient.name}`}
                >
                  <ChevronRight size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Dashboard({ security = false }: { security?: boolean }) {
  const navigate = useNavigate();
  const [currentUser] = useState<Account>(() => getCurrentUser());

  if (security) return <SecurityDashboard />;

  return (
    <AppShell page="dashboard">
      <PageHeader
        eyebrow="Clinical workspace"
        title={`Good morning, ${currentUser.name}`}
        subtitle={`${currentUser.role} · ${currentUser.department}`}
        action={
          <div className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-muted-foreground sm:flex">
            <Clock3 size={16} />
            Live sync active
          </div>
        }
      />
      <div className="mb-7 flex items-center gap-3 rounded-2xl border border-warning/60 bg-warning/35 px-5 py-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-warning text-warning-foreground">
          <ShieldAlert size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">Suspicious access prevented</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            An unusual record request from an unrecognized device was blocked at 8:12 AM.
          </p>
        </div>
        <button
          onClick={() => navigate({ to: "/security/alerts" as any })}
          className="hidden rounded-lg border border-warning-foreground/30 bg-card px-3 py-2 text-xs font-bold text-warning-foreground sm:block cursor-pointer"
        >
          Review alert
        </button>
        <X size={17} className="text-warning-foreground/60" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned patients" value="24" note="3 new this week" icon={Users} />
        <StatCard label="Records viewed today" value="18" note="within normal range" icon={FileKey2} tone="success" />
        <StatCard label="Recent activities" value="7" note="last 24 hours" icon={ActivityIcon} tone="success" />
        <StatCard label="Access requests" value="3" note="2 awaiting review" icon={KeyRound} tone="warning" />
      </div>

      <div className="mt-7 rounded-2xl border border-border bg-card shadow-[0_6px_24px_-18px_var(--shadow-color)]">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-[-0.03em]">Patient records</h2>
            <p className="mt-1 text-xs text-muted-foreground">24 assigned patients · 5 shown</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate({ to: "/patients" as any })}
              className="flex items-center gap-2 rounded-xl bg-brand px-3.5 py-2.5 text-xs font-bold text-brand-foreground cursor-pointer"
            >
              <Eye size={15} />
              View All Patients
            </button>
          </div>
        </div>
        <PatientTable
          rows={staticPatients.slice(0, 5)}
          onPatient={(id) => navigate({ to: "/patients/$id" as any, params: { id } as any })}
        />
      </div>
    </AppShell>
  );
}

// ==========================================
// PATIENTS PAGE
// ==========================================
function PatientsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All");

  const visible = useMemo(() => {
    return staticPatients.filter((p) => {
      const matchDept = department === "All" || p.department.toLowerCase() === department.toLowerCase();
      const matchText = `${p.name} ${p.id} ${p.diagnosis} ${p.department}`.toLowerCase().includes(query.toLowerCase());
      return matchDept && matchText;
    });
  }, [query, department]);

  return (
    <AppShell page="patients">
      <PageHeader
        eyebrow="Clinical workspace"
        title="Patient records"
        subtitle="Access synthetic patient information based on your assigned clinical permissions."
        action={
          <button className="flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-xs font-bold text-brand-foreground shadow-xs cursor-pointer">
            <Download size={15} />
            Export list
          </button>
        }
      />
      <div className="rounded-2xl border border-border bg-card shadow-[0_6px_24px_-18px_var(--shadow-color)]">
        <div className="flex flex-col gap-3 border-b border-border p-5 md:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-input bg-secondary/40 px-3.5 py-2.5">
            <Search size={17} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search by patient name, ID, or diagnosis..."
            />
          </div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="rounded-xl border border-input bg-card px-4 py-2.5 text-xs font-bold text-foreground outline-none"
          >
            <option value="All">Department: All</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Oncology">Oncology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-secondary/40 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                {["Patient ID", "Patient", "Age / gender", "Department", "Diagnosis", "Assigned doctor", "Last access", "Status", ""].map((item) => (
                  <th key={item} className="px-5 py-3.5">{item}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((p) => (
                <tr key={p.id} className="text-sm hover:bg-secondary/30 transition">
                  <td className="px-5 py-4 font-bold text-brand">{p.id}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => navigate({ to: "/patients/$id" as any, params: { id: p.id } as any })}
                      className="flex items-center gap-3 font-semibold text-foreground hover:text-brand cursor-pointer"
                    >
                      <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-[10px] font-extrabold text-brand">
                        {p.initials}
                      </span>
                      {p.name}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{p.age} · {p.gender}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.department}</td>
                  <td className="px-5 py-4 font-medium">{p.diagnosis}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.doctor}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.lastAccess}</td>
                  <td className="px-5 py-4">
                    {p.status === "Authorized" ? <StatusBadge>Authorized</StatusBadge> : <StatusBadge tone="warning">Restricted</StatusBadge>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => navigate({ to: "/patients/$id" as any, params: { id: p.id } as any })}
                      aria-label="View patient"
                      className="text-muted-foreground hover:text-brand cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

// ==========================================
// PATIENT DETAIL PAGE
// ==========================================
const defaultPatient = {
  id: "MG-10482",
  name: "Aarav Mehta",
  initials: "AM",
  age: 58,
  gender: "Male" as const,
  department: "Cardiology",
  diagnosis: "Hypertension",
  history: "Longstanding hypertension with regular cardiac monitoring.",
  treatment: "Amlodipine 5mg daily; blood pressure review every 4 weeks.",
  doctor: "Dr. Rahul Sharma",
  lastAccess: "Today, 9:18 AM",
  status: "Authorized" as const,
};

function PatientDetail({ id }: { id?: string | undefined }) {
  const navigate = useNavigate();
  const matched = id ? staticPatients.find((p) => p.id === id) : staticPatients[0];
  const patient = matched ?? staticPatients[0] ?? defaultPatient;
  const [accessed, setAccessed] = useState(false);
  const [modal, setModal] = useState(false);
  const [currentUser] = useState<Account>(() => getCurrentUser());

  const isScopeMatch = currentUser.department.toLowerCase() === patient.department.toLowerCase();

  return (
    <AppShell page="patient-detail">
      <button
        onClick={() => navigate({ to: "/patients" as any })}
        className="mb-6 flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-brand cursor-pointer"
      >
        <ArrowLeft size={15} />
        Back to patient records
      </button>

      <PageHeader
        eyebrow="Protected record"
        title={patient.name}
        subtitle={`${patient.id} · ${patient.department}`}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setModal(true)}
              className="flex items-center gap-2 rounded-xl border border-brand px-4 py-3 text-xs font-bold text-brand cursor-pointer"
            >
              <KeyRound size={15} />
              Request access
            </button>
            <button
              onClick={() => setModal(true)}
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-xs font-bold text-brand-foreground shadow-xs cursor-pointer"
            >
              <Zap size={15} />
              Emergency access
            </button>
          </div>
        }
      />

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand-soft p-4">
        <div className="grid size-10 place-items-center rounded-full bg-card text-brand">
          <Shield size={19} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Sensitive patient information</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Your access to this record is monitored and securely logged.</p>
        </div>
        <div className="ml-auto">
          <StatusBadge tone="info">Protected</StatusBadge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-extrabold tracking-[-0.03em]">Patient overview</h2>
                <p className="mt-1 text-xs text-muted-foreground">Identity and care assignment</p>
              </div>
              <div className="grid size-12 place-items-center rounded-full bg-brand-soft text-sm font-extrabold text-brand">
                {patient.initials}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                ["Patient ID", patient.id],
                ["Age", `${patient.age} years`],
                ["Gender", patient.gender],
                ["Department", patient.department],
                ["Assigned doctor", patient.doctor],
                ["Last access", patient.lastAccess],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
            <h2 className="font-display text-lg font-extrabold tracking-[-0.03em]">Medical information</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <p className="text-[11px] font-semibold text-muted-foreground">Diagnosis</p>
                <p className="mt-1 text-sm font-bold text-foreground">{patient.diagnosis}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">Medical history</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{patient.history}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">Current treatment</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{patient.treatment}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">Last consultation</p>
                <p className="mt-1 text-sm font-bold text-foreground">Today, 08:42 AM</p>
                <p className="mt-1 text-xs text-muted-foreground">{patient.doctor}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-success text-success-foreground">
              <ClipboardCheck size={19} />
            </div>
            <div>
              <h3 className="font-display font-extrabold">Access verification</h3>
              <p className="text-xs text-muted-foreground">Clinical scope check</p>
            </div>
          </div>
          <div className="space-y-4 border-y border-border py-5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your department</span>
              <b>{currentUser.department}</b>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Record department</span>
              <b>{patient.department}</b>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Scope status</span>
              {isScopeMatch ? <StatusBadge>Authorized</StatusBadge> : <StatusBadge tone="warning">Restricted</StatusBadge>}
            </div>
          </div>
          <button
            disabled={!isScopeMatch && !accessed}
            onClick={() => setAccessed(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-bold text-brand-foreground disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
          >
            <Eye size={16} />
            {accessed ? "Full record viewed" : "View full record"}
          </button>
          {accessed && (
            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-success-foreground bg-success px-3 py-2 rounded-lg">
              <Check size={14} />
              Access logged successfully.
            </p>
          )}
        </aside>
      </div>

      {modal && (
        <AccessModal
          emergency={!isScopeMatch}
          patient={patient.name}
          onClose={() => setModal(false)}
          onGranted={() => setAccessed(true)}
        />
      )}
    </AppShell>
  );
}

function AccessModal({ emergency, patient, onClose, onGranted }: { emergency: boolean; patient: string; onClose: () => void; onGranted?: () => void }) {
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    setSent(true);
    if (onGranted) onGranted();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-5 backdrop-blur-xs">
      <div className="w-full max-w-[500px] rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 grid size-10 place-items-center rounded-xl bg-warning text-warning-foreground">
              {emergency ? <Zap size={19} /> : <KeyRound size={19} />}
            </div>
            <h2 className="font-display text-xl font-extrabold text-foreground">
              {sent ? (emergency ? "Emergency access granted" : "Request submitted") : emergency ? "Request emergency access" : "Access required"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {sent
                ? "This emergency access activity has been securely logged for security officer review."
                : emergency
                ? "Emergency access allows authorized clinicians to temporarily access records outside their normal scope during a legitimate medical emergency."
                : "This patient is outside your normal department scope."}
            </p>
          </div>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>

        {!sent ? (
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold">Patient</label>
              <div className="rounded-xl border border-input bg-secondary/35 px-3.5 py-3 text-sm font-semibold">{patient}</div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold">{emergency ? "Emergency reason" : "Reason for access"}</label>
              <select className="w-full rounded-xl border border-input bg-card px-3.5 py-3 text-sm outline-none">
                <option>Clinical emergency (Code Blue / Trauma)</option>
                <option>Continuity of care</option>
                <option>On-call specialist consultation</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold">Clinical explanation</label>
              <textarea
                rows={3}
                className="w-full resize-none rounded-xl border border-input bg-card px-3.5 py-3 text-sm outline-none focus:border-brand"
                placeholder="Add context for the security audit log..."
                defaultValue="Urgent patient evaluation required."
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-xs font-bold text-brand-foreground shadow-md cursor-pointer"
            >
              {emergency ? <Zap size={16} /> : <KeyRound size={16} />}
              {emergency ? "Grant Emergency Override" : "Request access"}
            </button>
          </div>
        ) : (
          <button onClick={onClose} className="mt-6 w-full rounded-xl bg-brand py-3 text-xs font-bold text-brand-foreground cursor-pointer">
            Return to Patient
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ACTIVITY PAGE
// ==========================================
function ActivityPage() {
  const [logs] = useState(() => db.getAccessLogs());

  return (
    <AppShell page="activity">
      <PageHeader
        eyebrow="Clinical workspace"
        title="Recent activity"
        subtitle="Your monitored access history across patient records."
        action={
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-input px-3.5 py-2.5 text-xs font-bold text-muted-foreground">
              <Filter size={15} />
              Filters
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-brand px-3.5 py-2.5 text-xs font-bold text-brand-foreground shadow-xs">
              <Download size={15} />
              Export
            </button>
          </div>
        }
      />
      <div className="rounded-2xl border border-border bg-card shadow-[0_6px_24px_-18px_var(--shadow-color)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-secondary/40 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                {["Patient", "Action", "Timestamp", "IP address", "Result", "Risk"].map((h) => (
                  <th key={h} className="px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((row) => (
                <tr key={row.id} className="text-sm">
                  <td className="px-5 py-4 font-semibold">{row.patientName || row.userName}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.action}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.timestamp}</td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{row.ipAddress}</td>
                  <td className="px-5 py-4">
                    {row.result === "Allowed" ? (
                      <StatusBadge>Allowed</StatusBadge>
                    ) : row.result === "Emergency" ? (
                      <StatusBadge tone="info">Emergency</StatusBadge>
                    ) : (
                      <StatusBadge tone="danger">Denied</StatusBadge>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={row.riskLevel === "Low" ? "info" : row.riskLevel === "Critical" ? "danger" : "warning"}>
                      {row.riskLevel}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

// ==========================================
// SECURITY DASHBOARD
// ==========================================
function SecurityDashboard() {
  const data = [
    { day: "Mon", value: 42 },
    { day: "Tue", value: 58 },
    { day: "Wed", value: 49 },
    { day: "Thu", value: 83 },
    { day: "Fri", value: 69 },
    { day: "Sat", value: 91 },
    { day: "Sun", value: 76 },
  ];

  const distribution = [
    { name: "Critical", value: 2, color: "var(--danger-foreground)" },
    { name: "High", value: 5, color: "var(--warning-foreground)" },
    { name: "Medium", value: 8, color: "var(--brand)" },
    { name: "Low", value: 12, color: "var(--info-foreground)" },
  ];

  return (
    <AppShell page="security-dashboard" security>
      <PageHeader
        eyebrow="Security operations"
        title="Security operations"
        subtitle="Monitor patient record access and investigate suspicious activity in real-time."
        action={
          <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success px-3.5 py-2.5 text-xs font-bold text-success-foreground">
            <span className="size-2 animate-pulse rounded-full bg-current" />
            Monitoring live
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Access attempts" value="1,284" note="this week" icon={FileKey2} />
        <StatCard label="Suspicious activity" value="17" note="needs review" icon={ShieldAlert} tone="danger" />
        <StatCard label="Failed logins" value="32" note="last 24 hours" icon={LockKeyhole} tone="warning" />
        <StatCard label="Active alerts" value="7" note="3 critical" icon={AlertTriangle} tone="danger" />
        <StatCard label="Investigations" value="4" note="in progress" icon={ClipboardCheck} tone="success" />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-extrabold tracking-[-0.03em]">Access activity</h2>
              <p className="mt-1 text-xs text-muted-foreground">All monitored record access attempts</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-xs font-bold text-muted-foreground">
              Last 7 days <ChevronDown size={14} />
            </button>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="var(--brand)" strokeWidth={3} fill="url(#activityFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
          <h2 className="font-display text-lg font-extrabold tracking-[-0.03em]">Alert distribution</h2>
          <p className="mt-1 text-xs text-muted-foreground">By severity · last 30 days</p>
          <div className="relative mx-auto mt-4 h-[190px] w-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} innerRadius={57} outerRadius={82} paddingAngle={3} dataKey="value" stroke="none">
                  {distribution.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <b className="font-display text-2xl">27</b>
                <p className="text-[10px] text-muted-foreground">total alerts</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {distribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
                <b className="ml-auto">{item.value}</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-[-0.03em]">Recent security events</h2>
            <p className="mt-1 text-xs text-muted-foreground">The latest activity requiring attention</p>
          </div>
          <Link to={"/security/alerts" as any} className="text-xs font-bold text-brand hover:underline">
            View all alerts
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { Icon: ShieldAlert, title: "Suspicious activity detected", detail: "87 records accessed in 10 min", time: "10:29 AM", tone: "danger" },
            { Icon: LockKeyhole, title: "Failed login attempts", detail: "6 attempts from new device", time: "8:12 AM", tone: "warning" },
            { Icon: KeyRound, title: "Emergency access used", detail: "Dr. Priya Nair · Emergency", time: "Yesterday", tone: "success" },
            { Icon: FileKey2, title: "Unauthorized access blocked", detail: "Pediatrics → Cardiology", time: "Yesterday", tone: "info" },
          ].map(({ Icon, title, detail, time, tone }) => (
            <div key={title} className="flex gap-3 rounded-xl border border-border p-4">
              <div
                className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                  tone === "danger"
                    ? "bg-danger text-danger-foreground"
                    : tone === "warning"
                    ? "bg-warning text-warning-foreground"
                    : tone === "success"
                    ? "bg-success text-success-foreground"
                    : "bg-info text-info-foreground"
                }`}
              >
                <Icon size={17} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{title}</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">{detail}</p>
                <p className="mt-2 text-[10px] font-semibold text-muted-foreground">{time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

// ==========================================
// ALERTS PAGE
// ==========================================
function AlertsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [alertsList] = useState(() => db.getAlerts());

  const filtered = alertsList.filter((a) => filter === "All" || a.severity === filter || a.status === filter);

  return (
    <AppShell page="alerts" security>
      <PageHeader
        eyebrow="Security operations"
        title="Security alerts"
        subtitle="Review and respond to suspicious patient-record activity detected by explainable rules."
        action={
          <a
            href="http://localhost:5000/api/alerts/export"
            download
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-xs font-bold text-brand-foreground shadow-xs"
          >
            <Download size={15} />
            Export alerts CSV
          </a>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {["All", "Critical", "High", "Medium", "Low", "Resolved"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition cursor-pointer ${
              filter === item ? "bg-brand text-brand-foreground" : "border border-border bg-card text-muted-foreground hover:border-brand/40"
            }`}
          >
            {item}
            {item === "Critical" && <span className="ml-1.5 rounded-full bg-danger px-1.5 py-0.2 text-[10px] text-danger-foreground">2</span>}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card shadow-[0_6px_24px_-18px_var(--shadow-color)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-secondary/40 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                {["Alert ID", "Alert type", "User", "Department", "Severity", "Detected at", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="cursor-pointer text-sm transition hover:bg-secondary/30"
                  onClick={() => navigate({ to: "/security/alerts/$id" as any, params: { id: a.id } as any })}
                >
                  <td className="px-5 py-4 font-bold text-brand">{a.id}</td>
                  <td className="px-5 py-4 font-semibold">{a.typeDisplayName}</td>
                  <td className="px-5 py-4 text-muted-foreground">{a.userName}</td>
                  <td className="px-5 py-4 text-muted-foreground">{a.userDepartment || "—"}</td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={a.severity === "Critical" ? "danger" : a.severity === "High" ? "warning" : a.severity === "Medium" ? "warning" : "info"}>
                      {a.severity}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{a.timestamp}</td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={a.status === "Resolved" ? "success" : a.status === "Under Investigation" ? "info" : "danger"}>
                      {a.status}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ChevronRight size={17} className="text-muted-foreground inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

// ==========================================
// INVESTIGATION PAGE
// ==========================================
function InvestigationPage({ id }: { id?: string | undefined }) {
  const navigate = useNavigate();
  const alert = (id ? db.getAlertById(id) : db.getAlerts()[0]) ?? db.getAlerts()[0] ?? {
    id: "ALT-2048",
    typeDisplayName: "Unusually high record access",
    userName: "Dr. Arjun Patel",
    userDepartment: "General Medicine",
    severity: "Critical" as const,
    status: "Under Investigation" as const,
    timestamp: "Today, 10:29 AM",
    ruleId: "RULE-02-MASS-ACCESS",
    detail: "87 patient records were accessed within 10 minutes.",
    evidence: { recordsAccessed: 87, threshold: 50, timeWindowMinutes: 10, trigger: "Threshold exceeded", emergencyMode: false, ipAddress: "172.16.42.88" },
  };

  const [note, setNote] = useState("");
  const [status, setStatus] = useState<AlertStatus>(alert.status);
  const [saved, setSaved] = useState(false);

  const handleUpdate = (newStatus: AlertStatus) => {
    setStatus(newStatus);
    db.saveInvestigation({
      alertId: alert.id,
      status: newStatus,
      notes: note || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppShell page="investigation" security>
      <button
        onClick={() => navigate({ to: "/security/alerts" as any })}
        className="mb-6 flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-brand cursor-pointer"
      >
        <ArrowLeft size={15} />
        Back to alerts
      </button>
      <PageHeader
        eyebrow={`Investigation · ${alert.id}`}
        title={alert.typeDisplayName}
        subtitle="Review the evidence, confirm the risk, and record the outcome."
        action={<StatusBadge tone={alert.severity === "Critical" ? "danger" : "warning"}>{alert.severity} · {status}</StatusBadge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
            <h2 className="font-display text-lg font-extrabold">Alert summary</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {[
                ["Alert ID", alert.id],
                ["Alert type", alert.typeDisplayName],
                ["Detected", alert.timestamp],
                ["User", alert.userName],
                ["Department", alert.userDepartment || "—"],
                ["IP address", (alert.evidence.ipAddress as string) || "172.16.42.88"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-bold">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-danger text-danger-foreground">
                <CircleHelp size={18} />
              </div>
              <div>
                <h2 className="font-display text-lg font-extrabold">Why was this detected?</h2>
                <p className="text-xs text-muted-foreground">Rule: {alert.ruleId}</p>
              </div>
            </div>
            <p className="mt-5 rounded-xl bg-danger/10 border border-danger/20 p-4 text-sm leading-6 text-foreground">{alert.detail}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[
                ["Records accessed", String(alert.evidence.recordsAccessed || "87")],
                ["Time window", `${alert.evidence.timeWindowMinutes || 10} min`],
                ["Trigger", String(alert.evidence.trigger || "Threshold exceeded")],
                ["Emergency Mode", alert.evidence.emergencyMode ? "ON" : "OFF"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border p-3">
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="mt-1 font-display text-base font-extrabold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
            <h2 className="font-display text-lg font-extrabold">Investigation actions</h2>
            <div className="mt-5 space-y-2">
              <button
                onClick={() => handleUpdate("Under Investigation")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-bold text-brand-foreground cursor-pointer"
              >
                <ClipboardCheck size={15} />
                Mark Under Investigation
              </button>
              <button
                onClick={() => handleUpdate("Confirmed Legitimate")}
                className="w-full rounded-xl border border-border py-3 text-xs font-bold text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                Mark Legitimate (False Positive)
              </button>
              <button
                onClick={() => handleUpdate("Resolved")}
                className="w-full rounded-xl border border-success/30 bg-success py-3 text-xs font-bold text-success-foreground cursor-pointer"
              >
                Resolve Alert
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
            <h2 className="font-display text-lg font-extrabold">Investigation notes</h2>
            <p className="mt-1 text-xs text-muted-foreground">Keep an immutable record for audit review.</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="mt-4 w-full resize-none rounded-xl border border-input bg-secondary/25 p-3 text-sm outline-none focus:border-brand"
              placeholder="Write an investigation note..."
            />
            <button
              onClick={() => handleUpdate(status)}
              className="mt-3 w-full rounded-xl border border-brand py-2.5 text-xs font-bold text-brand hover:bg-brand hover:text-brand-foreground transition cursor-pointer"
            >
              {saved ? "Note Saved!" : "Save Note"}
            </button>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

// ==========================================
// LOGS PAGE
// ==========================================
function LogsPage() {
  const [logs] = useState(() => db.getAccessLogs());

  return (
    <AppShell page="logs" security>
      <PageHeader
        eyebrow="Security operations"
        title="Access logs"
        subtitle="A complete audit trail of monitored patient-record activity."
        action={
          <button className="flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-xs font-bold text-brand-foreground shadow-xs cursor-pointer">
            <Download size={15} />
            Export CSV
          </button>
        }
      />
      <div className="rounded-2xl border border-border bg-card shadow-[0_6px_24px_-18px_var(--shadow-color)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left">
            <thead className="bg-secondary/40 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                {["Log ID", "User", "Role", "Patient", "Action", "Timestamp", "IP address", "Result", "Risk"].map((h) => (
                  <th key={h} className="px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((row) => (
                <tr key={row.id} className="text-sm">
                  <td className="px-5 py-4 font-bold text-brand">{row.id}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.userName}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.userRole}</td>
                  <td className="px-5 py-4 font-semibold">{row.patientName || "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.action}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.timestamp}</td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{row.ipAddress}</td>
                  <td className="px-5 py-4">
                    {row.result === "Allowed" ? (
                      <StatusBadge>Allowed</StatusBadge>
                    ) : row.result === "Flagged" ? (
                      <StatusBadge tone="danger">Flagged</StatusBadge>
                    ) : (
                      <StatusBadge tone="info">{row.result}</StatusBadge>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={row.riskLevel === "Critical" ? "danger" : row.riskLevel === "High" ? "warning" : "info"}>
                      {row.riskLevel}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

// ==========================================
// USERS MANAGEMENT PAGE
// ==========================================
function UsersPage() {
  const [userList, setUserList] = useState(() => db.getUsers());
  const [showModal, setShowModal] = useState(false);

  const handleCreated = (_acc: Account) => {
    setShowModal(false);
    setUserList(db.getUsers());
  };

  return (
    <AppShell page="users" security>
      {showModal && <AddAccountModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      <PageHeader
        eyebrow="Security operations"
        title="User management"
        subtitle="Manage hospital workspace access, roles, and department permissions."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-xs font-bold text-brand-foreground shadow-xs cursor-pointer"
          >
            <UserPlus size={15} />
            + Add User
          </button>
        }
      />
      <div className="rounded-2xl border border-border bg-card shadow-[0_6px_24px_-18px_var(--shadow-color)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-secondary/40 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                {["User ID", "Name", "Email", "Role", "Department", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {userList.map((row) => (
                <tr key={row.id} className="text-sm">
                  <td className="px-5 py-4 font-bold text-brand">{row.id}</td>
                  <td className="px-5 py-4 font-semibold">{row.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.email}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-bold">{row.role}</span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{row.department}</td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={row.status === "Active" ? "success" : "warning"}>{row.status}</StatusBadge>
                  </td>
                  <td className="px-5 py-4">
                    <button aria-label={`Actions for ${row.name}`} className="text-muted-foreground hover:text-brand">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

// ==========================================
// SECURITY RULES PAGE
// ==========================================
function RulesPage() {
  const rules = [
    { title: "Failed login detection", description: "Trigger when 5 or more failed login attempts occur within 5 minutes.", threshold: "5 attempts · 5 minutes", enabled: true, Icon: LockKeyhole },
    { title: "Mass record access", description: "Trigger when more than 50 patient records are accessed within 10 minutes.", threshold: "50 records · 10 minutes", enabled: true, Icon: FileKey2 },
    { title: "Unauthorized access", description: "Trigger when a user attempts to access a patient outside their authorized department.", threshold: "Any out-of-scope attempt", enabled: true, Icon: ShieldAlert },
    { title: "Emergency exception", description: "Log emergency access for review without generating a mass-access alert.", threshold: "Authorized clinician + emergency reason", enabled: true, Icon: Zap },
  ];

  return (
    <AppShell page="rules" security>
      <PageHeader eyebrow="Security operations" title="Security rules" subtitle="Detection rules used to protect sensitive patient information." />
      <div className="space-y-4">
        {rules.map(({ title, description, threshold, enabled, Icon }, index) => (
          <div key={title} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)] sm:flex-row sm:items-center">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <Icon size={20} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-base font-extrabold">Rule {index + 1} — {title}</h2>
                <StatusBadge>{enabled ? "Active" : "Paused"}</StatusBadge>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
              <p className="mt-2 inline-flex rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground">Threshold: {threshold}</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

// ==========================================
// PROFILE PAGE
// ==========================================
function ProfilePage() {
  const [currentUser] = useState<Account>(() => getCurrentUser());
  const initials = currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AppShell page="profile">
      <PageHeader eyebrow="Account" title="My profile" subtitle="Your identity and access context for the MedGuard workspace." />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-2xl bg-brand-soft font-display text-xl font-extrabold text-brand">
              {initials || "MG"}
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold">{currentUser.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{currentUser.role} · {currentUser.department}</p>
            </div>
          </div>
          <div className="mt-7 space-y-4 border-t border-border pt-5">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Hospital email</p>
              <p className="mt-1 text-sm font-bold">{currentUser.email}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Department</p>
              <p className="mt-1 text-sm font-bold">{currentUser.department}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Account status</p>
              <div className="mt-1">
                <StatusBadge>Active</StatusBadge>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_24px_-18px_var(--shadow-color)]">
          <h2 className="font-display text-lg font-extrabold">Access & security</h2>
          <div className="mt-5 divide-y divide-border">
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-bold">Last login</p>
                <p className="mt-1 text-xs text-muted-foreground">Today, 9:18 AM · 10.24.8.14</p>
              </div>
              <StatusBadge tone="info">Verified device</StatusBadge>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-bold">Multi-factor authentication</p>
                <p className="mt-1 text-xs text-muted-foreground">Recommended for all clinical users</p>
              </div>
              <button className="rounded-lg border border-brand px-3 py-2 text-xs font-bold text-brand">Enable</button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

// ==========================================
// ACCESS DENIED / 403 FORBIDDEN PAGE
// ==========================================
function AccessDeniedView({ page, user }: { page: Page; user: Account }) {
  const navigate = useNavigate();
  const defaultRoute = getDefaultRouteForRole(user.role);

  return (
    <AppShell page={page} security={user.role === "Security officer" || user.role === "Administrator"}>
      <div className="mx-auto my-12 max-w-2xl text-center">
        <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl border border-danger/20 bg-danger/10 text-danger shadow-[0_8px_30px_rgb(239,68,68,0.12)]">
          <ShieldAlert size={40} strokeWidth={1.8} />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-bold text-danger">
          <span className="size-2 rounded-full bg-danger animate-pulse" />
          HTTP 403 · Access Denied / Unauthorized
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
          Restricted Resource
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Your account <span className="font-semibold text-foreground">{user.name}</span> with role{" "}
          <span className="rounded-md bg-secondary px-2 py-0.5 font-bold text-foreground">{user.role}</span> in the{" "}
          <span className="font-semibold text-foreground">{user.department}</span> department does not have permission to view or manage{" "}
          <span className="font-mono text-sm font-bold text-brand">/{page}</span>.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left shadow-[0_6px_24px_-18px_var(--shadow-color)]">
          <h2 className="font-display text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
            MedGuard Role-Based Access Control Policy
          </h2>
          <div className="mt-4 space-y-2.5 text-xs text-muted-foreground">
            <div className="flex items-start gap-2.5">
              <LockKeyhole size={16} className="mt-0.5 text-brand shrink-0" />
              <span>
                <strong>Principle of Least Privilege:</strong> Clinicians, Security personnel, and Administrators are restricted to resources relevant to their assigned scope.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Shield size={16} className="mt-0.5 text-brand shrink-0" />
              <span>
                <strong>Audit Trail:</strong> This unauthorized access attempt has been logged for compliance and security audit.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate({ to: defaultRoute as any })}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-brand-foreground shadow-sm transition hover:bg-brand/90 cursor-pointer"
          >
            <LayoutDashboard size={17} />
            Return to Authorized Dashboard
          </button>
          <button
            onClick={() => navigate({ to: "/profile" as any })}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-muted-foreground transition hover:border-brand/40 hover:bg-brand-soft hover:text-brand cursor-pointer"
          >
            <UserRound size={17} />
            View My Profile
          </button>
        </div>
      </div>
    </AppShell>
  );
}

// ==========================================
// MAIN APP ROUTER COMPONENT
// ==========================================
export function MedGuardApp({ page, patientId }: { page: Page; patientId?: string | undefined }) {
  const [currentUser, setCurrentUser] = useState<Account>(() => getCurrentUser());

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  if (page === "login") return <LoginPage />;

  // Frontend RBAC enforcement
  if (!canAccessPage(currentUser.role, page)) {
    return <AccessDeniedView page={page} user={currentUser} />;
  }

  if (page === "dashboard") return <Dashboard />;
  if (page === "security-dashboard") return <Dashboard security />;
  if (page === "patients") return <PatientsPage />;
  if (page === "patient-detail") return <PatientDetail id={patientId} />;
  if (page === "activity") return <ActivityPage />;
  if (page === "emergency") return <PatientDetail id={patientId} />;
  if (page === "alerts") return <AlertsPage />;
  if (page === "investigation") return <InvestigationPage id={patientId} />;
  if (page === "logs") return <LogsPage />;
  if (page === "users") return <UsersPage />;
  if (page === "rules") return <RulesPage />;
  return <ProfilePage />;
}
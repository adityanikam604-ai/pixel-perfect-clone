export const demoAccounts = {
  doctor: { email: "doctor@medguard.demo", password: "doctor123", name: "Dr. Rahul Sharma", role: "Doctor", department: "Cardiology" },
  nurse: { email: "nurse@medguard.demo", password: "nurse123", name: "Neha Verma", role: "Nurse", department: "Cardiology" },
  security: { email: "security@medguard.demo", password: "security123", name: "Arjun Patel", role: "Security officer", department: "Security" },
  admin: { email: "admin@medguard.demo", password: "admin123", name: "Kavita Shah", role: "Administrator", department: "Operations" },
};
export function authenticate(email: string, password: string) { return Object.values(demoAccounts).find((account) => account.email === email && account.password === password) ?? null; }
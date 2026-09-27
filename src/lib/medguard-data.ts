export type Patient = {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: string;
  department: string;
  diagnosis: string;
  doctor: string;
  lastAccess: string;
  status: "Authorized" | "Request access";
  history: string;
  treatment: string;
};

export const patients: Patient[] = [
  { id: "MG-10482", name: "Aarav Mehta", initials: "AM", age: 58, gender: "Male", department: "Cardiology", diagnosis: "Hypertension", doctor: "Dr. Rahul Sharma", lastAccess: "Today, 9:18 AM", status: "Authorized", history: "Longstanding hypertension with regular cardiac monitoring.", treatment: "Amlodipine 5mg daily; blood pressure review every 4 weeks." },
  { id: "MG-10531", name: "Priya Nair", initials: "PN", age: 42, gender: "Female", department: "Cardiology", diagnosis: "Atrial fibrillation", doctor: "Dr. Rahul Sharma", lastAccess: "Today, 8:46 AM", status: "Authorized", history: "Paroxysmal atrial fibrillation identified during routine screening.", treatment: "Apixaban 5mg twice daily; rhythm observation." },
  { id: "MG-10804", name: "Vikram Singh", initials: "VS", age: 67, gender: "Male", department: "Neurology", diagnosis: "Transient ischemic attack", doctor: "Dr. Meera Joshi", lastAccess: "Yesterday, 4:20 PM", status: "Request access", history: "Recent TIA with ongoing neurological observation.", treatment: "Antiplatelet therapy; follow-up imaging scheduled." },
  { id: "MG-10916", name: "Sana Kapoor", initials: "SK", age: 35, gender: "Female", department: "Oncology", diagnosis: "Breast carcinoma", doctor: "Dr. Anil Menon", lastAccess: "Yesterday, 2:05 PM", status: "Request access", history: "Active treatment plan under oncology care.", treatment: "Outpatient infusion cycle 3; oncology review next week." },
  { id: "MG-11044", name: "Rohan Iyer", initials: "RI", age: 51, gender: "Male", department: "Cardiology", diagnosis: "Coronary artery disease", doctor: "Dr. Rahul Sharma", lastAccess: "Mon, 11:30 AM", status: "Authorized", history: "Stable coronary artery disease after prior intervention.", treatment: "Statin therapy and supervised cardiac rehabilitation." },
  { id: "MG-11102", name: "Ananya Rao", initials: "AR", age: 29, gender: "Female", department: "Pediatrics", diagnosis: "Asthma", doctor: "Dr. Kavita Shah", lastAccess: "Mon, 10:12 AM", status: "Request access", history: "Intermittent asthma with seasonal triggers.", treatment: "Rescue inhaler as needed; trigger avoidance plan." },
  { id: "MG-11218", name: "Kabir Das", initials: "KD", age: 73, gender: "Male", department: "Orthopedics", diagnosis: "Osteoarthritis", doctor: "Dr. Vikram Patel", lastAccess: "Sun, 3:42 PM", status: "Request access", history: "Bilateral knee osteoarthritis affecting mobility.", treatment: "Physiotherapy and pain management review." },
  { id: "MG-11308", name: "Meera Kulkarni", initials: "MK", age: 46, gender: "Female", department: "Cardiology", diagnosis: "Heart failure", doctor: "Dr. Rahul Sharma", lastAccess: "Sun, 1:08 PM", status: "Authorized", history: "Chronic heart failure with stable ejection fraction.", treatment: "Diuretic titration and daily weight tracking." },
];

export const alerts = [
  { id: "ALT-2048", type: "Unusually high record access", user: "Dr. Arjun Patel", department: "General Medicine", severity: "Critical", time: "Today, 10:29 AM", status: "Investigating", detail: "87 patient records were accessed within 10 minutes. The configured threshold is 50 records within 10 minutes." },
  { id: "ALT-2047", type: "Unauthorized department access", user: "Nurse Neha Verma", department: "Pediatrics", severity: "High", time: "Today, 9:42 AM", status: "Open", detail: "An attempt was made to view a cardiology record outside the user's assigned department." },
  { id: "ALT-2046", type: "Multiple failed login attempts", user: "Unknown user", department: "—", severity: "High", time: "Today, 8:12 AM", status: "Open", detail: "Six failed sign-in attempts were recorded from an unrecognized device within five minutes." },
  { id: "ALT-2045", type: "After-hours access", user: "Dr. Sameer Khan", department: "Neurology", severity: "Medium", time: "Yesterday, 11:48 PM", status: "Resolved", detail: "A patient record was accessed outside normal hours without an emergency access reason." },
  { id: "ALT-2044", type: "Emergency access used", user: "Dr. Priya Nair", department: "Emergency", severity: "Low", time: "Yesterday, 7:20 PM", status: "Resolved", detail: "Emergency access was correctly activated and securely logged for review." },
];

export const activity = [
  ["Aarav Mehta", "Viewed record", "Today, 9:18 AM", "10.24.8.14", "Allowed", "Low"],
  ["Priya Nair", "Viewed record", "Today, 8:46 AM", "10.24.8.14", "Allowed", "Low"],
  ["Vikram Singh", "Requested access", "Yesterday, 4:20 PM", "10.24.8.14", "Denied", "Medium"],
  ["Rohan Iyer", "Viewed record", "Mon, 11:30 AM", "10.24.8.14", "Allowed", "Low"],
  ["Sana Kapoor", "Requested access", "Sun, 2:05 PM", "10.24.8.14", "Denied", "Medium"],
];

export const users = [
  ["USR-001", "Dr. Rahul Sharma", "doctor@medguard.demo", "Doctor", "Cardiology", "Active", "Today, 9:18 AM"],
  ["USR-002", "Neha Verma", "nurse@medguard.demo", "Nurse", "Cardiology", "Active", "Today, 8:52 AM"],
  ["USR-003", "Arjun Patel", "security@medguard.demo", "Security officer", "Security", "Active", "Today, 10:31 AM"],
  ["USR-004", "Kavita Shah", "admin@medguard.demo", "Administrator", "Operations", "Active", "Yesterday, 5:40 PM"],
  ["USR-005", "Sameer Khan", "sameer@medguard.demo", "Doctor", "Neurology", "Review", "Yesterday, 11:48 PM"],
];
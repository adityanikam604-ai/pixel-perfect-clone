-- ==============================================================================
-- MedGuard Platform - Seed Data (Synthetic Hospital Dataset)
-- PRD Section 10, 12, 19, 26, 49
-- ==============================================================================

-- Clean slate
TRUNCATE TABLE investigations, alerts, login_attempts, access_logs, patients, users CASCADE;

-- ------------------------------------------------------------------------------
-- 1. USERS SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO users (id, name, email, role, department, status, created_at) VALUES
('USR-001', 'Dr. Rahul Sharma', 'doctor@medguard.demo', 'Doctor', 'Cardiology', 'Active', NOW() - INTERVAL '30 days'),
('USR-002', 'Neha Verma', 'nurse@medguard.demo', 'Nurse', 'Cardiology', 'Active', NOW() - INTERVAL '30 days'),
('USR-003', 'Arjun Patel', 'security@medguard.demo', 'Security officer', 'Security', 'Active', NOW() - INTERVAL '45 days'),
('USR-004', 'Kavita Shah', 'admin@medguard.demo', 'Administrator', 'Operations', 'Active', NOW() - INTERVAL '60 days'),
('USR-005', 'Dr. Sameer Khan', 'sameer@medguard.demo', 'Doctor', 'Neurology', 'Review', NOW() - INTERVAL '20 days'),
('USR-006', 'Dr. Priya Nair', 'priya.nair@medguard.demo', 'Doctor', 'Emergency', 'Active', NOW() - INTERVAL '15 days'),
('USR-007', 'Dr. Anil Menon', 'anil.menon@medguard.demo', 'Doctor', 'Oncology', 'Active', NOW() - INTERVAL '25 days'),
('USR-008', 'Dr. Vikram Patel', 'vikram.patel@medguard.demo', 'Doctor', 'Orthopedics', 'Active', NOW() - INTERVAL '10 days');

-- ------------------------------------------------------------------------------
-- 2. PATIENTS SEED DATA (Synthetic EHR)
-- ------------------------------------------------------------------------------
INSERT INTO patients (id, name, initials, age, gender, department, diagnosis, medical_history, treatment, assigned_doctor, assigned_doctor_id, last_access_at) VALUES
('MG-10482', 'Aarav Mehta', 'AM', 58, 'Male', 'Cardiology', 'Hypertension', 'Longstanding hypertension with regular cardiac monitoring.', 'Amlodipine 5mg daily; blood pressure review every 4 weeks.', 'Dr. Rahul Sharma', 'USR-001', NOW() - INTERVAL '42 minutes'),
('MG-10531', 'Priya Nair', 'PN', 42, 'Female', 'Cardiology', 'Atrial fibrillation', 'Paroxysmal atrial fibrillation identified during routine screening.', 'Apixaban 5mg twice daily; rhythm observation.', 'Dr. Rahul Sharma', 'USR-001', NOW() - INTERVAL '1 hour 14 minutes'),
('MG-10804', 'Vikram Singh', 'VS', 67, 'Male', 'Neurology', 'Transient ischemic attack', 'Recent TIA with ongoing neurological observation.', 'Antiplatelet therapy; follow-up imaging scheduled.', 'Dr. Sameer Khan', 'USR-005', NOW() - INTERVAL '1 day 4 hours'),
('MG-10916', 'Sana Kapoor', 'SK', 35, 'Female', 'Oncology', 'Breast carcinoma', 'Active treatment plan under oncology care.', 'Outpatient infusion cycle 3; oncology review next week.', 'Dr. Anil Menon', 'USR-007', NOW() - INTERVAL '1 day 6 hours'),
('MG-11044', 'Rohan Iyer', 'RI', 51, 'Male', 'Cardiology', 'Coronary artery disease', 'Stable coronary artery disease after prior intervention.', 'Statin therapy and supervised cardiac rehabilitation.', 'Dr. Rahul Sharma', 'USR-001', NOW() - INTERVAL '2 days'),
('MG-11102', 'Ananya Rao', 'AR', 29, 'Female', 'Pediatrics', 'Asthma', 'Intermittent asthma with seasonal triggers.', 'Rescue inhaler as needed; trigger avoidance plan.', 'Kavita Shah', 'USR-004', NOW() - INTERVAL '2 days 3 hours'),
('MG-11218', 'Kabir Das', 'KD', 73, 'Male', 'Orthopedics', 'Osteoarthritis', 'Bilateral knee osteoarthritis affecting mobility.', 'Physiotherapy and pain management review.', 'Dr. Vikram Patel', 'USR-008', NOW() - INTERVAL '3 days'),
('MG-11308', 'Meera Kulkarni', 'MK', 46, 'Female', 'Cardiology', 'Heart failure', 'Chronic heart failure with stable ejection fraction.', 'Diuretic titration and daily weight tracking.', 'Dr. Rahul Sharma', 'USR-001', NOW() - INTERVAL '3 days 5 hours'),
('MG-11420', 'Ramesh Sen', 'RS', 62, 'Male', 'Cardiology', 'Arrhythmia', 'History of episodic palpitations and pacemaker checkup.', 'Metoprolol 25mg daily; ECG monitoring.', 'Dr. Rahul Sharma', 'USR-001', NOW() - INTERVAL '4 days'),
('MG-11590', 'Tara Bhatt', 'TB', 38, 'Female', 'Emergency', 'Acute chest trauma', 'Motor vehicle accident triage, hemodynamically stable.', 'Continuous vitals monitoring; CT scan clearance.', 'Dr. Priya Nair', 'USR-006', NOW() - INTERVAL '5 hours');

-- ------------------------------------------------------------------------------
-- 3. ACCESS LOGS SEED DATA (Audit Trail)
-- ------------------------------------------------------------------------------
INSERT INTO access_logs (id, user_id, user_name, user_role, user_department, patient_id, patient_name, patient_department, action, emergency_mode, success, result, reason, ip_address, risk_level, timestamp) VALUES
('LOG-8812', 'USR-001', 'Dr. Rahul Sharma', 'Doctor', 'Cardiology', 'MG-10482', 'Aarav Mehta', 'Cardiology', 'VIEW_RECORD', false, true, 'Allowed', 'Authorized clinician scope match', '10.24.8.14', 'Low', NOW() - INTERVAL '42 minutes'),
('LOG-8811', 'USR-002', 'Neha Verma', 'Nurse', 'Cardiology', 'MG-10531', 'Priya Nair', 'Cardiology', 'VIEW_RECORD', false, true, 'Allowed', 'Department care assignment verified', '10.24.8.21', 'Low', NOW() - INTERVAL '1 hour 14 minutes'),
('LOG-8810', 'USR-002', 'Neha Verma', 'Nurse', 'Cardiology', 'MG-10804', 'Vikram Singh', 'Neurology', 'REQUEST_ACCESS', false, false, 'Denied', 'Department mismatch: Cardiology user attempting Neurology record without emergency bypass', '10.24.8.21', 'High', NOW() - INTERVAL '2 hours 10 minutes'),
('LOG-8809', 'USR-003', 'Dr. Arjun Patel', 'Security officer', 'Security', NULL, '87 records', 'General Medicine', 'BULK_ACCESS', false, false, 'Flagged', 'Mass record access threshold exceeded (87 records in 10 minutes)', '172.16.42.88', 'Critical', NOW() - INTERVAL '10 hours 31 minutes'),
('LOG-8808', 'USR-006', 'Dr. Priya Nair', 'Doctor', 'Emergency', 'MG-10916', 'Sana Kapoor', 'Oncology', 'EMERGENCY_ACCESS', true, true, 'Emergency', 'Emergency mode activated by authorized ER doctor with clinical justification', '10.24.8.44', 'Low', NOW() - INTERVAL '1 day 1 hour'),
('LOG-8807', 'USR-001', 'Dr. Rahul Sharma', 'Doctor', 'Cardiology', 'MG-11044', 'Rohan Iyer', 'Cardiology', 'VIEW_RECORD', false, true, 'Allowed', 'Regular follow-up consultation', '10.24.8.14', 'Low', NOW() - INTERVAL '2 days'),
('LOG-8806', 'USR-005', 'Dr. Sameer Khan', 'Doctor', 'Neurology', 'MG-10804', 'Vikram Singh', 'Neurology', 'VIEW_RECORD', false, true, 'Allowed', 'Routine neurological scan review', '10.24.8.35', 'Low', NOW() - INTERVAL '2 days 6 hours');

-- ------------------------------------------------------------------------------
-- 4. LOGIN ATTEMPTS SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO login_attempts (id, email, user_id, success, ip_address, user_agent, failure_reason, timestamp) VALUES
('LGN-9001', 'doctor@medguard.demo', 'USR-001', true, '10.24.8.14', 'Mozilla/5.0 Hospital Chrome/124.0', NULL, NOW() - INTERVAL '45 minutes'),
('LGN-9002', 'nurse@medguard.demo', 'USR-002', true, '10.24.8.21', 'Mozilla/5.0 Hospital Edge/123.0', NULL, NOW() - INTERVAL '1 hour 20 minutes'),
('LGN-9003', 'unknown.attacker@external.net', NULL, false, '198.51.100.24', 'Python-requests/2.31.0', 'Invalid credentials / Unknown account', NOW() - INTERVAL '10 hours 48 minutes'),
('LGN-9004', 'unknown.attacker@external.net', NULL, false, '198.51.100.24', 'Python-requests/2.31.0', 'Invalid credentials / Unknown account', NOW() - INTERVAL '10 hours 47 minutes'),
('LGN-9005', 'unknown.attacker@external.net', NULL, false, '198.51.100.24', 'Python-requests/2.31.0', 'Invalid credentials / Unknown account', NOW() - INTERVAL '10 hours 46 minutes'),
('LGN-9006', 'unknown.attacker@external.net', NULL, false, '198.51.100.24', 'Python-requests/2.31.0', 'Invalid credentials / Unknown account', NOW() - INTERVAL '10 hours 45 minutes'),
('LGN-9007', 'unknown.attacker@external.net', NULL, false, '198.51.100.24', 'Python-requests/2.31.0', 'Invalid credentials / Unknown account', NOW() - INTERVAL '10 hours 44 minutes'),
('LGN-9008', 'security@medguard.demo', 'USR-003', true, '172.16.42.88', 'Mozilla/5.0 SecOps Workstation', NULL, NOW() - INTERVAL '10 hours 30 minutes');

-- ------------------------------------------------------------------------------
-- 5. ALERTS SEED DATA (Generated by Rule Detection Engine)
-- ------------------------------------------------------------------------------
INSERT INTO alerts (id, alert_type, type_display_name, user_id, user_name, user_role, user_department, severity, status, title, detail, rule_id, evidence, timestamp, created_at) VALUES
('ALT-2048', 'MASS_RECORD_RETRIEVAL', 'Unusually high record access', 'USR-003', 'Dr. Arjun Patel', 'General Medicine', 'General Medicine', 'Critical', 'Investigating', 'High volume record query exceeded safety threshold', '87 patient records were accessed within 10 minutes. The configured threshold is 50 records within 10 minutes.', 'RULE-02-MASS-ACCESS', '{"recordsAccessed": 87, "threshold": 50, "timeWindowMinutes": 10, "departmentsAccessed": 4, "emergencyMode": false, "ipAddress": "172.16.42.88", "trigger": "Threshold exceeded"}', NOW() - INTERVAL '10 hours 29 minutes', NOW() - INTERVAL '10 hours 29 minutes'),
('ALT-2047', 'ROLE_SCOPE_VIOLATION', 'Unauthorized department access', 'USR-002', 'Nurse Neha Verma', 'Nurse', 'Pediatrics', 'High', 'New', 'Cross-department record access attempted without bypass', 'An attempt was made to view a cardiology record outside the user''s assigned department.', 'RULE-03-SCOPE-VIOLATION', '{"userRole": "Nurse", "userDepartment": "Pediatrics", "targetPatientId": "MG-10482", "targetDepartment": "Cardiology", "action": "VIEW_RECORD", "result": "DENIED", "ipAddress": "10.24.8.21"}', NOW() - INTERVAL '11 hours 18 minutes', NOW() - INTERVAL '11 hours 18 minutes'),
('ALT-2046', 'REPEATED_FAILED_LOGIN', 'Multiple failed login attempts', NULL, 'Unknown external attacker', 'Unknown', 'Unknown', 'High', 'New', 'Potential brute-force authentication pattern', 'Six failed sign-in attempts were recorded from an unrecognized device within five minutes.', 'RULE-01-FAILED-LOGIN', '{"failedAttempts": 6, "threshold": 5, "timeWindowMinutes": 5, "ipAddress": "198.51.100.24", "targetEmails": ["admin@medguard.demo", "root@medguard.demo"]}', NOW() - INTERVAL '12 hours 48 minutes', NOW() - INTERVAL '12 hours 48 minutes'),
('ALT-2045', 'UNUSUAL_ACCESS_TIME', 'After-hours access', 'USR-005', 'Dr. Sameer Khan', 'Doctor', 'Neurology', 'Medium', 'Resolved', 'Non-emergency record access during off-duty shift', 'A patient record was accessed outside normal hours without an emergency access reason.', 'RULE-04-OFF-HOURS', '{"accessTime": "23:48", "shiftEnd": "20:00", "emergencyMode": false, "patientId": "MG-10804"}', NOW() - INTERVAL '1 day 8 hours', NOW() - INTERVAL '1 day 8 hours'),
('ALT-2044', 'MASS_RECORD_RETRIEVAL', 'Emergency access used', 'USR-006', 'Dr. Priya Nair', 'Doctor', 'Emergency', 'Low', 'Resolved', 'High-volume emergency triage access (False-Positive Filtered)', 'Emergency access was correctly activated and securely logged for audit review without alarm escalation.', 'RULE-05-EMERGENCY-EXCEPTION', '{"emergencyMode": true, "userRole": "Doctor", "department": "Emergency", "recordsAccessed": 120, "isFalsePositiveSuppressed": true}', NOW() - INTERVAL '1 day 12 hours', NOW() - INTERVAL '1 day 12 hours');

-- ------------------------------------------------------------------------------
-- 6. INVESTIGATIONS SEED DATA (Case Management)
-- ------------------------------------------------------------------------------
INSERT INTO investigations (id, alert_id, assigned_to, assigned_officer_name, status, notes, resolution_summary, created_at, updated_at) VALUES
('INV-5001', 'ALT-2048', 'USR-003', 'Arjun Patel', 'Under Investigation', 'Contacted Dr. Arjun Patel to verify whether bulk query was part of an authorized research batch or credential compromise. Account temporarily rate-limited.', NULL, NOW() - INTERVAL '10 hours 15 minutes', NOW() - INTERVAL '9 hours 30 minutes'),
('INV-5002', 'ALT-2045', 'USR-003', 'Arjun Patel', 'Resolved', 'Confirmed with Dr. Sameer Khan that he was called in for an urgent on-call neurology consultation.', 'Legitimate on-call consultation verified by department head.', NOW() - INTERVAL '1 day 7 hours', NOW() - INTERVAL '1 day 5 hours'),
('INV-5003', 'ALT-2044', 'USR-003', 'Arjun Patel', 'Resolved', 'Emergency room code blue incident. Mass trauma patient records triaged per hospital standard emergency protocol.', 'Emergency protocol compliance validated.', NOW() - INTERVAL '1 day 11 hours', NOW() - INTERVAL '1 day 10 hours');

-- Ensure tables are accessible to anon/authenticated client
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE investigations DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

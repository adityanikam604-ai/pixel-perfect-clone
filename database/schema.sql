-- ==============================================================================
-- MedGuard Platform - Database Schema (Supabase PostgreSQL)
-- FR-01, FR-02, FR-03, FR-05, FR-10, FR-13 Database Specification
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order for clean migrations
DROP TABLE IF EXISTS investigations CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS login_attempts CASCADE;
DROP TABLE IF EXISTS access_logs CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- Stores clinicians, security officers, and administrators
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    auth_user_id UUID UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Doctor', 'Nurse', 'Security officer', 'Administrator')),
    department VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Review', 'Suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);

-- ------------------------------------------------------------------------------
-- 2. PATIENTS TABLE (Mock Synthetic EHR Data)
-- ------------------------------------------------------------------------------
CREATE TABLE patients (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    initials VARCHAR(10) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 130),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    department VARCHAR(100) NOT NULL,
    diagnosis VARCHAR(255) NOT NULL,
    medical_history TEXT NOT NULL,
    treatment TEXT NOT NULL,
    assigned_doctor VARCHAR(255) NOT NULL,
    assigned_doctor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    last_access_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_department ON patients(department);
CREATE INDEX idx_patients_assigned_doctor_id ON patients(assigned_doctor_id);

-- ------------------------------------------------------------------------------
-- 3. ACCESS LOGS TABLE
-- Records every patient-record view, search, export, or denial event
-- ------------------------------------------------------------------------------
CREATE TABLE access_logs (
    id VARCHAR(64) PRIMARY KEY DEFAULT CONCAT('LOG-', FLOOR(RANDOM() * 90000 + 10000)::TEXT),
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    user_department VARCHAR(100) NOT NULL,
    patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(255),
    patient_department VARCHAR(100),
    action VARCHAR(100) NOT NULL CHECK (action IN ('VIEW_RECORD', 'SEARCH', 'REQUEST_ACCESS', 'EMERGENCY_ACCESS', 'EXPORT_DATA', 'BULK_ACCESS')),
    emergency_mode BOOLEAN DEFAULT FALSE,
    success BOOLEAN NOT NULL,
    result VARCHAR(50) NOT NULL CHECK (result IN ('Allowed', 'Denied', 'Flagged', 'Emergency')),
    reason TEXT,
    ip_address VARCHAR(45) NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'Low' CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_patient_id ON access_logs(patient_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp DESC);
CREATE INDEX idx_access_logs_result ON access_logs(result);
CREATE INDEX idx_access_logs_risk_level ON access_logs(risk_level);

-- ------------------------------------------------------------------------------
-- 4. LOGIN ATTEMPTS TABLE
-- Monitored for brute-force and repeated failed login detection (FR-06)
-- ------------------------------------------------------------------------------
CREATE TABLE login_attempts (
    id VARCHAR(64) PRIMARY KEY DEFAULT CONCAT('LGN-', FLOOR(RANDOM() * 90000 + 10000)::TEXT),
    email VARCHAR(255) NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    failure_reason VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_timestamp ON login_attempts(timestamp DESC);

-- ------------------------------------------------------------------------------
-- 5. ALERTS TABLE
-- Stores security anomalies generated by the Rule Detection Engine (FR-10)
-- ------------------------------------------------------------------------------
CREATE TABLE alerts (
    id VARCHAR(64) PRIMARY KEY,
    alert_type VARCHAR(100) NOT NULL CHECK (alert_type IN ('REPEATED_FAILED_LOGIN', 'MASS_RECORD_RETRIEVAL', 'ROLE_SCOPE_VIOLATION', 'UNUSUAL_ACCESS_TIME')),
    type_display_name VARCHAR(255) NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50),
    user_department VARCHAR(100),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'Investigating', 'Under Investigation', 'Confirmed Suspicious', 'Confirmed Legitimate', 'Resolved')),
    title VARCHAR(255) NOT NULL,
    detail TEXT NOT NULL,
    rule_id VARCHAR(50) NOT NULL,
    evidence JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);

-- ------------------------------------------------------------------------------
-- 6. INVESTIGATIONS TABLE
-- Case management for security officers (FR-13, FR-14)
-- ------------------------------------------------------------------------------
CREATE TABLE investigations (
    id VARCHAR(64) PRIMARY KEY DEFAULT CONCAT('INV-', FLOOR(RANDOM() * 90000 + 10000)::TEXT),
    alert_id VARCHAR(64) NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    assigned_to VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    assigned_officer_name VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('New', 'Investigating', 'Under Investigation', 'Confirmed Suspicious', 'Confirmed Legitimate', 'Resolved')),
    notes TEXT,
    resolution_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investigations_alert_id ON investigations(alert_id);
CREATE INDEX idx_investigations_status ON investigations(status);

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) & ACCESS PERMISSIONS
-- ------------------------------------------------------------------------------
-- Enable RLS on users table with granular policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read profiles" ON public.users;
CREATE POLICY "Allow users to read profiles"
ON public.users FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow user registration profile insert" ON public.users;
CREATE POLICY "Allow user registration profile insert"
ON public.users FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to update own profile" ON public.users;
CREATE POLICY "Allow users to update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id OR auth_user_id IS NULL)
WITH CHECK (auth.uid() = auth_user_id OR auth_user_id IS NULL);

-- Application mock tables access
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE investigations DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

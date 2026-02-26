-- BirthGuard Database Schema (MySQL)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL CHECK (role IN ('mother', 'chv')),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Mother profiles
CREATE TABLE IF NOT EXISTS mother_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  edd DATE NOT NULL,
  gravida INT,
  county VARCHAR(100),
  assigned_chv_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_chv_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user (user_id),
  INDEX idx_assigned_chv (assigned_chv_id)
);

-- CHV (Community Health Volunteer) profiles
CREATE TABLE IF NOT EXISTS chv_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  chv_id VARCHAR(50) UNIQUE NOT NULL,
  facility VARCHAR(255),
  operational_area VARCHAR(100),
  mothers_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (user_id),
  INDEX idx_chv_id (chv_id)
);

-- Symptom logs
CREATE TABLE IF NOT EXISTS symptom_logs (
  id VARCHAR(36) PRIMARY KEY,
  mother_id VARCHAR(36) NOT NULL,
  symptoms JSON,
  blood_pressure JSON,
  glucose DECIMAL(5, 2),
  general_feeling VARCHAR(50),
  notes TEXT,
  risk_score DECIMAL(3, 1),
  risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mother_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_mother_id (mother_id),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_risk_level (risk_level)
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(36) PRIMARY KEY,
  mother_id VARCHAR(36) NOT NULL,
  chv_id VARCHAR(36) NOT NULL,
  symptom_log_id VARCHAR(36),
  risk_score DECIMAL(3, 1),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mother_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chv_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (symptom_log_id) REFERENCES symptom_logs(id) ON DELETE CASCADE,
  INDEX idx_chv_id (chv_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at DESC)
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id VARCHAR(36) PRIMARY KEY,
  mother_id VARCHAR(36) NOT NULL,
  chv_id VARCHAR(36) NOT NULL,
  facility VARCHAR(255) NOT NULL,
  urgency VARCHAR(50) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mother_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chv_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chv_id (chv_id),
  INDEX idx_mother_id (mother_id),
  INDEX idx_status (status)
);

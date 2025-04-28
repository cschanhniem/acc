-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT, -- Added for email/password auth
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  subscription_tier TEXT DEFAULT 'free',
  subscription_ends_at DATETIME,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx')),
  file_size INTEGER NOT NULL,
  file_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  analyzed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Create contract_analysis table
CREATE TABLE IF NOT EXISTS contract_analysis (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  overall_risk TEXT NOT NULL CHECK (overall_risk IN ('low', 'medium', 'high')),
  confidence REAL NOT NULL,
  key_information JSON NOT NULL,
  risk_flags JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts (id)
);

-- Create analysis_requests table
CREATE TABLE IF NOT EXISTS analysis_requests (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts (id)
);

-- Create indexes
CREATE INDEX idx_contracts_user_id ON contracts (user_id);
CREATE INDEX idx_contract_analysis_contract_id ON contract_analysis (contract_id);
CREATE INDEX idx_analysis_requests_contract_id ON analysis_requests (contract_id);
CREATE INDEX idx_contracts_status ON contracts (status);

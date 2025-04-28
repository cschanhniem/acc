export interface User {
  id: string;
  email: string;
  name: string;
  password_hash?: string; // Added for email/password auth
  created_at: string;
  subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise';
  subscription_ends_at: string | null;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export interface Contract {
  id: string;
  user_id: string;
  file_name: string;
  file_type: 'pdf' | 'docx';
  file_size: number;
  file_key: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  uploaded_at: string;
  analyzed_at: string | null;
}

export interface ContractAnalysisDB {
  id: string;
  contract_id: string;
  overall_risk: 'low' | 'medium' | 'high';
  confidence: number;
  key_information: string; // JSON string
  risk_flags: string; // JSON string
  created_at: string;
}

export interface AnalysisRequest {
  id: string;
  contract_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type QueryResult<T> = Promise<DbResult<T>>;
export type QueryArrayResult<T> = Promise<DbResult<T[]>>;

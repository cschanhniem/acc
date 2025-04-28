export type RiskLevel = 'low' | 'medium' | 'high';

export interface Party {
  name: string;
  type: 'individual' | 'organization';
}

export interface CriticalDate {
  description: string;
  date: string;
}

export interface KeyInformation {
  parties: Party[];
  startDate: string | null;
  endDate: string | null;
  value: string | null;
  governingLaw: string | null;
  criticalDates: CriticalDate[];
}

export interface RiskFlag {
  type: string;
  severity: RiskLevel;
  description: string;
  clause?: string;
  recommendedAction?: string;
}

export interface ContractAnalysisResult {
  overallRisk: RiskLevel;
  confidence: number;
  keyInformation: KeyInformation;
  riskFlags: RiskFlag[];
}

export interface ContractUpload {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  fileSize: number;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ContractStatus {
  status: ContractUpload['status'];
  progress: number;
  error?: string;
}

export interface ContractMetadata {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  analyzedAt: string | null;
  status: string;
  riskLevel?: RiskLevel;
}

export interface ContractSummary {
  metadata: ContractMetadata;
  keyFindings: {
    risk: RiskLevel;
    criticalIssues: number;
    recommendations: number;
    requiresReview: boolean;
  };
}

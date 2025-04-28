/// <reference types="@cloudflare/workers-types" />

interface AnalysisQueueMessage {
  contractId: string;
  userId: string;
  fileKey: string;
}

interface Queue {
  send(message: AnalysisQueueMessage): Promise<void>;
}

interface Env {
  // R2 bucket for file storage
  BUCKET: R2Bucket;
  
  // Queue for analysis jobs
  ANALYSIS_QUEUE: Queue;

  // JWT secret for auth
  JWT_SECRET: string;

  // OpenAI API key
  OPENAI_API_KEY: string;
}

declare module '@aicontractcheck/shared' {
  export interface ContractUpload {
    id: string;
    userId: string;
    fileName: string;
    fileType: 'pdf' | 'docx';
    fileSize: number;
    uploadedAt: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  }

  export interface ContractAnalysisResult {
    id: string;
    contractId: string;
    keyInformation: {
      parties: Array<{
        name: string;
        type: 'individual' | 'organization';
      }>;
      effectiveDate?: string;
      duration?: string;
      governingLaw?: string;
      jurisdiction?: string;
    };
    riskFlags: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      clause?: string;
      recommendedAction?: string;
    }>;
    overallRisk: 'low' | 'medium' | 'high';
    analyzedAt: string;
    confidence: number;
  }
}

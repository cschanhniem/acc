export interface Env { // Add export here
  // R2 bucket for file storage
  BUCKET: R2Bucket;
  
  // Queue for analysis jobs
  ANALYSIS_QUEUE: Queue;

  // D1 Database
  DB: D1Database;

  // JWT secret for auth
  JWT_SECRET: string;

  // OpenAI API key
  OPENAI_API_KEY: string;

  // Stripe API keys
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;

  // Application URLs
  FRONTEND_URL: string;
  
  // Environment settings
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

export {}; // Add this line to make it a module

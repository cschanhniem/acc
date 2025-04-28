declare global {
  export interface Env {
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
}

export type AppBindings = { Bindings: Env };

export interface JWTVerifyResult {
  userId: string;
  email: string;
  exp: number;
}

export interface Variables {
  userId: string;
  [key: string]: any;
}

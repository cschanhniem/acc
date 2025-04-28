/// <reference types="vitest" />

declare namespace NodeJS {
  interface ProcessEnv {
    OPENAI_API_KEY: string;
    JWT_SECRET: string;
    ENVIRONMENT: string;
    [key: string]: string | undefined;
  }
  
  interface Global {
    console: Console;
  }
}

interface Console {
  error: typeof console.error;
  warn: typeof console.warn;
  log: typeof console.log;
  info: typeof console.info;
}

declare module 'vitest' {
  interface TestContext {
    env: {
      OPENAI_API_KEY: string;
      JWT_SECRET: string;
      ENVIRONMENT: string;
      [key: string]: string;
    };
  }
}

declare var process: NodeJS.Process;
declare var console: Console;
declare var global: NodeJS.Global;

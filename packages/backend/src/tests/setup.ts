import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables
beforeAll(() => {
  // Mock process.env
  process.env = {
    ...process.env,
    OPENAI_API_KEY: 'test-key',
    JWT_SECRET: 'test-secret',
    ENVIRONMENT: 'test'
  };

  // Mock console methods
  global.console.error = vi.fn();
  global.console.warn = vi.fn();
});

// Mock OpenAI API responses
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  overallRisk: 'low',
                  confidence: 85,
                  keyInformation: {
                    parties: [
                      { name: 'Test Corp', type: 'organization' }
                    ],
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    value: '10000',
                    governingLaw: 'California',
                    criticalDates: []
                  },
                  riskFlags: []
                })
              }
            }]
          })
        }
      }
    }
  };
});

// Clean up after all tests
afterAll(() => {
  vi.clearAllMocks();
});

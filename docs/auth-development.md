# Authentication System Development Guide

## Quick Start

1. Set up environment variables:
```bash
cd packages/backend
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your development values
```

2. Initialize local database:
```bash
pnpm wrangler d1 migrations apply DB --local
```

3. Start development server:
```bash
pnpm dev
```

## Testing Authentication Endpoints

### Email/Password Registration
```bash
curl -X POST http://localhost:8787/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123",
    "name": "Test User"
  }'
```

### Email/Password Login
```bash
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123"
  }'
```

### Token Refresh
```bash
curl -X POST http://localhost:8787/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'
```

## Error Handling Examples

### Input Validation Errors
```typescript
// Invalid email format
{
  "error": "Validation failed",
  "message": "Invalid email format",
  "details": [
    {
      "code": "invalid_string",
      "message": "Invalid email format",
      "path": ["email"]
    }
  ]
}

// Password too short
{
  "error": "Validation failed",
  "message": "Password must be at least 8 characters long",
  "details": [
    {
      "code": "too_small",
      "message": "Password must be at least 8 characters long",
      "path": ["password"]
    }
  ]
}
```

### Authentication Errors
```typescript
// Invalid credentials
{
  "error": "Authentication failed",
  "message": "Invalid email or password",
  "code": 401
}

// Google OAuth error
{
  "error": "Authentication failed",
  "message": "Failed to get Google user info",
  "code": 401
}
```

## Common Development Tasks

### 1. Adding New Validation Rules

```typescript
// In auth.ts
const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter"), // Add new rule
  name: z.string().min(1, "Name is required"),
});
```

### 2. Adding New Error Types

```typescript
// In ApiError class
private static determineCode(message: string | undefined): ErrorCode {
  // Add new error type
  if (message.includes("rate limit")) {
    return ErrorCodes.TOO_MANY_REQUESTS;
  }
  // ... existing error types
}
```

### 3. Testing Error Handling

```typescript
describe('Auth Error Handling', () => {
  it('should handle invalid input', async () => {
    const response = await app.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'short',
        name: ''
      })
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Validation failed');
    expect(data.details).toHaveLength(3);
  });
});
```

## Security Best Practices

1. Password Handling
   - Never store plain text passwords
   - Use bcrypt with appropriate salt rounds
   - Validate password strength

2. Token Security
   - Use short-lived access tokens
   - Implement secure token refresh
   - Include essential claims only

3. Error Messages
   - Don't expose internal details
   - Use consistent error formats
   - Log securely for debugging

4. Input Validation
   - Validate all inputs
   - Use strict schemas
   - Sanitize data appropriately

## Troubleshooting

### Common Issues

1. Token Verification Fails
   ```typescript
   // Check JWT_SECRET matches between token generation and verification
   // Ensure token hasn't expired
   const payload = await verify(token, c.env.JWT_SECRET);
   ```

2. Password Hash Mismatch
   ```typescript
   // Ensure consistent salt rounds
   const saltRounds = 10;
   const hash = await bcrypt.hash(password, saltRounds);
   ```

3. Validation Errors
   ```typescript
   // Use safeParse for detailed error information
   const result = schema.safeParse(data);
   if (!result.success) {
     console.log(result.error.issues);
   }
   ```

### Development Tips

1. Use TypeScript strictly
   ```typescript
   // Enable strict mode in tsconfig.json
   {
     "compilerOptions": {
       "strict": true
     }
   }
   ```

2. Test error cases
   ```typescript
   // Test invalid inputs
   // Test expired tokens
   // Test malformed requests
   ```

3. Monitor logs
   ```typescript
   // Use structured logging
   console.error({
     type: 'auth_error',
     message: error.message,
     stack: error.stack
   });

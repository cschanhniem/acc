# Components Directory

## Overview
This directory contains all reusable React components used throughout the AIContractCheck application. Components are organized by feature and functionality, promoting code reuse and maintainability.

## Directory Structure
```
components/
├── auth/          # Authentication related components
├── common/        # Shared utility components
└── layout/        # Layout and structural components
```

## Key Components

### Authentication Components
- `ProtectedRoute`: Higher-order component for route protection
- Located in: `auth/ProtectedRoute.tsx`
- Usage: Wraps routes that require authentication

### Common Components
- `LegalDisclaimer`: Displays legal information and terms
- `Pagination`: Handles data pagination
- Located in: `common/`
- Usage: Shared across multiple features

### Layout Components
- `Header`: Main navigation and app header
- `Footer`: Application footer with links
- `Layout`: Main layout wrapper
- `MobileMenu`: Responsive navigation menu
- Located in: `layout/`
- Usage: Provides consistent structure across pages

## Component Architecture

### Component Relationships
```mermaid
graph TD
    A[Layout] --> B[Header]
    A --> C[Main Content]
    A --> D[Footer]
    C --> E[Protected Routes]
    E --> F[Contract Analysis]
    
    subgraph Protected
        F --> G[Upload]
        F --> H[Analysis View]
    end
    
    subgraph Common
        I[Legal Disclaimer]
        J[Pagination]
    end
```

### Component Flow
```mermaid
sequenceDiagram
    participant U as User
    participant PR as ProtectedRoute
    participant CA as ContractAnalysis
    participant API as Backend API

    U->>PR: Access protected page
    PR->>PR: Check auth status
    alt Not Authenticated
        PR->>U: Redirect to login
    else Authenticated
        PR->>CA: Render component
        CA->>API: Request analysis
        API->>CA: Return results
        CA->>U: Display analysis
    end
```

## Implementation Guidelines

### Component Structure
```typescript
// Standard component structure
import React from "react";
import type { ComponentProps } from "react";

interface Props extends ComponentProps<"div"> {
  // Component specific props
}

export const MyComponent: React.FC<Props> = ({ ...props }) => {
  return (
    <div {...props}>
      {/* Component content */}
    </div>
  );
};
```

### Best Practices
1. Keep components focused and single-responsibility
2. Use TypeScript for type safety
3. Implement error boundaries where appropriate
4. Follow accessibility guidelines
5. Include prop documentation
6. Write unit tests for complex components

### Error Handling
```typescript
try {
  // Component logic
} catch (error) {
  // Error handling
  console.error("Component error:", error);
  // Display user-friendly error message
}
```

## Related Documentation
- [Frontend Architecture](/docs/auth-architecture.md)
- [Component Testing Guidelines](../README.md)
- [Accessibility Standards](/docs/a11y.md)

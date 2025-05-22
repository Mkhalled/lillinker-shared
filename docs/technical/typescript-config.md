# TypeScript Configuration

This document explains the TypeScript configuration used in the Lillinker project.

## Configuration Overview

The TypeScript configuration is defined in `tsconfig.json` and is optimized for a Next.js application with strict type checking and modern features.

## Key Settings

### Compiler Options

- **target**: "es5" - Specifies the ECMAScript target version
- **lib**: ["dom", "dom.iterable", "esnext"] - Includes DOM and ESNext libraries
- **strict**: true - Enables all strict type checking options
- **module**: "esnext" - Uses ES modules
- **moduleResolution**: "bundler" - Uses the bundler resolution strategy
- **jsx**: "preserve" - Preserves JSX for Next.js
- **incremental**: true - Enables incremental compilation
- **paths**: { "@/_": ["./src/_"] } - Configures path aliases

### Strict Type Checking

The configuration enables several strict type checking options:

- **noImplicitAny**: true - Disallows implicit 'any' types
- **noImplicitThis**: true - Disallows implicit 'this' types
- **noUnusedLocals**: true - Reports errors on unused locals
- **noUnusedParameters**: true - Reports errors on unused parameters
- **noImplicitReturns**: true - Ensures functions return values
- **noFallthroughCasesInSwitch**: true - Prevents fallthrough in switch statements

### File Inclusion

- **include**: Specifies files to be included in the compilation
  - next-env.d.ts
  - All TypeScript files (**/\*.ts, **/\*.tsx)
  - Next.js generated types (.next/types/\*_/_.ts)
- **exclude**: Excludes node_modules from compilation

## Best Practices

1. **Use TypeScript Features**:

   - Utilize interfaces and types for better code organization
   - Use type guards and assertions when necessary
   - Leverage generics for reusable components

2. **Path Aliases**:

   - Use the `@/*` path alias for imports from the src directory
   - Example: `import { Component } from '@/components/Component'`

3. **Type Safety**:

   - Always define types for function parameters and return values
   - Use TypeScript's utility types when appropriate
   - Avoid using `any` type; prefer `unknown` when the type is truly unknown

4. **Error Handling**:
   - Use TypeScript's type system to handle errors
   - Implement proper error boundaries in React components
   - Use type guards for runtime type checking

## Common Patterns

### Component Props

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant, size, onClick, children }) => {
  // Component implementation
};
```

### API Response Types

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

type UserResponse = ApiResponse<User>;
```

### Utility Types

```typescript
// Partial type for optional properties
type PartialUser = Partial<User>;

// Pick type for selecting specific properties
type UserName = Pick<User, 'name'>;

// Omit type for excluding specific properties
type UserWithoutId = Omit<User, 'id'>;
```

## Troubleshooting

### Common Issues

1. **Type Errors**:

   - Check for missing type definitions
   - Ensure proper type imports
   - Verify type compatibility

2. **Module Resolution**:

   - Verify path aliases are correctly configured
   - Check for circular dependencies
   - Ensure proper module exports

3. **Build Errors**:
   - Clear the `.next` directory
   - Check for conflicting type definitions
   - Verify TypeScript version compatibility

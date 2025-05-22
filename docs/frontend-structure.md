# Frontend Structure Documentation

## UI Components

### shadcn/ui Integration

The project uses [shadcn/ui](https://ui.shadcn.com/) for building accessible and customizable UI components. Components are located in `src/components/ui/` and follow the shadcn/ui conventions.

#### Component Structure

```typescript
// Example component structure
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-variant-classes",
        // ... other variants
      },
      size: {
        default: "default-size-classes",
        // ... other sizes
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  // ... additional props
}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Component.displayName = "Component"

export { Component, componentVariants }
```

#### Usage

```typescript
import { Component } from "@/components/ui/component"

export function Example() {
  return (
    <Component variant="default" size="default">
      Content
    </Component>
  )
}
```

## Layout Patterns

### Dashboard Layout

The dashboard layout (`src/app/(dashboard)/layout.tsx`) is a shared layout component that provides a consistent structure for all authenticated dashboard pages. It includes:

- Authentication check and redirect to login if not authenticated
- A top navigation bar with:
  - App name/logo
  - Current user's role indicator
  - Logout button
- Consistent styling and spacing for the main content area

#### Usage

All role-based dashboard pages (admin, company, consultant) use this shared layout. The role-specific layouts (`src/app/(dashboard)/[role]/layout.tsx`) are minimal and only serve to group related pages together.

Example structure:

```
src/app/(dashboard)/
├── layout.tsx              # Shared dashboard layout
├── admin/
│   ├── layout.tsx         # Admin group layout
│   └── page.tsx           # Admin dashboard page
├── company/
│   ├── layout.tsx         # Company group layout
│   └── page.tsx           # Company dashboard page
└── consultant/
    ├── layout.tsx         # Consultant group layout
    └── page.tsx           # Consultant dashboard page
```

#### Features

- **Authentication**: Automatically checks for authentication and redirects to login if needed
- **Role-based Access**: Displays the current user's role in the navigation bar
- **Consistent UI**: Provides a uniform look and feel across all dashboard pages
- **Logout Functionality**: Includes a logout button that redirects to the login page

#### Implementation Details

The dashboard layout uses:

- Next.js App Router layout pattern
- NextAuth.js for authentication
- Tailwind CSS for styling
- shadcn/ui components for consistent UI elements

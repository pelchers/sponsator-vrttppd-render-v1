# shadcn/ui Components Integration Guide

## Overview
> This section explains how we integrate and adapt shadcn/ui components from their Next.js origins to work in our Vite + React setup.

🌟 **New Dev Friendly Explanation**:
shadcn/ui provides a component system that we adapt from Next.js to Vite:
- Components are copied and modified rather than installed as a package
- Each component maintains its own dependencies and styles
- Components use Tailwind CSS for styling and theming

## Project Setup

### Required Dependencies
```json
{
  "dependencies": {
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### Tailwind Configuration
```typescript:client/tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... other color variables
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Utils Setup
```typescript:client/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Component Adaptation Process

### 1. Basic Component Structure
```typescript:client/src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Component definition remains similar to shadcn
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

🌟 **New Dev Friendly Explanation**:
Component structure follows a consistent pattern:
- Props interface defines component API
- Variants handle style variations
- Forward refs maintain component compatibility
- Composition patterns enable flexibility

### 2. Handling Next.js Specific Features

#### Image Components
```typescript
// From Next.js
import Image from 'next/image'
<Image src="/avatar.png" alt="avatar" width={64} height={64} />

// Our Vite adaptation
<img src="/avatar.png" alt="avatar" className="w-16 h-16 object-cover" />
```

#### Link Components
```typescript
// From Next.js
import Link from 'next/link'
<Link href="/dashboard">Dashboard</Link>

// Our Vite adaptation
import { Link } from 'react-router-dom'
<Link to="/dashboard">Dashboard</Link>
```

### 3. Theme Integration

#### Theme Provider Setup
```typescript:client/src/contexts/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme === "system" ? getSystemTheme() : theme)
  }, [theme])

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
```

### 4. Component Registry
```typescript:client/src/components/ui/registry.ts
// Central registry for all shadcn components
export { Button } from "./button"
export { Card, CardHeader, CardContent, CardFooter } from "./card"
export { Input } from "./input"
// ... other component exports
```

## Usage Examples

### Basic Component Usage
```typescript
import { Button } from "@/components/ui/button"

export function SubmitButton() {
  return (
    <Button variant="primary" size="lg">
      Submit
    </Button>
  )
}
```

### Composing Components
```typescript
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function UserCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{user.name}</h3>
      </CardHeader>
      <CardContent>
        <p>{user.bio}</p>
        <Button>View Profile</Button>
      </CardContent>
    </Card>
  )
}
```

### Theme-Aware Components
```typescript
import { useTheme } from "@/contexts/ThemeProvider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      Toggle Theme
    </Button>
  )
}
```

## Best Practices

1. Component Organization:
   - Keep components in dedicated ui/ directory
   - Maintain one component per file
   - Group related components (e.g., Card.tsx contains Card and subcomponents)

2. Style Management:
   - Use Tailwind classes for styling
   - Leverage CSS variables for theming
   - Maintain consistent class naming

3. Accessibility:
   - Preserve ARIA attributes
   - Maintain keyboard navigation
   - Test with screen readers

4. Performance:
   - Lazy load complex components
   - Use React.memo when beneficial
   - Monitor bundle size impact 
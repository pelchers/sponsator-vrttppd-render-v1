# My Little Tailwind Guide: Q&A

## Style Precedence

Q: How does Tailwind handle style conflicts?
A: Tailwind follows these rules:
1. Later classes override earlier ones
2. More specific selectors take precedence
3. `!` prefix forces highest precedence
4. Inline styles beat Tailwind classes

Example:
```tsx
// Base variant defines green background
const buttonStyles = {
  variants: {
    spring: `bg-spring`
  }
}

// Page-level class overrides it
<Button 
  variant="spring"
  className="!bg-transparent" // Overrides variant bg
>
  Click me
</Button>
```

## Component-Level vs Page-Level Styles

Q: Where should I define different types of styles?
A: Follow this hierarchy:
1. **Config Level** (tailwind.config.js)
   - Color schemes
   - Typography scales
   - Spacing systems
   - Custom animations

2. **Component Level** (Button.tsx, Card.tsx)
   - Base styles
   - Variants
   - Default behaviors
   - Reusable patterns

3. **Page Level** (pages/Home.tsx)
   - Layout-specific styles
   - One-off customizations
   - Context-specific overrides
   - Style variations

## Color System

Q: How do Tailwind color utilities work?
A: Colors defined in config automatically generate utilities:

```js
// tailwind.config.js
colors: {
  spring: {
    light: '#4dff99',
    DEFAULT: '#17FF7C',
    dark: '#00cc5c',
  }
}

// Generated utilities:
bg-spring         // Uses DEFAULT
bg-spring-light   // Uses light variant
bg-spring-dark    // Uses dark variant
text-spring       // Text color
border-spring     // Border color
ring-spring      // Focus ring color
```

## Style Composition

Q: How can I compose styles effectively?
A: Use these patterns:

1. **Base + Variants**
```tsx
const styles = {
  base: "rounded-lg border-2",
  variants: {
    primary: "bg-spring",
    secondary: "bg-turquoise"
  }
}
```

2. **Conditional Classes**
```tsx
className={cn(
  "base-styles",
  variant === "large" && "text-lg",
  isActive && "bg-spring"
)}
```

3. **Style Overrides**
```tsx
// Component defines default
<Card className="bg-white" />

// Page overrides it
<Card className="!bg-spring" />
```

## Common Gotchas

Q: Why aren't my styles applying as expected?
A: Check these common issues:

1. **Specificity Conflicts**
   - Use `!` prefix when needed
   - Check order of classes
   - Look for competing styles

2. **Missing Config**
   - Colors must be in tailwind.config.js
   - Custom values need proper definition
   - Check content paths are correct

3. **Class Order**
   - Later classes override earlier ones
   - Component classes vs passed classes
   - Base styles vs variants

## Best Practices

1. **Config Organization**
   ```js
   // Group related values
   theme: {
     extend: {
       colors: { /* color system */ },
       spacing: { /* spacing scale */ },
       animation: { /* animations */ }
     }
   }
   ```

2. **Component Structure**
   ```tsx
   // Separate concerns
   const styles = {
     base: "/* shared styles */",
     variants: { /* variations */ },
     states: { /* interactive states */ }
   }
   ```

3. **Style Overrides**
   ```tsx
   // Make override intentions clear
   className={`
     ${baseStyles}
     !bg-transparent  // Override background
     hover:!scale-110 // Override hover
   `}
   ```

## Quick Tips

1. Use `cn()` utility for conditional classes
2. Prefix with `!` for guaranteed override
3. Define colors in config, not hex values
4. Use semantic naming for variants
5. Keep base styles at component level
6. Override at page level when needed
7. Group related styles in config
8. Use proper hierarchy (config → component → page)

Remember: Tailwind is all about composition and override patterns. Understanding these makes customization much easier! 
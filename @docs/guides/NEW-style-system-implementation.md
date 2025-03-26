# Style System Implementation Guide

## Color System

### Primary Colors
```typescript
const colors = {
  // Main Colors
  springGreen: {
    DEFAULT: '#17FF7C',
    light: '#4dff99',    // Lighter shade
    dark: '#00cc5c',     // Darker shade
  },
  turquoise: {
    DEFAULT: '#16F5E4',
    light: '#4df7ea',
    dark: '#00c4b5',
  },
  redOrange: {
    DEFAULT: '#FF3E1C',
    light: '#ff704d',
    dark: '#cc2500',
  },
  westSide: {
    DEFAULT: '#FF900D',
    light: '#ffad4d',
    dark: '#cc7000',
  },
  lemon: {
    DEFAULT: '#F5F111',
    light: '#f7f44d',
    dark: '#c4c000',
  },
  
  // Neutrals
  neutral: {
    white: '#FFFFFF',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    black: '#000000',
  }
};
```

## Color Usage Patterns

### Background Colors
```typescript
// Use light variants for backgrounds
const backgroundPatterns = {
  primary: 'bg-springGreen-light',     // Subtle green background
  secondary: 'bg-turquoise-light',     // Soft turquoise sections
  warning: 'bg-westSide-light',        // Muted orange highlights
  accent: 'bg-lemon-light',            // Subtle yellow accents
};
```

### Interactive Elements
```typescript
// Use DEFAULT or dark variants for buttons/interactive elements
const interactivePatterns = {
  primary: {
    base: 'bg-springGreen-DEFAULT hover:bg-springGreen-dark',
    outline: 'border-springGreen-DEFAULT hover:bg-springGreen-light',
  },
  secondary: {
    base: 'bg-turquoise-DEFAULT hover:bg-turquoise-dark',
    outline: 'border-turquoise-DEFAULT hover:bg-turquoise-light',
  },
  danger: {
    base: 'bg-redOrange-DEFAULT hover:bg-redOrange-dark',
    outline: 'border-redOrange-DEFAULT hover:bg-redOrange-light',
  }
};
```

### Color Combinations
```typescript
// Example usage patterns
const commonPatterns = {
  card: {
    container: 'bg-white border-2 border-black',
    highlight: 'bg-springGreen-light border-l-4 border-l-springGreen-DEFAULT',
    warning: 'bg-westSide-light border-l-4 border-l-westSide-DEFAULT',
  },
  section: {
    primary: 'bg-springGreen-light border-b-2 border-black',
    secondary: 'bg-turquoise-light border-b-2 border-black',
    accent: 'bg-lemon-light border-b-2 border-black',
  },
  status: {
    success: 'bg-springGreen-light text-springGreen-dark',
    warning: 'bg-westSide-light text-westSide-dark',
    danger: 'bg-redOrange-light text-redOrange-dark',
  }
};
```

### Best Practices
1. **Backgrounds**
   - Use light variants for large areas
   - Keep contrast in mind for text readability
   - Layer different light shades for depth

2. **Interactive Elements**
   - Use DEFAULT color for base state
   - Use dark variant for hover/active states
   - Consider outline variants for secondary actions

3. **Borders and Accents**
   - Use black borders for main containers
   - Use color borders for emphasis or status
   - Combine light backgrounds with DEFAULT borders

4. **Status and Feedback**
   - Use light backgrounds with dark text
   - Maintain consistent meaning (e.g., green=success)
   - Consider accessibility in color choices

## Typography

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    heading: ['Inter', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
};
```

## Typography Conventions

### Text Hierarchy
```typescript
// Page Titles
className="text-4xl font-bold tracking-tight"

// Section Headers
className="text-2xl font-bold"

// Subsection Headers
className="text-xl font-bold"

// Card Titles
className="text-lg font-bold"
```

### Body Text
```typescript
// Large Body Text
className="text-lg font-normal"

// Regular Body Text
className="text-base font-normal"

// Small Text
className="text-sm font-normal"

// Micro Text
className="text-xs font-normal"
```

### Special Text Styles
```typescript
// Brand Text
className="font-honk text-4xl tracking-wide"

// Statistics
className="text-2xl font-bold"

// Navigation
className="text-sm font-medium"

// Labels
className="text-xs font-medium uppercase"
```

### Semantic Text Colors
```typescript
// Error Messages
className="text-red-DEFAULT"

// Success Messages
className="text-spring-DEFAULT"

// Info Messages
className="text-turquoise-DEFAULT"

// Warning Messages
className="text-orange-DEFAULT"
```

## Component Styles

### Buttons
```typescript
const buttonStyles = {
  base: `
    relative
    inline-flex
    items-center
    justify-center
    rounded-full
    border-2
    border-black
    px-4
    py-2
    text-sm
    font-medium
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
  `,
  variants: {
    primary: `
      bg-springGreen-DEFAULT
      hover:bg-springGreen-dark
      text-black
      border-black
    `,
    secondary: `
      bg-turquoise-DEFAULT
      hover:bg-turquoise-dark
      text-black
      border-black
    `,
    danger: `
      bg-redOrange-DEFAULT
      hover:bg-redOrange-dark
      text-white
      border-black
    `,
    warning: `
      bg-westSide-DEFAULT
      hover:bg-westSide-dark
      text-black
      border-black
    `,
    highlight: `
      bg-lemon-DEFAULT
      hover:bg-lemon-dark
      text-black
      border-black
    `
  }
};
```

### Cards
```typescript
const cardStyles = {
  base: `
    bg-white
    rounded-lg
    border-2
    border-black
    overflow-hidden
    transition-all
    duration-200
    hover:shadow-lg
  `,
  image: `
    aspect-video
    w-full
    object-cover
    border-b-2
    border-black
  `,
  content: `
    p-4
    space-y-4
  `
};
```

### Containers
```typescript
const containerStyles = {
  base: `
    max-w-7xl
    mx-auto
    px-4
    sm:px-6
    lg:px-8
  `,
  section: `
    py-12
    sm:py-16
    lg:py-20
  `
};
```

## Implementation Steps

1. Update Tailwind Config:
```typescript:tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
    }
  }
}
```

2. Create Style Components:
```typescript:client/src/components/ui/Button.tsx
export const Button = ({ variant = 'primary', className = '', ...props }) => {
  return (
    <button
      className={`${buttonStyles.base} ${buttonStyles.variants[variant]} ${className}`}
      {...props}
    />
  );
};
```

3. Update Card Components:
```typescript:client/src/components/cards/ProjectCard.tsx
<div className={cardStyles.base}>
  <div className={cardStyles.image}>
    <ProjectImage {...imageProps} />
  </div>
  <div className={cardStyles.content}>
    {/* Card content */}
  </div>
</div>
```

## Usage Examples

### Buttons
```tsx
<Button variant="primary">Create Project</Button>
<Button variant="secondary">View Details</Button>
<Button variant="danger">Delete</Button>
```

### Cards
```tsx
<div className={cardStyles.base}>
  <img 
    src={imageUrl} 
    alt={title}
    className={cardStyles.image}
  />
  <div className={cardStyles.content}>
    <h3 className="text-xl font-semibold">Card Title</h3>
    <p className="text-neutral-600">Card description...</p>
  </div>
</div>
```

### Layout
```tsx
<div className={containerStyles.base}>
  <section className={containerStyles.section}>
    <h2 className="text-3xl font-bold">Section Title</h2>
    {/* Content */}
  </section>
</div>
```

## Key Features

1. **Consistent Border Treatment**
   - All interactive elements have black borders
   - Rounded corners on all components
   - 2px border width for emphasis

2. **Color Usage**
   - Primary colors for main actions
   - Secondary/tertiary variations for hover states
   - Neutral scale for text and backgrounds

3. **Typography**
   - Inter font family for clean, modern look
   - Consistent scale for readability
   - Bold weights for emphasis

4. **Interactive States**
   - Hover effects on all clickable elements
   - Clear focus states for accessibility
   - Smooth transitions for polish

This implementation provides a cohesive, modern design system that's both playful and professional.

## Color Usage Guidelines

### Button Colors
```typescript
// Primary Actions (Links, Navigation, Checkout)
variant="spring"  // Green for positive/forward actions

// Secondary/Info Actions
variant="turquoise" // Blue for informational/neutral actions

// Destructive Actions
variant="red"    // Red for negative/destructive actions
```

### Section Backgrounds
```typescript
// Content Sections
className="bg-white border-2 border-black"  // White with black outline

// Grid/Explore Sections
variant="turquoise-light"  // Default for browse/explore areas
                          // Can be overridden based on context

// Cards
className="bg-white border-2 border-black"  // White with black outline
```

### Interactive Elements
1. **Buttons**
   - `spring` - Primary actions (Continue, Save, Submit)
   - `turquoise` - Information/Secondary actions (Learn More, Details)
   - `red` - Destructive actions (Delete, Cancel, Logout)
   - `ghost` - Subtle actions (Navigation items)

2. **Social Interactions**
   ```typescript
   // Social Action Colors
   const socialActionColors = {
     watch: 'orange',    // Watch/Subscribe actions
     follow: 'spring',   // Follow/Connect actions
     like: 'red',       // Like/Heart actions
     comment: 'turquoise' // Comment/Reply actions
   }
   
   // Usage examples
   <Button variant={socialActionColors.watch}>Watch</Button>
   <Button variant={socialActionColors.follow}>Follow</Button>
   <Icon className={`text-${socialActionColors.like}`} />
   ```

2. **Tags & Labels**
   ```typescript
   // Content Type Tags
   const contentTypeColors = {
     article: 'lemon',
     project: 'orange',
     post: 'turquoise',
     portfolio: 'spring'
   }

   // User Role Tags
   const userRoleColors = {
     admin: 'red',
     moderator: 'orange',
     contributor: 'turquoise',
     member: 'spring'
   }

   // Status Tags
   const statusColors = {
     active: 'spring',
     pending: 'orange',
     archived: 'neutral',
     featured: 'lemon'
   }
   ```

### Section Hierarchy
```typescript
// Page Layout
<PageSection variant="spring-light">
  // Main content wrapper
  
  // Browse/Explore Grid
  <SectionFull variant="turquoise-light">
    // Cards
    <Card variant="white">
      // Card content
    </Card>
  </SectionFull>
  
  // Featured Content
  <CategorySection variant="lemon-light">
    // Highlighted items
  </CategorySection>
</PageSection>
```

### Best Practices

1. **Button Consistency**
   - Use `spring` for primary actions
   - Use `red` for destructive actions
   - Use `turquoise` for informational actions
   - Maintain consistent meaning across app

2. **Section Colors**
   - Use light variants for large areas
   - Keep card backgrounds white by default
   - Use consistent colors for similar content types

3. **Tag System**
   - Color based on content type or status
   - Use consistent colors across similar tags
   - Consider accessibility in color choices

4. **Color Hierarchy**
   - Main sections: Light variants
   - Interactive elements: DEFAULT variants
   - Accents/highlights: Dark variants

5. **Contextual Usage**
   ```typescript
   // Example: Project Section
   <PageSection variant="spring-light">
     <CategorySection variant="turquoise-light">
       {projects.map(project => (
         <Card variant="white">
           <Button variant="spring">View Project</Button>
           <Button variant="red">Delete</Button>
           <Tag variant={getContentTypeColor('project')}>
             {project.type}
           </Tag>
         </Card>
       ))}
     </CategorySection>
   </PageSection>
   ```

### Implementation Notes

1. **Default Variants**
   ```typescript
   // Components should have sensible defaults
   interface SectionProps {
     variant?: ColorVariant;
     // ... other props
   }

   // Default to white for cards
   const Card = ({ variant = 'white' }) => // ...

   // Default to spring for primary buttons
   const Button = ({ variant = 'spring' }) => // ...
   ```

2. **Color Overrides**
   - Allow variant overrides via props
   - Document when to override defaults
   - Maintain consistent patterns 
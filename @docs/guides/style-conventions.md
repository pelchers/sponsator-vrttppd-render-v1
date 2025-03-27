# Style Conventions Guide

## Color System (60-30-10 Rule)

### Base Colors
```typescript
colors: {
  // Primary Colors with Updated Light Variants
  spring: {
    light: '#BDFFD9',
    DEFAULT: '#17FF7C',
    dark: '#00cc5c',
  },
  turquoise: {
    light: '#E7FEFC',
    DEFAULT: '#16F5E4',
    dark: '#00c4b5',
  },
  orange: {
    light: '#FFEBE8',
    DEFAULT: '#FF900D',
    dark: '#cc7000',
  },
  lemon: {
    light: '#FEFDE7',
    DEFAULT: '#F5F111',
    dark: '#c4c000',
  },
  red: {
    light: '#FFEBE8',
    DEFAULT: '#FF3E1C',
    dark: '#cc2500',
  },
  
  // Secondary/Container (30%)
  container: {
    DEFAULT: '#E6FFFE',  // Light turquoise for containers
    light: '#F0FFFD',    // Lighter variant
    dark: '#D9F9F8',     // Darker variant
  },
  
  // Accent/Interactive (10%)
  accent: {
    DEFAULT: '#17FF7C',  // Spring green for primary actions
    light: '#E7FFF1',    // Lighter variant
    dark: '#00cc5c',     // Darker variant
  }
}
```

### Color Distribution

1. **60% - Background & Base Elements**
   - Page background: Pure off-white (#FFFEFF)
   - Section backgrounds: Light gray variants
   - Non-interactive containers: Light gray variants
   - Default text: Dark gray/black

2. **30% - Secondary Elements**
   - Container backgrounds: Light turquoise
   - Non-interactive sections
   - Information displays
   - Secondary UI elements
   - Supporting content areas
   - Informative sections: Rich blue (#2563EB)

3. **10% - Accent & Interactive**
   - Primary buttons: Spring green
   - Call-to-action elements
   - Important highlights
   - Interactive indicators
   - Success states

### Component Color Usage

1. **Cards & Interactive Elements**
   ```typescript
   // Interactive cards (user cards, content cards)
   className="bg-white" // Pure white background
   
   // Information containers
   className="bg-container" // Light turquoise background
   
   // Non-interactive sections
   className="bg-background" // Light gray background
   ```

2. **Section Backgrounds**
   ```typescript
   // Main content areas
   className="bg-background"
   
   // Featured sections
   className="bg-container"
   
   // Call-to-action sections
   className="bg-accent-light"
   ```

### Color Variations

1. **Primary Colors**
   - Can be used for buttons and interactive elements
   - Should follow established semantic meanings
   - Use light variants for large areas
   - Use DEFAULT variants for interactive elements
   - Use dark variants for hover/active states

2. **Background Variations**
   - Light variants for elevated content
   - Dark variants for recessed content
   - Maintain sufficient contrast with text

3. **Container Variations**
   - Can use other light primary colors when specified
   - Should maintain visual hierarchy
   - Consider content importance when choosing variants

### Best Practices

1. **Consistency**
   - Stick to the 60-30-10 distribution
   - Use consistent colors for similar components
   - Maintain established color meanings

2. **Accessibility**
   - Ensure sufficient contrast ratios
   - Use color to support, not convey, meaning
   - Consider color-blind users

3. **Hierarchy**
   - Use color to establish visual hierarchy
   - More important = more saturated
   - Less important = more subtle 

## Typography

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

// Body Text
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

## Interactive Elements

### Button Types
```typescript
// Primary Actions (Links, Navigation, Checkout)
variant="spring"

// Information/Secondary Actions
variant="turquoise"

// Destructive Actions
variant="red"
```

### Social Actions
```typescript
// Social Action Colors
const socialActionColors = {
  watch: 'orange',    // Watch/Subscribe actions
  follow: 'spring',   // Follow/Connect actions
  like: 'red',       // Like/Heart actions
  comment: 'turquoise' // Comment/Reply actions
}
```

## Content Type Colors
```typescript
// Content Types
const contentTypeColors = {
  article: 'lemon',
  project: 'orange',
  post: 'turquoise',
  portfolio: 'spring'
}

// User Roles
const userRoleColors = {
  admin: 'red',
  moderator: 'orange',
  contributor: 'turquoise',
  member: 'spring'
}

// Status Indicators
const statusColors = {
  active: 'spring',
  pending: 'orange',
  archived: 'neutral',
  featured: 'lemon'
}
```

## Usage Examples

### Button Implementation
```typescript
// Primary Action
<Button variant="spring">Create Project</Button>

// Social Action
<Button variant={socialActionColors.watch}>Watch</Button>

// Destructive Action
<Button variant="red">Delete</Button>
```

### Section Implementation
```typescript
<PageSection variant="background">
  <SectionFull variant="container">
    <Card variant="white">
      {/* Card content */}
    </Card>
  </SectionFull>
</PageSection>
```

### Typography Implementation
```typescript
// Page Title
<h1 className="text-4xl font-bold tracking-tight">
  Welcome Back!
</h1>

// Brand Text
<span className="font-honk text-4xl tracking-wide">
  Platform Name
</span>

// Navigation Item
<Link className="text-sm font-medium">
  Dashboard
</Link>
```

### Border Specifications
```typescript
// Cards & Content Containers
className="border border-black" // 1px black border

// Buttons & Interactive Elements
className="border-2 border-black" // 2px black border
```

### Informative Elements
```typescript
// Informative Cards & Sections
className="bg-[#2563EB] text-white"  // Rich blue background with white text

// Informative Stats
className="text-[#2563EB]"  // Rich blue text for statistics

// Usage Examples:
<div className="bg-[#2563EB] text-white p-8 rounded-2xl">
  <h3>Platform Features</h3>
  {/* Informative content */}
</div>

<span className="text-[#2563EB] font-bold text-2xl">
  {/* Statistical value */}
</span>
``` 
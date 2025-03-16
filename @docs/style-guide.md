# Style Guide

## Table of Contents
1. Colors
2. Typography
3. Layout & Spacing
4. Components
5. Animations & Transitions
6. Icons & Images
7. Forms & Inputs
8. Navigation
9. Responsive Design
10. Accessibility

## Colors

### Brand Colors
[To be defined]

### UI State Colors
- Default Button Blue: `bg-blue-500`
- Hover Green: `hover:bg-green-500`
- Danger/Logout Red: `text-red-500` with `hover:text-red-700` and `hover:bg-red-50`

## Typography
[To be defined]

## Layout & Spacing
[To be defined]

## Components

### Button Conventions
1. **Standard Navigation Button**
```typescript
const navButtonClass = "transition-all duration-200 hover:scale-105 hover:text-green-500 font-medium";
```

2. **Dropdown Menu Items**
```typescript
const dropdownItemClass = "transition-all duration-200 hover:bg-green-50 hover:text-green-500 cursor-pointer";
```

3. **Sign Up Button**
```typescript
className="bg-blue-500 hover:bg-green-500 text-white transition-all duration-200 hover:scale-105"
```

4. **Danger Button (e.g., Logout)**
```typescript
className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 cursor-pointer"
```

### Animation Conventions
All interactive elements should use:
- Smooth transitions: `transition-all duration-200`
- Hover scale effect: `hover:scale-105`
- Color transitions should be included in the transition

### Card Conventions
1. **Standard Content Card**
```typescript
// Base card container
className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col relative transition-all duration-250 hover:scale-105 hover:shadow-lg"

// Card link wrapper with group hover
className="flex-grow p-4 flex flex-col group"

// Card title with hover effect
className="font-medium text-gray-900 group-hover:text-green-500 transition-colors duration-250"

// Card content with hover effect
className="text-gray-700 group-hover:text-gray-900 transition-colors duration-250"

// Interactive elements (buttons, links)
className="transition-all duration-250 hover:scale-105"
```

2. **Card Interaction Elements**
- All cards should scale up on hover
- Content should smoothly transition colors on hover
- Interactive elements should have their own hover states
- Consistent timing (250ms) for all transitions
- Enhanced shadow on card hover

3. **Card Footer**
```typescript
// Footer container
className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center"

// Action buttons
className="flex items-center gap-2"
```

### Card Best Practices
1. Use `group` for coordinated hover effects
2. Maintain consistent spacing (p-4 for content)
3. Include hover feedback for all interactive elements
4. Use semantic HTML structure
5. Implement proper error handling for images
6. Follow accessibility guidelines

## Icons & Images
[To be defined]

## Forms & Inputs
[To be defined]

## Navigation

### Hover States
All navigation items should:
1. Scale up slightly on hover
2. Change text color to green
3. Have a smooth transition
4. Maintain consistent spacing

## Responsive Design
[To be defined]

## Accessibility

### Interactive Elements
All interactive elements should have:
- Clear hover states
- Sufficient color contrast
- Appropriate cursor indicators

## Animation & Transitions

### Standard Transitions
```typescript
// Base transition class for interactive elements
const baseTransition = "transition-all duration-200";

// Hover animation for links and buttons
const hoverAnimation = "hover:scale-105";

// Combined standard interactive element classes
const interactiveElement = "transition-all duration-200 hover:scale-105 cursor-pointer";
```

### Color Transitions
- All color changes should be smooth: include both background and text colors in transitions
- Use consistent timing (200ms) for all transitions
- Combine with scale effects where appropriate

## Best Practices

### Button and Link Styling
1. Always include:
   - Transition property
   - Duration
   - Hover state
   - Cursor indicator
   - Scale effect (where appropriate)

2. Use semantic colors:
   - Success/Confirmation: Green
   - Primary Actions: Blue
   - Danger/Delete: Red

### Animation Performance
- Use `transform` and `opacity` for better performance
- Keep transitions under 300ms for responsiveness
- Avoid animating layout properties when possible

# Landing Page Conventions

## Section Organization
1. Hero Section
2. How It Works
3. Success Stories Testimonials
4. For Creators/Brands Split Sections
5. Platform Metrics
6. Platform Features
7. Why Choose Us
8. Success Stories Gallery
9. About Platform
10. Our Commitment
11. Join Waitlist
12. Footer

## Animation Standards
- Scroll Fade: `scroll-fade invisible transition-all duration-700 transform translate-y-10 opacity-0`
- Hover Effects: `transition-all duration-250 hover:scale-105`
- Float Animation: `animate-float` (variants: `animate-float-delay-1`, `animate-float-delay-2`)
- Carousel: `animate-carousel` for auto-scrolling galleries

## Section Layout
- Standard Padding: `py-16 px-4`
- Content Container: `max-w-6xl mx-auto`
- Background Pattern: Alternate between:
  - `bg-white`
  - `bg-gray-50`
  - `bg-blue-600` (for highlight sections)
- Card Shadows: `shadow-lg hover:shadow-xl`
- Border Radius: `rounded-2xl`

## Interactive Components
- Primary Button: `bg-blue-600 hover:bg-green-500 text-white`
- Secondary Button: `border-2 border-blue-600 text-blue-600 hover:bg-green-500`
- Transitions: `transition-all duration-250 hover:scale-105`

## Typography Hierarchy
- Section Headers: `text-4xl font-semibold text-center mb-16`
- Brand Font Usage: `font-honk` for special text elements
- Text Colors: 
  - Body: `text-gray-600`
  - Secondary: `text-gray-500`
  - Accent: `text-blue-600`

## Responsive Patterns
- Mobile-First Design
- Grid Breakpoints:
  - md: `md:grid-cols-2`
  - lg: `lg:grid-cols-4`
- Stack on mobile, grid on desktop

---

Note: This style guide is a living document and will be updated as we establish more conventions and design patterns. 
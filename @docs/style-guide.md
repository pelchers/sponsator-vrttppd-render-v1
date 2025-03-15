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

---

Note: This style guide is a living document and will be updated as we establish more conventions and design patterns. 
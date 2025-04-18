# Importing shadcn Components from v0

## Overview
This guide outlines the process of adapting components generated by v0.dev for use in our Vite + React application.

## Prerequisites
- shadcn base configuration complete
- Required dependencies installed
- Project structure set up correctly

## Step-by-Step Process

### 1. Initial Component Setup
1. Copy v0-generated code
2. Create appropriate file in components/ui
   ```bash
   # Example for form component
   touch client/src/components/ui/form.tsx
   ```
3. Paste v0 code into new file
4. Identify all dependencies and imports

### 2. Dependency Resolution
1. Check package.json for required dependencies
   ```json
   {
     "dependencies": {
       "@radix-ui/react-label": "^2.0.0",
       "@radix-ui/react-slot": "^1.0.0"
       // Add other required packages
     }
   }
   ```
2. Install missing dependencies
   ```bash
   cd client
   npm install @package-name
   ```
3. Verify shadcn utility functions are available
4. Check Tailwind configuration for required plugins

### 3. Import Adaptation
1. Replace Next.js specific imports:
   ```typescript
   // From
   import Image from 'next/image'
   import Link from 'next/link'
   
   // To
   import { Link } from 'react-router-dom'
   // Use standard <img> tag
   ```

2. Update shadcn component paths:
   ```typescript
   // From
   import { Button } from "@/components/ui/button"
   
   // To (verify path matches your setup)
   import { Button } from "./button"
   ```

3. Check for context dependencies:
   ```typescript
   // Ensure required providers exist
   import { ThemeProvider } from "@/contexts/theme"
   import { FormProvider } from "@/contexts/form"
   ```

### 4. Feature Adaptation
1. Replace Next.js specific features:
   ```typescript
   // From
   const router = useRouter()
   
   // To
   const navigate = useNavigate()
   ```

2. Update API endpoints:
   ```typescript
   // From
   fetch('/api/submit')
   
   // To
   fetch('http://localhost:4000/api/submit')
   ```

3. Convert server-side props to React patterns:
   ```typescript
   // From
   export async function getServerSideProps()
   
   // To
   useEffect(() => {
     // Fetch data here
   }, [])
   ```

### 5. Testing & Verification
1. Check component renders correctly
2. Verify all interactions work
3. Test dark/light theme compatibility
4. Ensure responsive design works
5. Test with actual data flow

## Common Issues & Solutions

### 1. Styling Issues
- Check Tailwind configuration
- Verify CSS variables exist
- Ensure proper class merging with cn utility

### 2. Context Errors
- Verify provider hierarchy
- Check context import paths
- Ensure providers are mounted

### 3. Type Errors
- Update type imports
- Check for Next.js specific types
- Verify proper type exports

## Best Practices

1. **Component Organization**
   - Keep related components together
   - Maintain consistent file structure
   - Document component dependencies

2. **Code Cleanliness**
   - Remove unused imports
   - Clean up Next.js artifacts
   - Update comments for clarity

3. **Performance**
   - Check bundle size impact
   - Optimize imports
   - Consider code splitting

## Example Workflow
```bash
# 1. Create component file
mkdir -p client/src/components/ui
touch client/src/components/ui/new-component.tsx

# 2. Install dependencies
cd client
npm install @required-packages

# 3. Copy v0 code and adapt
# 4. Test component
# 5. Commit changes
git add .
git commit -m "feat: add adapted v0 component"
```

## Verification Checklist
- [ ] All dependencies installed
- [ ] Imports updated
- [ ] Next.js features replaced
- [ ] API endpoints updated
- [ ] Styling works correctly
- [ ] Dark/light theme working
- [ ] Component fully interactive
- [ ] Types are correct
- [ ] No console errors
- [ ] Documentation updated 
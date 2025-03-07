# Project Form Implementation Guide

## User Action Flow: Saving a Project
When a user edits and saves a project, here's the complete file flow:

1. User interacts with **`ProjectEditFormV3.tsx`** (UI component with form elements)
2. Form uses **`useProjectForm.ts`** (Custom hook managing form state and validation)
3. On submit, hook calls **`api/projects.ts`** (API service with project CRUD functions) sent using the config file
4. API service sends HTTP request to backend endpoint
5. Request hits **`server/src/routes/projectRoutes.ts`** (API route definitions)
6. Router calls **`server/src/controllers/projectController.ts`** (Request/response handler)
7. Controller validates request and calls **`server/src/services/projectService.ts`** (Business logic)
8. Service processes data and uses **Prisma client** to interact with the database
9. Response flows back through the same layers:
   - **Database → Service**: Prisma returns updated project data to `projectService.ts`
   - **Service → Controller**: `projectService.ts` processes/formats data and returns to `projectController.ts`
   - **Controller → Route**: `projectController.ts` constructs HTTP response with status and data
   - **Backend → Frontend**: Response data arrives at the `api/projects.ts` function
   - **API → Hook**: `api/projects.ts` resolves the Promise with the response data to `useProjectForm.ts`
10. UI updates based on the response (success/error states)

This architecture ensures separation of concerns, maintainability, and scalability of your application.

This guide maps our project form implementation to the existing profile form implementation, showing the parallel files and steps.

## File Mapping

### Frontend Files
| Profile Implementation | Project Implementation | Status |
|-----------------------|------------------------|---------|
| `useProfileForm.ts` | `useProjectForm.ts` | ✅ Exists |
| `ProfileEditForm.tsx` | `ProjectEditFormV3.tsx` | ✅ Exists |
| `editprofile.tsx` | `editproject.tsx` | ✅ Exists |
| `api/users.ts` | `api/projects.ts` | ✅ Exists |

### Backend Files
| Profile Implementation | Project Implementation | Status |
|-----------------------|------------------------|---------|
| `userService.ts` | `projectService.ts` | ✅ Exists |
| `userController.ts` | `projectController.ts` | ✅ Exists |
| `userRoutes.ts` | `projectRoutes.ts` | ✅ Exists |

## Implementation Steps

### Frontend Steps

1. **API Integration Layer**
   ```typescript
   // api/projects.ts
   export const updateProject = async (projectId, data) => {
     // Handle request
     // Transform data
     // Make API call
   }
   // api/config.ts
   export const API_URL = 'http://localhost:4100/api'; 
   export const API_ROUTES = {
    PROJECTS: {
      UPDATE: '/projects/:id',
      CREATE: '/projects',
      DELETE: '/projects/:id',
    }
   }
   ```
   - Implement proper error handling
   - Handle file uploads
   - Transform data for API

2. **Form State Management**
   - Reference: `useProfileForm.ts`
   - Target: `useProjectForm.ts`
   - Key Updates:
     - Form validation
     - File handling
     - State management
     - Error handling
     - Success handling

3. **Form Component**
   - Reference: `ProfileEditForm.tsx`
   - Target: `ProjectEditFormV3.tsx`
   - Key Updates:
     - Verify form submission
     - Test conditional rendering
     - Validate error display
     - Test success states

4. **Page Component**
   - Reference: `editprofile.tsx`
   - Target: `editproject.tsx`
   - Key Updates:
     - Route handling
     - Authorization checks
     - Loading states


### Backend Steps

1. **Database Layer**
   - Reference: Prisma schema
   - Files to Update:
     - `projectService.ts`: Verify data transformation
     - Focus on JSON field handling for complex data

2. **Service Layer**
   ```typescript
   // userService.ts (reference)
   updateUserInDB(userId, data)

   // projectService.ts (target)
   updateProject(projectId, data)
   ```
   - Implement proper error handling
   - Handle JSON serialization/deserialization
   - Manage file uploads

3. **Controller Layer**
   ```typescript
   // projectController.ts
   updateProject(req, res) {
     // Validate request
     // Call service
     // Handle response
   }
   ```
   - Add proper validation
   - Implement error handling
   - Handle file uploads

4. **Routes Layer**
   - Verify routes are properly configured
   - Ensure authentication middleware is in place
   - Test endpoints with Postman/Insomnia


## Testing Flow

### Backend Testing
1. Test database operations
2. Verify service layer transformations
3. Test API endpoints
4. Validate error handling
5. Test file uploads

### Frontend Testing
1. Test form submission
2. Verify conditional rendering
3. Test file uploads
4. Validate error states
5. Check success flows

## Key Differences to Note

### Backend Differences
1. **Data Structure**
   - Projects have more complex nested data
   - Need JSON field handling
   - Multiple file upload support

2. **Validation**
   - Project-specific field validation
   - Optional fields based on project type
   - File type/size validation

### Frontend Differences
1. **Conditional Rendering**
   - Project type determines visible fields
   - Dynamic form sections
   - Complex validation rules

2. **File Handling**
   - Multiple upload points
   - Progress indicators
   - Preview functionality

## Implementation Order

### Frontend First
1. Update `api/projects.ts` integration
   - Define API contract
   - Implement CRUD operations
   - Handle file uploads

2. Verify form submission in `useProjectForm.ts`
   - Match API contract
   - Handle state management
   - Manage file uploads

### Then Backend
1. Update `projectService.ts` to match API contract
2. Implement error handling in `projectController.ts`
3. Set up file upload handling
4. Test API endpoints

### Finally Integration
1. Test form submission flow
2. Verify file uploads
3. Test error handling
4. Validate success states

Would you like me to start with the backend or frontend implementation? 
# Dual Image Implementation Guide (Projects System)

This guide extends the profile image implementation to handle project images, incorporating all fixes and improvements from the profile system.

## Goals and Expected Functionality

1. Allow users to choose between two image sources:
   - External URL
   - File upload
2. Maintain image source preference (`url` or `upload`) in the database
3. Clear unused fields when switching modes
4. Show proper preview for both modes
5. Handle image display consistently across all project views
6. Preserve image choice when editing existing projects

## Key Differences from Profile Implementation

1. **Directory Structure**:
   ```bash
   server/
     ├── uploads/
     │   ├── profiles/    # From previous implementation
     │   └── projects/    # New directory for project images
     └── src/
         └── middleware/
             └── upload.ts
   ```

2. **Field Names**:
   ```prisma
   model projects {
     project_image_url    String?   // For external URLs
     project_image_upload String?   // For uploaded file paths (relative to uploads/projects)
     project_image_display String?  @default("url")  // Tracks which mode is active
   }
   ```

3. **File Size Limits**:
   - Projects: 10MB (larger for high-quality project images)
   - Profiles: 5MB (standard profile photos)

## Common Issues and Solutions

1. **URL Mode Not Persisting**:
   ```typescript
   // In transformFormDataForApi:
   apiData.project_image_display = formData.project_image_display || 'url';
   apiData.project_image_url = formData.project_image_display === 'url' 
     ? formData.project_image_url 
     : '';
   apiData.project_image_upload = formData.project_image_display === 'upload' 
     ? formData.project_image_upload 
     : '';
   ```

2. **Image Not Loading After Save**:
   ```typescript
   // In mapProjectToFrontend:
   const processedProject = {
     ...project,
     project_image: project.project_image_display === 'url' 
       ? project.project_image_url
       : project.project_image_upload 
         ? `/uploads/${project.project_image_upload}`
         : null,
     // Keep original fields for form
     project_image_url: project.project_image_url || '',
     project_image_upload: project.project_image_upload || '',
     project_image_display: project.project_image_display || 'url'
   };
   ```

3. **Null vs Empty String**:
   ```typescript
   // Use empty strings instead of null when clearing fields
   onClick={() => setFormData(prev => ({ 
     ...prev, 
     project_image_display: "url",
     project_image_upload: "" // Use empty string instead of null
   }))}
   ```

4. **Preview Not Showing**:
   ```typescript
   // Add proper preview for URL mode
   {formData.project_image_display === "url" && formData.project_image_url && (
     <div className="mt-4 flex justify-center">
       <img
         src={formData.project_image_url}
         alt="Project preview"
         className="w-64 h-48 object-cover rounded-lg border-2 border-gray-200"
         onError={(e) => {
           const target = e.target as HTMLImageElement;
           target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image+URL';
         }}
       />
     </div>
   )}
   ```

## Implementation Checklist

1. ✅ Database Schema
   - Add project image fields
   - Set proper defaults
   - Run migrations

2. ✅ Server Setup
   - Create projects upload directory
   - Configure static file serving
   - Update upload middleware

3. ✅ Form Components
   - Add image toggle buttons
   - Implement URL input
   - Add upload component
   - Show appropriate preview

4. ✅ Data Handling
   - Transform form data correctly
   - Handle mode switching
   - Clear unused fields
   - Preserve image choice

5. ✅ Display Components
   - Create ProjectImage component
   - Handle both image sources
   - Show fallback for missing images
   - Maintain consistent display

6. ✅ Error Handling
   - Validate file types and sizes
   - Handle upload failures
   - Show user feedback
   - Handle invalid URLs

## Testing Checklist

1. ✅ URL Mode
   - Enter valid URL
   - Show preview
   - Save and verify display
   - Handle invalid URLs

2. ✅ Upload Mode
   - Select file
   - Show preview
   - Save and verify display
   - Handle upload errors

3. ✅ Mode Switching
   - URL to Upload
   - Upload to URL
   - Clear unused fields
   - Preserve selected mode

4. ✅ Edit Form
   - Load existing image
   - Show correct mode
   - Update image
   - Preserve choices

5. ✅ Display
   - Project list view
   - Project details
   - Edit form
   - Consistent sizing

This implementation provides a robust solution for handling both URL and uploaded images in projects, with proper state management, error handling, and user feedback. 
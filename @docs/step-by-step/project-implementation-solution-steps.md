# Resolving Form Data Submission Issues in a Monorepo Project

## Problem Overview

We encountered several issues with our project form submission where data was being logged correctly in the server but not being saved to the database. The main problems were:

1. **Type Mismatches**: Form data arrays were being sent as strings instead of proper arrays
2. **Missing Fields**: Some fields in the form weren't being included in the database update
3. **Nested Object Handling**: Nested objects in the form data weren't being properly flattened for the database
4. **JSON Parsing Errors**: After updates, we encountered "is not a function" errors when trying to map over stringified JSON data
5. **Missing Sections**: Several sections weren't displaying properly on the project view page, particularly:
   - Availability section
   - Project status and preferred collaboration type
   - Seeking and social links sections
   - Advisors, partners, and testimonials details

## Solution Steps

### 1. Fix the Form Data Transformation

The first issue was in the `transformFormDataForApi` function in `useProjectForm.ts`. We needed to:

- Properly handle file uploads
- Flatten nested objects into individual fields
- Stringify array fields for database storage
- Explicitly include missing fields like `project_status` and `preferred_collaboration_type`

```typescript
// Transform form data before sending to API
const transformFormDataForApi = (formData: ProjectFormDataWithFile) => {
  // Create a copy to avoid mutating the original
  const apiData = { ...formData };
  
  // Make sure project_status and preferred_collaboration_type are included
  apiData.project_status = formData.project_status || '';
  apiData.preferred_collaboration_type = formData.preferred_collaboration_type || '';
  
  // Handle file upload separately
  if (formData.project_image instanceof File) {
    apiData.project_image_file = formData.project_image;
    apiData.project_image = null;
  }
  
  // Explicitly flatten nested objects to individual fields
  if (formData.seeking) {
    apiData.seeking_creator = formData.seeking.creator;
    apiData.seeking_brand = formData.seeking.brand;
    apiData.seeking_freelancer = formData.seeking.freelancer;
    apiData.seeking_contractor = formData.seeking.contractor;
    delete apiData.seeking; // Remove the nested object
  }
  
  // Similar flattening for other nested objects
  if (formData.social_links) {
    apiData.social_links_youtube = formData.social_links.youtube;
    apiData.social_links_instagram = formData.social_links.instagram;
    apiData.social_links_github = formData.social_links.github;
    apiData.social_links_twitter = formData.social_links.twitter;
    apiData.social_links_linkedin = formData.social_links.linkedin;
    delete apiData.social_links; // Remove the nested object
  }
  
  if (formData.notification_preferences) {
    apiData.notification_preferences_email = formData.notification_preferences.email;
    apiData.notification_preferences_push = formData.notification_preferences.push;
    apiData.notification_preferences_digest = formData.notification_preferences.digest;
    delete apiData.notification_preferences; // Remove the nested object
  }
  
  // Stringify array fields
  if (Array.isArray(apiData.team_members)) {
    apiData.team_members = JSON.stringify(apiData.team_members);
  }
  
  if (Array.isArray(apiData.collaborators)) {
    apiData.collaborators = JSON.stringify(apiData.collaborators);
  }
  
  if (Array.isArray(apiData.advisors)) {
    apiData.advisors = JSON.stringify(apiData.advisors);
  }
  
  if (Array.isArray(apiData.partners)) {
    apiData.partners = JSON.stringify(apiData.partners);
  }
  
  if (Array.isArray(apiData.testimonials)) {
    apiData.testimonials = JSON.stringify(apiData.testimonials);
  }
  
  if (Array.isArray(apiData.deliverables)) {
    apiData.deliverables = JSON.stringify(apiData.deliverables);
  }
  
  if (Array.isArray(apiData.milestones)) {
    apiData.milestones = JSON.stringify(apiData.milestones);
  }
  
  return apiData;
};
```

### 2. Fix the Backend Service

The second issue was in the `projectService.ts` file where we needed to:

- Explicitly extract all fields from the request data
- Properly handle array fields and JSON fields
- Include all fields in the database update operation
- Add missing fields like `project_status` and `preferred_collaboration_type`

```typescript
async updateProject(projectId: string, userId: string, projectData: any) {
  try {
    // Extract all fields including the ones that were missing
    const {
      project_name,
      project_description,
      project_type,
      project_category,
      project_title,
      project_duration,
      project_timeline,
      project_status_tag,
      project_visibility,
      search_visibility,
      project_image,
      client,
      client_location,
      client_website,
      contract_type,
      contract_duration,
      contract_value,
      budget,
      budget_range,
      currency,
      standard_rate,
      rate_type,
      compensation_type,
      skills_required,
      expertise_needed,
      target_audience,
      solutions_offered,
      project_tags,
      industry_tags,
      technology_tags,
      team_members,
      collaborators,
      advisors,
      partners,
      testimonials,
      deliverables,
      milestones,
      social_links_youtube,
      social_links_instagram,
      social_links_github,
      social_links_twitter,
      social_links_linkedin,
      seeking_creator,
      seeking_brand,
      seeking_freelancer,
      seeking_contractor,
      notification_preferences_email,
      notification_preferences_push,
      notification_preferences_digest,
      website_links,
      short_term_goals,
      long_term_goals,
      project_status,
      preferred_collaboration_type,
    } = projectData;
    
    // Prepare JSON fields
    const jsonFields = {
      team_members: Array.isArray(team_members) ? JSON.stringify(team_members) : team_members,
      collaborators: Array.isArray(collaborators) ? JSON.stringify(collaborators) : collaborators,
      advisors: Array.isArray(advisors) ? JSON.stringify(advisors) : advisors,
      partners: Array.isArray(partners) ? JSON.stringify(partners) : partners,
      testimonials: Array.isArray(testimonials) ? JSON.stringify(testimonials) : testimonials,
      deliverables: Array.isArray(deliverables) ? JSON.stringify(deliverables) : deliverables,
      milestones: Array.isArray(milestones) ? JSON.stringify(milestones) : milestones,
    };
    
    // Prepare array fields
    const arrayFields = {
      skills_required: Array.isArray(skills_required) ? skills_required : [],
      expertise_needed: Array.isArray(expertise_needed) ? expertise_needed : [],
      target_audience: Array.isArray(target_audience) ? target_audience : [],
      solutions_offered: Array.isArray(solutions_offered) ? solutions_offered : [],
      project_tags: Array.isArray(project_tags) ? project_tags : [],
      industry_tags: Array.isArray(industry_tags) ? industry_tags : [],
      technology_tags: Array.isArray(technology_tags) ? technology_tags : [],
      website_links: Array.isArray(website_links) ? website_links : [],
    };
    
    // Update the project with all fields
    const updatedProject = await prismaClient.projects.update({
      where: { 
        id: projectId,
        user_id: userId 
      },
      data: {
        project_name,
        project_description,
        project_type,
        project_category,
        project_title,
        project_duration,
        project_timeline,
        project_status_tag,
        project_visibility,
        search_visibility,
        project_image,
        client,
        client_location,
        client_website,
        contract_type,
        contract_duration,
        contract_value,
        budget,
        budget_range,
        currency,
        standard_rate,
        rate_type,
        compensation_type,
        ...arrayFields,
        ...jsonFields,
        social_links_youtube,
        social_links_instagram,
        social_links_github,
        social_links_twitter,
        social_links_linkedin,
        seeking_creator,
        seeking_brand,
        seeking_freelancer,
        seeking_contractor,
        notification_preferences_email,
        notification_preferences_push,
        notification_preferences_digest,
        short_term_goals,
        long_term_goals,
        project_status,
        preferred_collaboration_type,
        updated_at: new Date()
      }
    });
    
    return transformDbToApi(updatedProject);
  } catch (error) {
    console.error('Error in updateProject service:', error);
    throw error;
  }
}
```

### 3. Fix the API Response Transformation

The third issue was in the `transformApiResponse` function in `api/projects.ts` where we needed to:

- Safely parse JSON strings back to arrays
- Handle potential parsing errors
- Create nested objects for UI compatibility

```typescript
const transformApiResponse = (data: any) => {
  if (!data) return null;
  
  try {
    // Create a copy of the data
    const result = { ...data };
    
    // Safely parse JSON fields
    const parseJsonField = (field: string) => {
      if (!result[field]) return [];
      
      if (typeof result[field] === 'string') {
        try {
          return JSON.parse(result[field]);
        } catch (error) {
          console.warn(`Error parsing ${field}:`, error);
          return [];
        }
      }
      
      return result[field]; // Already an object/array
    };
    
    // Parse all JSON fields
    result.team_members = parseJsonField('team_members');
    result.collaborators = parseJsonField('collaborators');
    result.advisors = parseJsonField('advisors');
    result.partners = parseJsonField('partners');
    result.testimonials = parseJsonField('testimonials');
    result.deliverables = parseJsonField('deliverables');
    result.milestones = parseJsonField('milestones');
    
    // Add nested objects for UI compatibility
    result.seeking = {
      creator: Boolean(result.seeking_creator),
      brand: Boolean(result.seeking_brand),
      freelancer: Boolean(result.seeking_freelancer),
      contractor: Boolean(result.seeking_contractor)
    };
    
    result.social_links = {
      youtube: result.social_links_youtube || '',
      instagram: result.social_links_instagram || '',
      github: result.social_links_github || '',
      twitter: result.social_links_twitter || '',
      linkedin: result.social_links_linkedin || ''
    };
    
    result.notification_preferences = {
      email: Boolean(result.notification_preferences_email),
      push: Boolean(result.notification_preferences_push),
      digest: Boolean(result.notification_preferences_digest)
    };
    
    return result;
  } catch (error) {
    console.error('Error transforming API response:', error);
    return data; // Return original data if transformation fails
  }
};
```

### 4. Fix the Form Component

The fourth issue was in the form component where we needed to:

- Safely handle arrays before mapping over them
- Add a helper function to parse JSON strings
- Fix the seeking and social links sections to use nested objects

```typescript
// Helper function to safely parse JSON strings to arrays
const safelyParseArray = (data: any) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn('Error parsing JSON string:', error);
      return [];
    }
  }
  return [];
};

// Fix the seeking section to use nested objects
<div className="space-y-4">
  <h3 className="text-lg font-medium">Seeking</h3>
  <div className="space-y-2">
    <div className="flex items-center">
      <input
        type="checkbox"
        id="seeking_creator"
        name="seeking_creator"
        checked={formData.seeking?.creator || false}
        onChange={(e) => {
          setFormData((prev) => ({
            ...prev,
            seeking: {
              ...prev.seeking,
              creator: e.target.checked
            }
          }));
        }}
        className="rounded border-gray-300 text-indigo-600"
      />
      <label htmlFor="seeking_creator" className="ml-2">Creator</label>
    </div>
    {/* Similar checkboxes for brand, freelancer, contractor */}
  </div>
</div>

// Fix the social links section to use nested objects
<div className="space-y-4">
  <h3 className="text-lg font-medium">Social Links</h3>
  <div className="space-y-2">
    <div>
      <label htmlFor="social_links_youtube">YouTube</label>
      <input
        type="text"
        id="social_links_youtube"
        value={formData.social_links?.youtube || ''}
        onChange={(e) => {
          setFormData((prev) => ({
            ...prev,
            social_links: {
              ...prev.social_links,
              youtube: e.target.value
            }
          }));
        }}
        className="mt-1 block w-full rounded-md border-gray-300"
      />
    </div>
    {/* Similar inputs for instagram, github, twitter, linkedin */}
  </div>
</div>
```

### 5. Fix the Project View Page

The fifth issue was with the project view page where we needed to:

- Fix the display of project status and preferred collaboration type
- Improve the seeking options display
- Add detailed information for advisors, partners, and testimonials
- Add the portfolio section with deliverables and milestones

```typescript
// Fix the project status and preferred collaboration type display
<div>
  <h3 className="block text-sm font-medium text-gray-700">Project Status</h3>
  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
    {project.project_status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
  </p>
</div>
<div>
  <h3 className="block text-sm font-medium text-gray-700">Preferred Collaboration Type</h3>
  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
    {project.preferred_collaboration_type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
  </p>
</div>

// Improve the seeking options display
const DisplaySeekingOptions = ({ seeking }: { seeking: any }) => (
  <div className="flex flex-wrap gap-2">
    {seeking?.creator && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Creator</span>}
    {seeking?.brand && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Brand</span>}
    {seeking?.freelancer && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Freelancer</span>}
    {seeking?.contractor && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Contractor</span>}
  </div>
);

// Add detailed information for partners
const PartnersSection = ({ partners }: { partners: any }) => {
  const items = safelyParseArray(partners);
  
  return (
    <CategorySection title="Partners">
      <div className="space-y-4 w-full">
        {items.length > 0 ? (
          items.map((partner, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-md">
              <div className="space-y-1">
                <div><span className="font-medium">Name:</span> {partner.name}</div>
                <div><span className="font-medium">Organization:</span> {partner.organization}</div>
                <div><span className="font-medium">Contribution:</span> {partner.contribution}</div>
                <div><span className="font-medium">Year:</span> {partner.year}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No partners listed</p>
        )}
      </div>
    </CategorySection>
  );
};

// Add detailed information for testimonials
const TestimonialsSection = ({ testimonials }: { testimonials: any }) => {
  const items = safelyParseArray(testimonials);
  
  return (
    <CategorySection title="Testimonials">
      <div className="space-y-4 w-full">
        {items.length > 0 ? (
          items.map((testimonial, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-md">
              <div className="space-y-1">
                <div><span className="font-medium">Name:</span> {testimonial.name}</div>
                <div><span className="font-medium">Role:</span> {testimonial.role}</div>
                <div><span className="font-medium">Organization:</span> {testimonial.organization}</div>
                <div><span className="font-medium">Position:</span> {testimonial.position}</div>
                <div><span className="font-medium">Company:</span> {testimonial.company}</div>
                <div><span className="font-medium">Testimonial:</span> {testimonial.text}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No testimonials listed</p>
        )}
      </div>
    </CategorySection>
  );
};

// Add portfolio section with deliverables and milestones
const PortfolioSection = ({ deliverables, milestones }: { deliverables: any, milestones: any }) => {
  return (
    <PageSection title="Portfolio">
      <div className="md:grid md:grid-cols-2 md:gap-6">
        <DeliverablesSection deliverables={deliverables} />
        <MilestonesSection milestones={milestones} />
      </div>
    </PageSection>
  );
};
```

### 6. Fix the Portfolio Section Display

The sixth issue was that the portfolio section wasn't displaying properly. We needed to:

- Ensure the portfolio section is correctly displayed based on the project type
- Update the DeliverablesSection and MilestonesSection components
- Make sure the showPortfolio array includes the correct project types
- Add proper section titles for "Portfolio", "Campaign Deliverables", and "Campaign Milestones"

```typescript
// In the ProjectPage component
{showPortfolio.includes(project.project_type) && (
  <PageSection title="Portfolio">
    <div className="md:grid md:grid-cols-2 md:gap-6">
      <CategorySection title={deliverablesLabelMap[project.project_type] || "Campaign Deliverables"}>
        <DeliverablesSection deliverables={project.deliverables} />
      </CategorySection>
      <CategorySection title={milestonesLabelMap[project.project_type] || "Campaign Milestones"}>
        <MilestonesSection milestones={project.milestones} />
      </CategorySection>
    </div>
  </PageSection>
)}
```

Also, update the `deliverablesLabelMap` and `milestonesLabelMap` in `projectFormConfig.ts` to include appropriate labels for all project types:

```typescript
export const deliverablesLabelMap: Record<string, string> = {
  portfolio: 'Portfolio Items',
  showcase: 'Showcase Items',
  case_study: 'Deliverables',
  campaign: 'Campaign Deliverables',
  content_creation: 'Content Deliverables',
  // Add more mappings as needed
};

export const milestonesLabelMap: Record<string, string> = {
  portfolio: 'Key Achievements',
  showcase: 'Highlights',
  case_study: 'Milestones',
  campaign: 'Campaign Milestones',
  content_creation: 'Content Milestones',
  // Add more mappings as needed
};
```

## Key Lessons Learned

1. **Data Transformation**: Always ensure proper transformation between frontend and backend formats
2. **Type Safety**: Use TypeScript to catch potential type mismatches
3. **Error Handling**: Add robust error handling for JSON parsing and API calls
4. **Logging**: Add detailed logging to track data flow through the system
5. **Field Mapping**: Explicitly map all fields between frontend and backend to avoid missing data
6. **Array Handling**: Be careful with arrays, especially when they need to be stringified for storage and parsed for display
7. **Nested Objects**: When using nested objects in the UI, make sure they're properly flattened for the database and reconstructed when retrieved
8. **Optional Chaining**: Use optional chaining (`?.`) when accessing potentially undefined properties
9. **Default Values**: Always provide default values for fields that might be missing

## Implementation Checklist

When implementing forms that interact with a database in a monorepo:

- [x] Ensure form field names match database column names
- [x] Properly transform nested objects to flat fields for the database
- [x] Stringify arrays before sending to the database
- [x] Parse JSON strings back to arrays when retrieving from the database
- [x] Add error handling for JSON parsing
- [x] Verify all fields are included in the database update
- [x] Test the full flow from form submission to database update and back
- [x] Ensure all sections are properly displayed on the view page
- [x] Fix seeking and social links sections to use nested objects
- [x] Add missing fields like project_status and preferred_collaboration_type
- [x] Improve the display of advisors, partners, and testimonials

By following these steps, we successfully resolved the issues with our form submission and now have a robust system for handling complex form data in our monorepo project. 
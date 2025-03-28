# User Tags Implementation Guide

This guide documents how to implement the complete tag system for users, ensuring all tag types (skills, expertise, interest tags, experience tags, target audience, and solutions offered) are properly passed through the system.

## Key Components

1. Database Schema (already implemented)
2. API Layer
3. Frontend Components
4. Data Flow

## Implementation Steps

### 1. Update ExploreService (server/src/services/exploreService.ts)

Ensure all tag fields are selected in user queries:

```typescript:server/src/services/exploreService.ts
const users = await prisma.users.findMany({
  where,
  select: {
    // ... existing fields ...
    skills: true,
    expertise: true,
    interest_tags: true,
    experience_tags: true,
    target_audience: true,
    solutions_offered: true,
    // ... other fields ...
  }
});

// In the transform section:
const processedUsers = users.map(user => ({
  ...user,
  skills: user.skills || [],
  expertise: user.expertise || [],
  interest_tags: user.interest_tags || [],
  experience_tags: user.experience_tags || [],
  target_audience: user.target_audience || [],
  solutions_offered: user.solutions_offered || [],
  // ... other transformations ...
}));
```

### 2. Update UserCard Interface (client/src/components/cards/UserCard.tsx)

```typescript:client/src/components/cards/UserCard.tsx
interface UserCardProps {
  user: {
    id: string;
    username?: string;
    // ... existing fields ...
    skills?: string[];
    expertise?: string[];
    interest_tags?: string[];
    experience_tags?: string[];
    target_audience?: string[];
    solutions_offered?: string[];
  };
  // ... other props ...
}
```

### 3. Update ResultsGrid (client/src/components/results/ResultsGrid.tsx)

Ensure proper data passing to UserCard:

```typescript:client/src/components/results/ResultsGrid.tsx
{showUsers && sortedResults.users.map((user, index) => (
  <UserCard 
    key={`user-${user.id || index}`} 
    user={{
      ...user,
      skills: user.skills || [],
      expertise: user.expertise || [],
      interest_tags: user.interest_tags || [],
      experience_tags: user.experience_tags || [],
      target_audience: user.target_audience || [],
      solutions_offered: user.solutions_offered || []
    }} 
  />
))}
```

### 4. Update User API (client/src/api/users.ts)

```typescript:client/src/api/users.ts
export async function fetchUserProfile(userId: string, token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      params: {
        include: [
          // ... existing includes ...
          'skills',
          'expertise',
          'interest_tags',
          'experience_tags',
          'target_audience',
          'solutions_offered'
        ].join(',')
      }
    });

    const userData = response.data;
    return {
      ...userData,
      // Initialize arrays with empty defaults
      skills: userData.skills || [],
      expertise: userData.expertise || [],
      interest_tags: userData.interest_tags || [],
      experience_tags: userData.experience_tags || [],
      target_audience: userData.target_audience || [],
      solutions_offered: userData.solutions_offered || [],
      // ... rest of transformations ...
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}
```

## Tag Styling Guide

Use consistent styling across all tag types:

```typescript
// Skills & Expertise Tags
className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-black border border-black transition-all duration-250 hover:scale-105"

// Interest Tags
className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-black border border-black transition-all duration-250 hover:scale-105"

// Experience Tags
className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-black border border-black transition-all duration-250 hover:scale-105"

// Target Audience & Solutions Tags
className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 border border-black transition-all duration-250 hover:scale-105"
```

## Debugging Checklist

### API Layer
- [ ] Verify ExploreService is selecting all tag fields
- [ ] Check user API includes all tag fields in requests
- [ ] Validate tag arrays are properly initialized

### Component Layer
- [ ] Check UserCard props interface includes all tag types
- [ ] Verify ResultsGrid is passing all tag data
- [ ] Confirm tag rendering conditions in UserCard

### Data Flow
- [ ] Add console logs in UserCard:
```typescript
useEffect(() => {
  console.log('UserCard received user data:', {
    skills: user.skills,
    expertise: user.expertise,
    interest_tags: user.interest_tags,
    experience_tags: user.experience_tags,
    target_audience: user.target_audience,
    solutions_offered: user.solutions_offered
  });
}, [user]);
```

### Common Issues & Solutions

1. **Missing Tags**
```typescript
// Add default empty arrays in ResultsGrid
const safeUser = {
  ...user,
  skills: user.skills || [],
  expertise: user.expertise || [],
  interest_tags: user.interest_tags || [],
  experience_tags: user.experience_tags || [],
  target_audience: user.target_audience || [],
  solutions_offered: user.solutions_offered || []
};
```

2. **Undefined Arrays**
```typescript
// Add null checks in UserCard
{Array.isArray(user.skills) && user.skills.length > 0 && (
  // Render skills
)}
```

3. **Type Errors**
```typescript
// Add type guards
const getTags = (tags: unknown): string[] => {
  return Array.isArray(tags) ? tags : [];
};
```

## Testing Steps

1. Create user with various tags
2. Verify tags appear in profile
3. Check tags in user card
4. Validate tag styling
5. Test empty tag arrays
6. Verify tag hover effects

Remember: All tag arrays should be initialized as empty arrays if null/undefined to prevent rendering issues. 
import prisma from '../lib/prisma';

// Add this function to map database user to frontend format
function mapUserToFrontend(user: any) {
  // Map flattened social links to nested object
  const social_links = {
    youtube: user.social_links_youtube || '',
    instagram: user.social_links_instagram || '',
    github: user.social_links_github || '',
    twitter: user.social_links_twitter || '',
    linkedin: user.social_links_linkedin || '',
  };

  // Map flattened notification preferences to nested object
  const notification_preferences = {
    email: user.notification_preferences_email || false,
    push: user.notification_preferences_push || false,
    digest: user.notification_preferences_digest || false,
  };

  // Return user with nested objects
  return {
    ...user,
    social_links,
    notification_preferences,
    // Remove the flattened fields to avoid duplication
    social_links_youtube: undefined,
    social_links_instagram: undefined,
    social_links_github: undefined,
    social_links_twitter: undefined,
    social_links_linkedin: undefined,
    notification_preferences_email: undefined,
    notification_preferences_push: undefined,
    notification_preferences_digest: undefined,
  };
}

// Add this function to map frontend data to database format
function mapFrontendToUser(userData: any) {
  // Extract nested objects
  const { social_links, notification_preferences, ...rest } = userData;

  // Flatten social links
  const flattenedSocialLinks = social_links ? {
    social_links_youtube: social_links.youtube || '',
    social_links_instagram: social_links.instagram || '',
    social_links_github: social_links.github || '',
    social_links_twitter: social_links.twitter || '',
    social_links_linkedin: social_links.linkedin || '',
  } : {};

  // Flatten notification preferences
  const flattenedNotificationPrefs = notification_preferences ? {
    notification_preferences_email: notification_preferences.email || false,
    notification_preferences_push: notification_preferences.push || false,
    notification_preferences_digest: notification_preferences.digest || false,
  } : {};

  // Return flattened data
  return {
    ...rest,
    ...flattenedSocialLinks,
    ...flattenedNotificationPrefs,
  };
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        user_work_experience: true,
        user_education: true,
        user_certifications: true,
        user_accolades: true,
        user_endorsements: true,
        user_featured_projects: true,
        user_case_studies: true
      }
    });
    
    if (!user) return null;
    
    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;
    
    // Map to frontend format
    return mapUserToFrontend(userWithoutPassword);
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
}

export async function updateUser(id: string, data: any) {
  try {
    // Map frontend data to database format
    const dbData = mapFrontendToUser(data);
    
    // Extract related data from the main update
    const {
      user_work_experience,
      user_education,
      user_certifications,
      user_accolades,
      user_endorsements,
      user_featured_projects,
      user_case_studies,
      password_hash,
      created_at,
      ...updateData
    } = dbData;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date();
    
    // Start a transaction to update the user and related data
    const result = await prisma.$transaction(async (tx) => {
      // Update the main user record
      const updatedUser = await tx.users.update({
        where: { id },
        data: updateData,
        include: {
          user_work_experience: true,
          user_education: true,
          user_certifications: true,
          user_accolades: true,
          user_endorsements: true,
          user_featured_projects: true,
          user_case_studies: true
        }
      });
      
      // Update related records if provided
      // This is a simplified example - you would need to handle creates, updates, and deletes
      
      return updatedUser;
    });
    
    // Remove sensitive data
    const { password_hash: _, ...userWithoutPassword } = result;
    
    // Map to frontend format
    return mapUserToFrontend(userWithoutPassword);
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
}

export async function uploadProfileImage(id: string, file: Express.Multer.File) {
  // This would typically involve:
  // 1. Uploading the file to a storage service (S3, etc.)
  // 2. Getting the URL of the uploaded file
  // 3. Updating the user's profile_image field with the URL
  
  // For this example, we'll assume the file is saved locally and we just store the path
  const imagePath = `/uploads/${file.filename}`;
  
  await prisma.users.update({
    where: { id },
    data: {
      profile_image: imagePath
    }
  });
  
  return imagePath;
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });
    
    return user;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    throw error;
  }
}

export async function createUser(userData: { username: string; email: string; password_hash: string }) {
  try {
    const now = new Date();
    
    const user = await prisma.users.create({
      data: {
        ...userData,
        created_at: now,
        updated_at: now,
        profile_image: '/placeholder.svg', // Default profile image
        bio: '',
        user_type: 'user',
      },
    });
    
    // Map to frontend format
    return mapUserToFrontend(user);
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
} 
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
  console.log('Processing update data');
  
  // Extract nested objects and related data
  const { 
    social_links, 
    notification_preferences,
    // Keep these in the data instead of removing them
    // work_experience,
    // education,
    // certifications,
    // accolades,
    // endorsements,
    // featured_projects,
    // case_studies,
    ...rest 
  } = userData;

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

  // Convert numeric fields to the correct type
  const convertedData = {
    ...rest,
    // Convert string numbers to integers
    career_experience: rest.career_experience !== undefined ? 
      parseInt(rest.career_experience, 10) || 0 : undefined,
    social_media_followers: rest.social_media_followers !== undefined ? 
      parseInt(rest.social_media_followers, 10) || 0 : undefined,
  };

  // Return data with flattened fields and keeping related data
  return {
    ...convertedData,
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
    console.log('Updating user with ID:', id);
    console.log('Update data:', data);
    
    // Extract all related data before mapping
    const {
      work_experience,
      education,
      certifications,
      accolades,
      endorsements,
      featured_projects,
      case_studies,
      ...mainData
    } = data;

    // Map frontend data to database format for main user fields
    const dbData = mapFrontendToUser(mainData);
    console.log('Mapped data for database:', dbData);
    
    // Extract fields that shouldn't be directly updated
    const {
      password_hash,
      created_at,
      ...updateData
    } = dbData;

    // Add updated_at timestamp
    updateData.updated_at = new Date();
    
    console.log('Final update data for main user record:', updateData);
    
    // Start a transaction to update the user and related data
    const result = await prisma.$transaction(async (tx) => {
      // Update the main user record
      const updatedUser = await tx.users.update({
        where: { id },
        data: updateData,
      });

      // Update work experience
      if (work_experience) {
        await tx.user_work_experience.deleteMany({
          where: { user_id: id }
        });
        
        if (work_experience.length > 0) {
          await tx.user_work_experience.createMany({
            data: work_experience.map(exp => ({
              user_id: id,
              title: exp.title || '',
              company: exp.company || '',
              years: exp.years || '',
              media: exp.media || null
            }))
          });
        }
      }

      // Update education
      if (education) {
        await tx.user_education.deleteMany({
          where: { user_id: id }
        });
        
        if (education.length > 0) {
          await tx.user_education.createMany({
            data: education.map(edu => ({
              user_id: id,
              degree: edu.degree || '',
              school: edu.school || '',
              year: edu.year || '',
              media: edu.media || null
            }))
          });
        }
      }

      // Update certifications
      if (certifications) {
        await tx.user_certifications.deleteMany({
          where: { user_id: id }
        });
        
        if (certifications.length > 0) {
          await tx.user_certifications.createMany({
            data: certifications.map(cert => ({
              user_id: id,
              name: cert.name || '',
              issuer: cert.issuer || '',
              year: cert.year || '',
              media: cert.media || null
            }))
          });
        }
      }

      // Update accolades
      if (accolades) {
        await tx.user_accolades.deleteMany({
          where: { user_id: id }
        });
        
        if (accolades.length > 0) {
          await tx.user_accolades.createMany({
            data: accolades.map(accolade => ({
              user_id: id,
              title: accolade.title || '',
              issuer: accolade.issuer || '',
              year: accolade.year || '',
              media: accolade.media || null
            }))
          });
        }
      }

      // Update endorsements
      if (endorsements) {
        await tx.user_endorsements.deleteMany({
          where: { user_id: id }
        });
        
        if (endorsements.length > 0) {
          await tx.user_endorsements.createMany({
            data: endorsements.map(endorsement => ({
              user_id: id,
              name: endorsement.name || '',
              position: endorsement.position || '',
              company: endorsement.company || '',
              text: endorsement.text || '',
              media: endorsement.media || null
            }))
          });
        }
      }

      // Update featured projects
      if (featured_projects) {
        await tx.user_featured_projects.deleteMany({
          where: { user_id: id }
        });
        
        if (featured_projects.length > 0) {
          await tx.user_featured_projects.createMany({
            data: featured_projects.map(project => ({
              user_id: id,
              title: project.title || '',
              description: project.description || '',
              url: project.url || '',
              media: project.media || null
            }))
          });
        }
      }

      // Update case studies
      if (case_studies) {
        await tx.user_case_studies.deleteMany({
          where: { user_id: id }
        });
        
        if (case_studies.length > 0) {
          await tx.user_case_studies.createMany({
            data: case_studies.map(study => ({
              user_id: id,
              title: study.title || '',
              description: study.description || '',
              url: study.url || '',
              media: study.media || null
            }))
          });
        }
      }

      // Fetch the updated user with all related data
      return await tx.users.findUnique({
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
    });

    console.log('User updated successfully');
    
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
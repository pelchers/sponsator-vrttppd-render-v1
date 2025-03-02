import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '@/api/users';
import PageSection from "@/components/sections/PageSection"
import CategorySection from "@/components/sections/CategorySection"
import PillTag from "@/components/input/forms/PillTag"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      if (!id) {
        const userId = localStorage.getItem('userId');
        if (userId) {
          navigate(`/profile/${userId}`);
          return;
        } else {
          navigate('/login');
          return;
        }
      }
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userData = await fetchUserProfile(id, token);
        
        // Initialize empty arrays and objects for collections if they don't exist
        const processedData = {
          ...userData,
          skills: userData.skills || [],
          expertise: userData.expertise || [],
          target_audience: userData.target_audience || [],
          solutions_offered: userData.solutions_offered || [],
          interest_tags: userData.interest_tags || [],
          experience_tags: userData.experience_tags || [],
          education_tags: userData.education_tags || [],
          website_links: userData.website_links || [],
          work_experience: userData.work_experience || [],
          education: userData.education || [],
          certifications: userData.certifications || [],
          accolades: userData.accolades || [],
          endorsements: userData.endorsements || [],
          featured_projects: userData.featured_projects || [],
          case_studies: userData.case_studies || [],
          social_links: userData.social_links || {
            youtube: '',
            instagram: '',
            github: '',
            twitter: '',
            linkedin: ''
          },
          notification_preferences: userData.notification_preferences || {
            email: false,
            push: false,
            digest: false
          }
        };
        
        setUser(processedData);
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [id, navigate]);

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  if (!user) return <div className="container mx-auto px-4 py-8">User not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>

      {/* Basic Information */}
      <PageSection title="Basic Information">
        <CategorySection>
          <div className="space-y-6 w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32">
                <img
                  src={user.profile_image || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700">Username</h3>
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                {user.username || 'No username set'}
              </p>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700">Email</h3>
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{user.email}</p>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700">Bio</h3>
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{user.bio}</p>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700">User Type</h3>
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{user.user_type}</p>
            </div>
          </div>
        </CategorySection>
      </PageSection>

      {/* Professional Information */}
      <PageSection title="Professional Information">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Career Details">
            <div className="space-y-4 w-full">
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Career Title</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{user.career_title}</p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Career Experience (Years)</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {user.career_experience}
                </p>
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Social Media Details">
            <div className="space-y-4 w-full">
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Social Media Handle</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {user.social_media_handle}
                </p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Social Media Followers</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {user.social_media_followers}
                </p>
              </div>
            </div>
          </CategorySection>
        </div>
        <div className="md:grid md:grid-cols-2 md:gap-6 mt-6">
          <CategorySection title="Company Info">
            <div className="space-y-4 w-full">
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Company</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{user.company}</p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Company Location</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {user.company_location}
                </p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Company Website</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {user.company_website}
                </p>
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Contract Info">
            <div className="space-y-4 w-full">
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Contract Type</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{user.contract_type}</p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Contract Duration</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {user.contract_duration}
                </p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Contract Rate</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{user.contract_rate}</p>
              </div>
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Availability & Work Preferences */}
      <PageSection title="Availability & Work Preferences">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Availability">
            <div className="space-y-4 w-full">
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Availability Status</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {user.availability_status}
                </p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Preferred Work Type</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {user.preferred_work_type}
                </p>
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Compensation">
            <div className="space-y-4 w-full">
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Standard Service Rate</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {user.standard_service_rate}
                </p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">General Rate Range</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{user.rate_range}</p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Standard Rate Type</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {user.standard_rate_type}
                </p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Compensation Type</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {user.compensation_type}
                </p>
              </div>
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Focus */}
      <PageSection title="Focus">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Target Audience">
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {user.target_audience && user.target_audience.length > 0 ? (
                  user.target_audience.map((tag: string) => (
                    <PillTag key={tag} text={tag} onRemove={() => {}} />
                  ))
                ) : (
                  <p className="text-gray-500 italic">No target audience added</p>
                )}
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Solutions Offered">
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {user.solutions_offered && user.solutions_offered.length > 0 ? (
                  user.solutions_offered.map((tag: string) => (
                    <PillTag key={tag} text={tag} onRemove={() => {}} />
                  ))
                ) : (
                  <p className="text-gray-500 italic">No solutions offered added</p>
                )}
              </div>
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Tags & Categories */}
      <PageSection title="Tags & Categories">
        <div className="space-y-6">
          <CategorySection title="Skills">
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((tag: string) => (
                    <PillTag key={tag} text={tag} onRemove={() => {}} />
                  ))
                ) : (
                  <p className="text-gray-500 italic">No skills added yet</p>
                )}
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Expertise">
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {user.expertise && user.expertise.length > 0 ? (
                  user.expertise.map((tag: string) => (
                    <PillTag key={tag} text={tag} onRemove={() => {}} />
                  ))
                ) : (
                  <p className="text-gray-500 italic">No expertise added</p>
                )}
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Interest Tags">
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {user.interest_tags && user.interest_tags.length > 0 ? (
                  user.interest_tags.map((tag: string) => (
                    <PillTag key={tag} text={tag} onRemove={() => {}} />
                  ))
                ) : (
                  <p className="text-gray-500 italic">No interest tags added</p>
                )}
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Experience">
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {user.experience_tags && user.experience_tags.length > 0 ? (
                  user.experience_tags.map((tag: string) => (
                    <PillTag key={tag} text={tag} onRemove={() => {}} />
                  ))
                ) : (
                  <p className="text-gray-500 italic">No experience tags added</p>
                )}
              </div>
            </div>
          </CategorySection>

          <CategorySection title="Education">
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {user.education_tags && user.education_tags.length > 0 ? (
                  user.education_tags.map((tag: string) => (
                    <PillTag key={tag} text={tag} onRemove={() => {}} />
                  ))
                ) : (
                  <p className="text-gray-500 italic">No education tags added</p>
                )}
              </div>
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Status */}
      <PageSection title="Status">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Work Status">
            <div className="w-full">
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{user.work_status}</p>
            </div>
          </CategorySection>

          <CategorySection title="Seeking">
            <div className="w-full">
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{user.seeking}</p>
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Contact & Availability */}
      <PageSection title="Contact & Availability">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Social Links">
            <div className="space-y-4 w-full">
              {Object.entries(user.social_links || {}).map(([platform, url]) => (
                <div key={platform}>
                  <h3 className="block text-sm font-medium text-gray-700 capitalize">{platform}</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {url || `No ${platform} link added`}
                  </p>
                </div>
              ))}
            </div>
          </CategorySection>
          <CategorySection title="Website Links">
            <div className="space-y-4 w-full">
              {user.website_links && user.website_links.length > 0 ? (
                user.website_links.map((link: string, index: number) => (
                  <div key={index}>
                    <h3 className="block text-sm font-medium text-gray-700">Website {index + 1}</h3>
                    <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{link}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No website links added</p>
              )}
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Qualifications */}
      <PageSection title="Qualifications">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Work Experience">
            <div className="space-y-4 w-full">
              {user.work_experience && user.work_experience.length > 0 ? (
                user.work_experience.map((exp: any, index: number) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{exp.title}</h3>
                    <p>{exp.company}</p>
                    <p>{exp.years}</p>
                    {exp.media && (
                      <div className="relative w-full h-40">
                        <img
                          src={exp.media || "/placeholder.svg"}
                          alt={exp.title}
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No work experience added</p>
              )}
            </div>
          </CategorySection>
          <CategorySection title="Education">
            <div className="space-y-4 w-full">
              {user.education && user.education.length > 0 ? (
                user.education.map((edu: any, index: number) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{edu.degree}</h3>
                    <p>{edu.school}</p>
                    <p>{edu.year}</p>
                    {edu.media && (
                      <div className="relative w-full h-40">
                        <img
                          src={edu.media || "/placeholder.svg"}
                          alt={edu.degree}
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No education added</p>
              )}
            </div>
          </CategorySection>
        </div>
        <div className="md:grid md:grid-cols-2 md:gap-6 mt-6">
          <CategorySection title="Certifications">
            <div className="space-y-4 w-full">
              {user.certifications && user.certifications.length > 0 ? (
                user.certifications.map((cert: any, index: number) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{cert.name}</h3>
                    <p>{cert.issuer}</p>
                    <p>{cert.year}</p>
                    {cert.media && (
                      <div className="relative w-full h-40">
                        <img
                          src={cert.media || "/placeholder.svg"}
                          alt={cert.name}
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No certifications added</p>
              )}
            </div>
          </CategorySection>
          <CategorySection title="Accolades">
            <div className="space-y-4 w-full">
              {user.accolades && user.accolades.length > 0 ? (
                user.accolades.map((accolade: any, index: number) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{accolade.title}</h3>
                    <p>{accolade.issuer}</p>
                    <p>{accolade.year}</p>
                    {accolade.media && (
                      <div className="relative w-full h-40">
                        <img
                          src={accolade.media || "/placeholder.svg"}
                          alt={accolade.title}
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No accolades added</p>
              )}
            </div>
          </CategorySection>
          <CategorySection title="Endorsements">
            <div className="space-y-4 w-full">
              {user.endorsements && user.endorsements.length > 0 ? (
                user.endorsements.map((endorsement: any, index: number) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{endorsement.name}</h3>
                    <p>
                      {endorsement.position} at {endorsement.company}
                    </p>
                    <p className="italic">"{endorsement.text}"</p>
                    {endorsement.media && (
                      <div className="relative w-full h-40">
                        <img
                          src={endorsement.media || "/placeholder.svg"}
                          alt={endorsement.name}
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No endorsements added</p>
              )}
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Collaboration & Goals */}
      <PageSection title="Collaboration & Goals">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Short Term Goals">
            <div className="space-y-4 w-full">
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{user.short_term_goals}</p>
            </div>
          </CategorySection>
          <CategorySection title="Long Term Goals">
            <div className="space-y-4 w-full">
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{user.long_term_goals}</p>
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Portfolio & Showcase */}
      <PageSection title="Portfolio & Showcase">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Featured Projects">
            <div className="space-y-4 w-full">
              {user.featured_projects && user.featured_projects.length > 0 ? (
                user.featured_projects.map((project: any, index: number) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{project.title}</h3>
                    <p>{project.description}</p>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Project
                    </a>
                    {project.media && (
                      <div className="relative w-full h-40">
                        <img
                          src={project.media || "/placeholder.svg"}
                          alt={project.title}
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No featured projects added</p>
              )}
            </div>
          </CategorySection>
          <CategorySection title="Case Studies">
            <div className="space-y-4 w-full">
              {user.case_studies && user.case_studies.length > 0 ? (
                user.case_studies.map((study: any, index: number) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{study.title}</h3>
                    <p>{study.description}</p>
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Case Study
                    </a>
                    {study.media && (
                      <div className="relative w-full h-40">
                        <img
                          src={study.media || "/placeholder.svg"}
                          alt={study.title}
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No case studies added</p>
              )}
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Add Edit button */}
      <div className="mt-8 flex justify-end">
        <Link to={`/profile/${id}/edit`}>
          <Button variant="default">
            Edit Profile
          </Button>
        </Link>
      </div>
    </div>
  )
}


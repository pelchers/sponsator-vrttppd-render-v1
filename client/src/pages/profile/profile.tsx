import PageSection from "@/components/PageSection"
import CategorySection from "@/components/CategorySection"
import PillTag from "@/components/PillTag"
import Image from "next/image"

// This is a mock user data object. In a real application, you would fetch this data from your backend.
const userData = {
  profile_image: "/placeholder.svg",
  username: "johndoe",
  email: "johndoe@example.com",
  bio: "Passionate developer and designer",
  user_type: "Freelancer",
  career_title: "Full Stack Developer",
  career_experience: 5,
  social_media_handle: "@johndoe",
  social_media_followers: 1000,
  company: "Tech Innovations Inc.",
  company_location: "San Francisco, CA",
  company_website: "https://techinnovations.com",
  contract_type: "Full-time",
  contract_duration: "Permanent",
  contract_rate: "$100/hour",
  availability_status: "Available",
  preferred_work_type: "Remote",
  standard_service_rate: "$120/hour",
  rate_range: "$100-$150/hour",
  standard_rate_type: "Hourly",
  compensation_type: "USD",
  skills: ["React", "Node.js", "TypeScript"],
  expertise: ["Web Development", "UI/UX Design"],
  target_audience: ["Startups", "Tech Companies"],
  solutions_offered: ["Custom Web Applications", "Mobile App Development"],
  interest_tags: ["AI", "Blockchain", "IoT"],
  experience_tags: ["5+ years in web development", "3+ years in mobile development"],
  education_tags: ["BS in Computer Science", "MBA"],
  work_status: "Full-time",
  seeking: "New opportunities",
  social_links: {
    youtube: "https://youtube.com/johndoe",
    instagram: "https://instagram.com/johndoe",
    github: "https://github.com/johndoe",
    twitter: "https://twitter.com/johndoe",
    linkedin: "https://linkedin.com/in/johndoe",
  },
  website_links: ["https://johndoe.com", "https://johndoe.blog"],
  work_experience: [
    { title: "Senior Developer", company: "Tech Corp", years: "2018-2023", media: "/placeholder.svg" },
    { title: "Junior Developer", company: "StartUp Inc", years: "2015-2018", media: "/placeholder.svg" },
  ],
  education: [
    { degree: "Master's in Computer Science", school: "Tech University", year: "2015", media: "/placeholder.svg" },
    { degree: "Bachelor's in Software Engineering", school: "Code College", year: "2013", media: "/placeholder.svg" },
  ],
  certifications: [
    { name: "AWS Certified Developer", issuer: "Amazon", year: "2022", media: "/placeholder.svg" },
    { name: "Google Cloud Professional", issuer: "Google", year: "2021", media: "/placeholder.svg" },
  ],
  accolades: [
    { title: "Best New App", issuer: "TechCrunch", year: "2022", media: "/placeholder.svg" },
    { title: "Rising Star Developer", issuer: "GitHub", year: "2021", media: "/placeholder.svg" },
  ],
  endorsements: [
    {
      name: "Jane Smith",
      position: "CTO",
      company: "Big Tech Co",
      text: "John is an exceptional developer",
      media: "/placeholder.svg",
    },
    {
      name: "Mike Johnson",
      position: "Project Manager",
      company: "Innovative Startup",
      text: "Working with John was a pleasure",
      media: "/placeholder.svg",
    },
  ],
  short_term_goals: "Improve skills in AI and machine learning",
  long_term_goals: "Start a tech company focused on sustainable solutions",
  featured_projects: [
    {
      title: "E-commerce Platform",
      description: "Built a scalable e-commerce solution",
      url: "https://project1.com",
      media: "/placeholder.svg",
    },
    {
      title: "AI Chatbot",
      description: "Developed an intelligent customer service bot",
      url: "https://project2.com",
      media: "/placeholder.svg",
    },
  ],
  case_studies: [
    {
      title: "Optimizing Database Queries",
      description: "Improved app performance by 200%",
      url: "https://casestudy1.com",
      media: "/placeholder.svg",
    },
    {
      title: "Implementing Microservices",
      description: "Scaled application to handle millions of users",
      url: "https://casestudy2.com",
      media: "/placeholder.svg",
    },
  ],
}

export default function ProfilePage({ params }: { params: { username: string } }) {
  // In a real application, you would fetch user data here based on the username
  // const userData = await fetchUserData(params.username);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>

      {/* Basic Information */}
      <PageSection title="Basic Information">
        <CategorySection>
          <div className="space-y-6 w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32">
                <Image
                  src={userData.profile_image || "/placeholder.svg"}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700">Username</h3>
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.username}</p>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700">Email</h3>
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.email}</p>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700">Bio</h3>
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.bio}</p>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700">User Type</h3>
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.user_type}</p>
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
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.career_title}</p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Career Experience (Years)</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {userData.career_experience}
                </p>
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Social Media Details">
            <div className="space-y-4 w-full">
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Social Media Handle</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {userData.social_media_handle}
                </p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Social Media Followers</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {userData.social_media_followers}
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
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.company}</p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Company Location</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {userData.company_location}
                </p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Company Website</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {userData.company_website}
                </p>
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Contract Info">
            <div className="space-y-4 w-full">
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Contract Type</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.contract_type}</p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Contract Duration</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {userData.contract_duration}
                </p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Contract Rate</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.contract_rate}</p>
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
                  {userData.availability_status}
                </p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Preferred Work Type</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {userData.preferred_work_type}
                </p>
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Compensation">
            <div className="space-y-4 w-full">
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Standard Service Rate</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {userData.standard_service_rate}
                </p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">General Rate Range</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.rate_range}</p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Standard Rate Type</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {userData.standard_rate_type}
                </p>
              </div>
              <div>
                <h3 className="block text-sm font-medium text-gray-700">Compensation Type</h3>
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {userData.compensation_type}
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
                {userData.target_audience.map((tag) => (
                  <PillTag key={tag} text={tag} onRemove={() => {}} />
                ))}
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Solutions Offered">
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {userData.solutions_offered.map((tag) => (
                  <PillTag key={tag} text={tag} onRemove={() => {}} />
                ))}
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
                {userData.skills.map((tag) => (
                  <PillTag key={tag} text={tag} onRemove={() => {}} />
                ))}
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Expertise">
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {userData.expertise.map((tag) => (
                  <PillTag key={tag} text={tag} onRemove={() => {}} />
                ))}
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Interest Tags">
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {userData.interest_tags.map((tag) => (
                  <PillTag key={tag} text={tag} onRemove={() => {}} />
                ))}
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Experience">
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {userData.experience_tags.map((tag) => (
                  <PillTag key={tag} text={tag} onRemove={() => {}} />
                ))}
              </div>
            </div>
          </CategorySection>

          <CategorySection title="Education">
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {userData.education_tags.map((tag) => (
                  <PillTag key={tag} text={tag} onRemove={() => {}} />
                ))}
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
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.work_status}</p>
            </div>
          </CategorySection>

          <CategorySection title="Seeking">
            <div className="w-full">
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.seeking}</p>
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Contact & Availability */}
      <PageSection title="Contact & Availability">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Social Links">
            <div className="space-y-4 w-full">
              {Object.entries(userData.social_links).map(([platform, url]) => (
                <div key={platform}>
                  <h3 className="block text-sm font-medium text-gray-700 capitalize">{platform}</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{url}</p>
                </div>
              ))}
            </div>
          </CategorySection>
          <CategorySection title="Website Links">
            <div className="space-y-4 w-full">
              {userData.website_links.map((link, index) => (
                <div key={index}>
                  <h3 className="block text-sm font-medium text-gray-700">Website {index + 1}</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{link}</p>
                </div>
              ))}
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Qualifications */}
      <PageSection title="Qualifications">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Work Experience">
            <div className="space-y-4 w-full">
              {userData.work_experience.map((exp, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <h3 className="font-medium">{exp.title}</h3>
                  <p>{exp.company}</p>
                  <p>{exp.years}</p>
                  {exp.media && (
                    <div className="relative w-full h-40">
                      <Image
                        src={exp.media || "/placeholder.svg"}
                        alt={exp.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CategorySection>
          <CategorySection title="Education">
            <div className="space-y-4 w-full">
              {userData.education.map((edu, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <h3 className="font-medium">{edu.degree}</h3>
                  <p>{edu.school}</p>
                  <p>{edu.year}</p>
                  {edu.media && (
                    <div className="relative w-full h-40">
                      <Image
                        src={edu.media || "/placeholder.svg"}
                        alt={edu.degree}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CategorySection>
        </div>
        <div className="md:grid md:grid-cols-2 md:gap-6 mt-6">
          <CategorySection title="Certifications">
            <div className="space-y-4 w-full">
              {userData.certifications.map((cert, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <h3 className="font-medium">{cert.name}</h3>
                  <p>{cert.issuer}</p>
                  <p>{cert.year}</p>
                  {cert.media && (
                    <div className="relative w-full h-40">
                      <Image
                        src={cert.media || "/placeholder.svg"}
                        alt={cert.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CategorySection>
          <CategorySection title="Accolades">
            <div className="space-y-4 w-full">
              {userData.accolades.map((accolade, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <h3 className="font-medium">{accolade.title}</h3>
                  <p>{accolade.issuer}</p>
                  <p>{accolade.year}</p>
                  {accolade.media && (
                    <div className="relative w-full h-40">
                      <Image
                        src={accolade.media || "/placeholder.svg"}
                        alt={accolade.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CategorySection>
          <CategorySection title="Endorsements">
            <div className="space-y-4 w-full">
              {userData.endorsements.map((endorsement, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <h3 className="font-medium">{endorsement.name}</h3>
                  <p>
                    {endorsement.position} at {endorsement.company}
                  </p>
                  <p className="italic">"{endorsement.text}"</p>
                  {endorsement.media && (
                    <div className="relative w-full h-40">
                      <Image
                        src={endorsement.media || "/placeholder.svg"}
                        alt={endorsement.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Collaboration & Goals */}
      <PageSection title="Collaboration & Goals">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Short Term Goals">
            <div className="space-y-4 w-full">
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.short_term_goals}</p>
            </div>
          </CategorySection>
          <CategorySection title="Long Term Goals">
            <div className="space-y-4 w-full">
              <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{userData.long_term_goals}</p>
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Portfolio & Showcase */}
      <PageSection title="Portfolio & Showcase">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Featured Projects">
            <div className="space-y-4 w-full">
              {userData.featured_projects.map((project, index) => (
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
                      <Image
                        src={project.media || "/placeholder.svg"}
                        alt={project.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CategorySection>
          <CategorySection title="Case Studies">
            <div className="space-y-4 w-full">
              {userData.case_studies.map((study, index) => (
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
                      <Image
                        src={study.media || "/placeholder.svg"}
                        alt={study.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CategorySection>
        </div>
      </PageSection>
    </div>
  )
}


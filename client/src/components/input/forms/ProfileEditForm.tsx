"use client"

import type React from "react"

import { useState } from "react"
import PageSection from "./PageSection"
import CategorySection from "./CategorySection"
import TagInput from "./TagInput"
import ImageUpload from "./ImageUpload"

export default function ProfileEditForm() {
  const [formData, setFormData] = useState({
    // Basic Information
    profile_image: null as File | null,
    username: "",
    email: "",
    bio: "",
    user_type: "",

    // Professional Information
    career_title: "",
    career_experience: 0,
    social_media_handle: "",
    social_media_followers: 0,
    company: "",
    company_location: "",
    company_website: "",
    contract_type: "",
    contract_duration: "",
    contract_rate: "",

    // Availability & Preferences
    availability_status: "",
    preferred_work_type: "",
    rate_range: "",
    currency: "USD",
    standard_service_rate: "",
    standard_rate_type: "",
    compensation_type: "",

    // Skills & Expertise
    skills: [] as string[],
    expertise: [] as string[],

    // Focus
    target_audience: [] as string[],
    solutions_offered: [] as string[],

    // Tags & Categories
    interest_tags: [] as string[],
    experience_tags: [] as string[],
    education_tags: [] as string[],
    work_status: "",
    seeking: "",

    // Contact & Availability
    social_links: {
      youtube: "",
      instagram: "",
      github: "",
      twitter: "",
      linkedin: "",
    },
    website_links: [] as string[],

    // Experience & Education
    work_experience: [] as { title: string; company: string; years: string; media?: File }[],
    education: [] as { degree: string; school: string; year: string; media?: File }[],
    certifications: [] as { name: string; issuer: string; year: string; media?: File }[],
    accolades: [] as { title: string; issuer: string; year: string; media?: File }[],
    endorsements: [] as { name: string; position: string; company: string; text: string; media?: File }[],

    // Collaboration & Goals
    short_term_goals: "",
    long_term_goals: "",

    // Portfolio
    featured_projects: [] as { title: string; description: string; url: string; media?: File }[],
    case_studies: [] as { title: string; description: string; url: string; media?: File }[],

    // Privacy
    profile_visibility: "public",
    search_visibility: true,
    notification_preferences: {
      email: true,
      push: true,
      digest: true,
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleImageSelect = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      profile_image: file,
    }))
  }

  const handleAddTag = (section: keyof typeof formData) => (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...(prev[section] as string[]), tag],
    }))
  }

  const handleRemoveTag = (section: keyof typeof formData) => (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: (prev[section] as string[]).filter((t) => t !== tag),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <PageSection title="Basic Information">
        <CategorySection>
          <div className="space-y-6 w-full">
            <ImageUpload onImageSelect={handleImageSelect} />

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              ></textarea>
            </div>

            <div>
              <label htmlFor="user_type" className="block text-sm font-medium text-gray-700">
                User Type
              </label>
              <select
                id="user_type"
                name="user_type"
                value={formData.user_type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select user type...</option>
                <option value="creator">Creator</option>
                <option value="brand">Brand</option>
                <option value="freelancer">Freelancer</option>
                <option value="contractor">Contractor</option>
              </select>
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
                <label htmlFor="career_title" className="block text-sm font-medium text-gray-700">
                  Career Title
                </label>
                <input
                  type="text"
                  id="career_title"
                  name="career_title"
                  value={formData.career_title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="career_experience" className="block text-sm font-medium text-gray-700">
                  Career Experience (Years)
                </label>
                <input
                  type="number"
                  id="career_experience"
                  name="career_experience"
                  value={formData.career_experience}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Social Media Details">
            <div className="space-y-4 w-full">
              <div>
                <label htmlFor="social_media_handle" className="block text-sm font-medium text-gray-700">
                  Social Media Handle
                </label>
                <input
                  type="text"
                  id="social_media_handle"
                  name="social_media_handle"
                  value={formData.social_media_handle}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="social_media_followers" className="block text-sm font-medium text-gray-700">
                  Social Media Followers
                </label>
                <input
                  type="number"
                  id="social_media_followers"
                  name="social_media_followers"
                  value={formData.social_media_followers}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </CategorySection>
        </div>
        <div className="md:grid md:grid-cols-2 md:gap-6 mt-6">
          <CategorySection title="Company Info">
            <div className="space-y-4 w-full">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="company_location" className="block text-sm font-medium text-gray-700">
                  Company Location
                </label>
                <input
                  type="text"
                  id="company_location"
                  name="company_location"
                  value={formData.company_location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="company_website" className="block text-sm font-medium text-gray-700">
                  Company Website
                </label>
                <input
                  type="url"
                  id="company_website"
                  name="company_website"
                  value={formData.company_website}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Contract Info">
            <div className="space-y-4 w-full">
              <div>
                <label htmlFor="contract_type" className="block text-sm font-medium text-gray-700">
                  Contract Type
                </label>
                <input
                  type="text"
                  id="contract_type"
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="contract_duration" className="block text-sm font-medium text-gray-700">
                  Contract Duration
                </label>
                <input
                  type="text"
                  id="contract_duration"
                  name="contract_duration"
                  value={formData.contract_duration}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="contract_rate" className="block text-sm font-medium text-gray-700">
                  Contract Rate
                </label>
                <input
                  type="text"
                  id="contract_rate"
                  name="contract_rate"
                  value={formData.contract_rate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
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
                <label htmlFor="availability_status" className="block text-sm font-medium text-gray-700">
                  Availability Status
                </label>
                <select
                  id="availability_status"
                  name="availability_status"
                  value={formData.availability_status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select availability...</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="not_available">Not Available</option>
                </select>
              </div>
              <div>
                <label htmlFor="preferred_work_type" className="block text-sm font-medium text-gray-700">
                  Preferred Work Type
                </label>
                <select
                  id="preferred_work_type"
                  name="preferred_work_type"
                  value={formData.preferred_work_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select work type...</option>
                  <option value="part_time_employment">Part Time Employment</option>
                  <option value="full_time_employment">Full Time Employment</option>
                  <option value="contract_work">Contract Work</option>
                  <option value="brand_partnership">Brand Partnership</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="connection">Connection</option>
                </select>
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Compensation">
            <div className="space-y-4 w-full">
              <div>
                <label htmlFor="standard_service_rate" className="block text-sm font-medium text-gray-700">
                  Standard Service Rate
                </label>
                <input
                  type="text"
                  id="standard_service_rate"
                  name="standard_service_rate"
                  value={formData.standard_service_rate}
                  onChange={handleInputChange}
                  placeholder="e.g. $100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="rate_range" className="block text-sm font-medium text-gray-700">
                  General Rate Range
                </label>
                <input
                  type="text"
                  id="rate_range"
                  name="rate_range"
                  value={formData.rate_range}
                  onChange={handleInputChange}
                  placeholder="e.g. $50-100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="standard_rate_type" className="block text-sm font-medium text-gray-700">
                  Standard Rate Type
                </label>
                <select
                  id="standard_rate_type"
                  name="standard_rate_type"
                  value={formData.standard_rate_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select rate type...</option>
                  <option value="hourly">Hourly</option>
                  <option value="salary">Salary</option>
                  <option value="contract">Contract</option>
                  <option value="revenue_split">Revenue Split</option>
                  <option value="pro_bono">Pro Bono</option>
                </select>
              </div>
              <div>
                <label htmlFor="compensation_type" className="block text-sm font-medium text-gray-700">
                  Compensation Type
                </label>
                <select
                  id="compensation_type"
                  name="compensation_type"
                  value={formData.compensation_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select compensation type...</option>
                  <option value="usd">USD</option>
                  <option value="crypto">Crypto</option>
                  <option value="service_exchange">Service Exchange</option>
                  <option value="pro_bono">Pro Bono</option>
                </select>
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
              <TagInput
                label="Target Audience"
                tags={formData.target_audience}
                onAddTag={handleAddTag("target_audience")}
                onRemoveTag={handleRemoveTag("target_audience")}
                placeholder="Add target audience..."
              />
            </div>
          </CategorySection>
          <CategorySection title="Solutions Offered">
            <div className="w-full">
              <TagInput
                label="Solutions Offered"
                tags={formData.solutions_offered}
                onAddTag={handleAddTag("solutions_offered")}
                onRemoveTag={handleRemoveTag("solutions_offered")}
                placeholder="Add a solution..."
              />
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Tags & Categories */}
      <PageSection title="Tags & Categories">
        <div className="space-y-6">
          <CategorySection title="Skills">
            <div className="w-full">
              <TagInput
                label="Skills"
                tags={formData.skills}
                onAddTag={handleAddTag("skills")}
                onRemoveTag={handleRemoveTag("skills")}
                placeholder="Add a skill..."
              />
            </div>
          </CategorySection>
          <CategorySection title="Expertise">
            <div className="w-full">
              <TagInput
                label="Expertise"
                tags={formData.expertise}
                onAddTag={handleAddTag("expertise")}
                onRemoveTag={handleRemoveTag("expertise")}
                placeholder="Add an area of expertise..."
              />
            </div>
          </CategorySection>
          <CategorySection title="Interest Tags">
            <div className="w-full">
              <TagInput
                label="Interest Tags"
                tags={formData.interest_tags}
                onAddTag={handleAddTag("interest_tags")}
                onRemoveTag={handleRemoveTag("interest_tags")}
                placeholder="Add an interest..."
              />
            </div>
          </CategorySection>

          <CategorySection title="Experience">
            <div className="w-full">
              <TagInput
                label="Experience Tags"
                tags={formData.experience_tags}
                onAddTag={handleAddTag("experience_tags")}
                onRemoveTag={handleRemoveTag("experience_tags")}
                placeholder="Add experience..."
              />
            </div>
          </CategorySection>

          <CategorySection title="Education">
            <div className="w-full">
              <TagInput
                label="Education Tags"
                tags={formData.education_tags}
                onAddTag={handleAddTag("education_tags")}
                onRemoveTag={handleRemoveTag("education_tags")}
                placeholder="Add education..."
              />
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Status */}
      <PageSection title="Status">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Work Status">
            <div className="w-full">
              <select
                id="work_status"
                name="work_status"
                value={formData.work_status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select work status...</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="freelance">Freelance</option>
                <option value="contract">Contract</option>
                <option value="looking">Looking for Work</option>
              </select>
            </div>
          </CategorySection>

          <CategorySection title="Seeking">
            <div className="w-full">
              <select
                id="seeking"
                name="seeking"
                value={formData.seeking}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select what you're seeking...</option>
                <option value="full_time">Full Time Work</option>
                <option value="part_time">Part Time Work</option>
                <option value="freelance">Freelance Work</option>
                <option value="collaboration">Collaboration</option>
                <option value="networking">Networking</option>
              </select>
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Contact & Availability */}
      <PageSection title="Contact & Availability">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Social Links">
            <div className="space-y-4 w-full">
              {Object.entries(formData.social_links).map(([platform, url]) => (
                <div key={platform}>
                  <label htmlFor={platform} className="block text-sm font-medium text-gray-700 capitalize">
                    {platform}
                  </label>
                  <input
                    type="url"
                    id={platform}
                    name={`social_links.${platform}`}
                    value={url}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        social_links: {
                          ...prev.social_links,
                          [platform]: e.target.value,
                        },
                      }))
                    }}
                    placeholder={`Enter your ${platform} URL`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              ))}
            </div>
          </CategorySection>
          <CategorySection title="Website Links">
            <div className="space-y-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    website_links: [...prev.website_links, ""],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Website Link
              </button>
              {formData.website_links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...formData.website_links]
                      newLinks[index] = e.target.value
                      setFormData((prev) => ({
                        ...prev,
                        website_links: newLinks,
                      }))
                    }}
                    placeholder="Enter website URL"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        website_links: prev.website_links.filter((_, i) => i !== index),
                      }))
                    }}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
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
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    work_experience: [...prev.work_experience, { title: "", company: "", years: "", media: undefined }],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Work Experience
              </button>
              {formData.work_experience.map((exp, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => {
                      const newExp = [...formData.work_experience]
                      newExp[index] = { ...newExp[index], title: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        work_experience: newExp,
                      }))
                    }}
                    placeholder="Job Title"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const newExp = [...formData.work_experience]
                      newExp[index] = { ...newExp[index], company: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        work_experience: newExp,
                      }))
                    }}
                    placeholder="Company"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="text"
                    value={exp.years}
                    onChange={(e) => {
                      const newExp = [...formData.work_experience]
                      newExp[index] = { ...newExp[index], years: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        work_experience: newExp,
                      }))
                    }}
                    placeholder="Years"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const newExp = [...formData.work_experience]
                        newExp[index] = { ...newExp[index], media: file }
                        setFormData((prev) => ({
                          ...prev,
                          work_experience: newExp,
                        }))
                      }
                    }}
                    accept="image/*,video/*"
                    className="mt-2 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        work_experience: prev.work_experience.filter((_, i) => i !== index),
                      }))
                    }}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </CategorySection>
          <CategorySection title="Education">
            <div className="space-y-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    education: [...prev.education, { degree: "", school: "", year: "", media: undefined }],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Education
              </button>
              {formData.education.map((edu, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...formData.education]
                      newEdu[index] = { ...newEdu[index], degree: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        education: newEdu,
                      }))
                    }}
                    placeholder="Degree"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => {
                      const newEdu = [...formData.education]
                      newEdu[index] = { ...newEdu[index], school: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        education: newEdu,
                      }))
                    }}
                    placeholder="School"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => {
                      const newEdu = [...formData.education]
                      newEdu[index] = { ...newEdu[index], year: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        education: newEdu,
                      }))
                    }}
                    placeholder="Year"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const newEdu = [...formData.education]
                        newEdu[index] = { ...newEdu[index], media: file }
                        setFormData((prev) => ({
                          ...prev,
                          education: newEdu,
                        }))
                      }
                    }}
                    accept="image/*,video/*"
                    className="mt-2 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        education: prev.education.filter((_, i) => i !== index),
                      }))
                    }}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </CategorySection>
        </div>
        <div className="md:grid md:grid-cols-2 md:gap-6 mt-6">
          <CategorySection title="Certifications">
            <div className="space-y-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    certifications: [...prev.certifications, { name: "", issuer: "", year: "", media: undefined }],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Certification
              </button>
              {formData.certifications.map((cert, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => {
                      const newCerts = [...formData.certifications]
                      newCerts[index] = { ...newCerts[index], name: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        certifications: newCerts,
                      }))
                    }}
                    placeholder="Certification Name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => {
                      const newCerts = [...formData.certifications]
                      newCerts[index] = { ...newCerts[index], issuer: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        certifications: newCerts,
                      }))
                    }}
                    placeholder="Issuer"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="text"
                    value={cert.year}
                    onChange={(e) => {
                      const newCerts = [...formData.certifications]
                      newCerts[index] = { ...newCerts[index], year: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        certifications: newCerts,
                      }))
                    }}
                    placeholder="Year"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const newCerts = [...formData.certifications]
                        newCerts[index] = { ...newCerts[index], media: file }
                        setFormData((prev) => ({
                          ...prev,
                          certifications: newCerts,
                        }))
                      }
                    }}
                    accept="image/*,video/*"
                    className="mt-2 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        certifications: prev.certifications.filter((_, i) => i !== index),
                      }))
                    }}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </CategorySection>
          <CategorySection title="Accolades">
            <div className="space-y-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    accolades: [...prev.accolades, { title: "", issuer: "", year: "", media: undefined }],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Accolade
              </button>
              {formData.accolades.map((accolade, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <input
                    type="text"
                    value={accolade.title}
                    onChange={(e) => {
                      const newAccolades = [...formData.accolades]
                      newAccolades[index] = { ...newAccolades[index], title: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        accolades: newAccolades,
                      }))
                    }}
                    placeholder="Accolade Title"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="text"
                    value={accolade.issuer}
                    onChange={(e) => {
                      const newAccolades = [...formData.accolades]
                      newAccolades[index] = { ...newAccolades[index], issuer: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        accolades: newAccolades,
                      }))
                    }}
                    placeholder="Issuer"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="text"
                    value={accolade.year}
                    onChange={(e) => {
                      const newAccolades = [...formData.accolades]
                      newAccolades[index] = { ...newAccolades[index], year: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        accolades: newAccolades,
                      }))
                    }}
                    placeholder="Year"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const newAccolades = [...formData.accolades]
                        newAccolades[index] = { ...newAccolades[index], media: file }
                        setFormData((prev) => ({
                          ...prev,
                          accolades: newAccolades,
                        }))
                      }
                    }}
                    accept="image/*,video/*"
                    className="mt-2 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        accolades: prev.accolades.filter((_, i) => i !== index),
                      }))
                    }}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </CategorySection>
          <CategorySection title="Endorsements">
            <div className="space-y-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    endorsements: [
                      ...prev.endorsements,
                      { name: "", position: "", company: "", text: "", media: undefined },
                    ],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Endorsement
              </button>
              {formData.endorsements.map((endorsement, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <input
                    type="text"
                    value={endorsement.name}
                    onChange={(e) => {
                      const newEndorsements = [...formData.endorsements]
                      newEndorsements[index] = { ...newEndorsements[index], name: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        endorsements: newEndorsements,
                      }))
                    }}
                    placeholder="Endorser Name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="text"
                    value={endorsement.position}
                    onChange={(e) => {
                      const newEndorsements = [...formData.endorsements]
                      newEndorsements[index] = { ...newEndorsements[index], position: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        endorsements: newEndorsements,
                      }))
                    }}
                    placeholder="Endorser Position"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="text"
                    value={endorsement.company}
                    onChange={(e) => {
                      const newEndorsements = [...formData.endorsements]
                      newEndorsements[index] = { ...newEndorsements[index], company: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        endorsements: newEndorsements,
                      }))
                    }}
                    placeholder="Endorser Company"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <textarea
                    value={endorsement.text}
                    onChange={(e) => {
                      const newEndorsements = [...formData.endorsements]
                      newEndorsements[index] = { ...newEndorsements[index], text: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        endorsements: newEndorsements,
                      }))
                    }}
                    placeholder="Endorsement Text"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const newEndorsements = [...formData.endorsements]
                        newEndorsements[index] = { ...newEndorsements[index], media: file }
                        setFormData((prev) => ({
                          ...prev,
                          endorsements: newEndorsements,
                        }))
                      }
                    }}
                    accept="image/*,video/*"
                    className="mt-2 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        endorsements: prev.endorsements.filter((_, i) => i !== index),
                      }))
                    }}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
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
              <div>
                <label htmlFor="short_term_goals" className="block text-sm font-medium text-gray-700">
                  Short Term Goals
                </label>
                <textarea
                  id="short_term_goals"
                  name="short_term_goals"
                  value={formData.short_term_goals}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Enter your short term goals..."
                ></textarea>
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Long Term Goals">
            <div className="space-y-4 w-full">
              <div>
                <label htmlFor="long_term_goals" className="block text-sm font-medium text-gray-700">
                  Long Term Goals
                </label>
                <textarea
                  id="long_term_goals"
                  name="long_term_goals"
                  value={formData.long_term_goals}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Enter your long term goals..."
                ></textarea>
              </div>
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Portfolio & Showcase */}
      <PageSection title="Portfolio & Showcase">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Featured Projects">
            <div className="space-y-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    featured_projects: [
                      ...prev.featured_projects,
                      { title: "", description: "", url: "", media: undefined },
                    ],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Featured Project
              </button>
              {formData.featured_projects.map((project, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => {
                      const newProjects = [...formData.featured_projects]
                      newProjects[index] = { ...newProjects[index], title: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        featured_projects: newProjects,
                      }))
                    }}
                    placeholder="Project Title"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const newProjects = [...formData.featured_projects]
                        newProjects[index] = { ...newProjects[index], media: file }
                        setFormData((prev) => ({
                          ...prev,
                          featured_projects: newProjects,
                        }))
                      }
                    }}
                    accept="image/*,video/*"
                    className="mt-2 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  <textarea
                    value={project.description}
                    onChange={(e) => {
                      const newProjects = [...formData.featured_projects]
                      newProjects[index] = { ...newProjects[index], description: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        featured_projects: newProjects,
                      }))
                    }}
                    placeholder="Project Description"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="url"
                    value={project.url}
                    onChange={(e) => {
                      const newProjects = [...formData.featured_projects]
                      newProjects[index] = { ...newProjects[index], url: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        featured_projects: newProjects,
                      }))
                    }}
                    placeholder="Project URL"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        featured_projects: prev.featured_projects.filter((_, i) => i !== index),
                      }))
                    }}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </CategorySection>
          <CategorySection title="Case Studies">
            <div className="space-y-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    case_studies: [...prev.case_studies, { title: "", description: "", url: "", media: undefined }],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Case Study
              </button>
              {formData.case_studies.map((study, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <input
                    type="text"
                    value={study.title}
                    onChange={(e) => {
                      const newStudies = [...formData.case_studies]
                      newStudies[index] = { ...newStudies[index], title: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        case_studies: newStudies,
                      }))
                    }}
                    placeholder="Case Study Title"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const newStudies = [...formData.case_studies]
                        newStudies[index] = { ...newStudies[index], media: file }
                        setFormData((prev) => ({
                          ...prev,
                          case_studies: newStudies,
                        }))
                      }
                    }}
                    accept="image/*,video/*"
                    className="mt-2 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  <textarea
                    value={study.description}
                    onChange={(e) => {
                      const newStudies = [...formData.case_studies]
                      newStudies[index] = { ...newStudies[index], description: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        case_studies: newStudies,
                      }))
                    }}
                    placeholder="Case Study Description"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="url"
                    value={study.url}
                    onChange={(e) => {
                      const newStudies = [...formData.case_studies]
                      newStudies[index] = { ...newStudies[index], url: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        case_studies: newStudies,
                      }))
                    }}
                    placeholder="Case Study URL"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        case_studies: prev.case_studies.filter((_, i) => i !== index),
                      }))
                    }}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Privacy & Notifications */}
      <PageSection title="Privacy & Notifications (Coming Soon!)">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Privacy Settings">
            <div className="space-y-4 w-full">
              <div>
                <label htmlFor="profile_visibility" className="block text-sm font-medium text-gray-700">
                  Profile Visibility
                </label>
                <select
                  id="profile_visibility"
                  name="profile_visibility"
                  value={formData.profile_visibility}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="connections">Connections Only</option>
                </select>
              </div>
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  id="search_visibility"
                  name="search_visibility"
                  checked={formData.search_visibility}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <label htmlFor="search_visibility" className="ml-2 block text-sm text-gray-900">
                  Visible in search results
                </label>
              </div>
            </div>
          </CategorySection>
          <CategorySection title="Notification Preferences">
            <div className="space-y-4 w-full">
              {Object.entries(formData.notification_preferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    id={`notification_${key}`}
                    checked={value}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          [key]: e.target.checked,
                        },
                      }))
                    }}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <label htmlFor={`notification_${key}`} className="ml-2 block text-sm text-gray-900 capitalize">
                    {key.replace("_", " ")} Notifications
                  </label>
                </div>
              ))}
            </div>
          </CategorySection>
        </div>
      </PageSection>

      <div className="flex justify-center">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}


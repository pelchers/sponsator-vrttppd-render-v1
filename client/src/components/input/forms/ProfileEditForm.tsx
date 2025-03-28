"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import { useProfileForm } from '@/hooks/useProfileForm'
import PageSection from "@/components/sections/PageSection"
import CategorySection from "@/components/sections/CategorySection"
import TagInput from "./TagInput"
import ImageUpload from "./ImageUpload"
import { Button } from "@/components/ui/button"
import Layout from "@/components/layout/Layout"
import './ProfileEditForm.css'
import { API_URL } from '@/config'

export default function ProfileEditForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      navigate('/login');
      return;
    }
    
    // Ensure the user is editing their own profile
    if (id && id !== userId) {
      navigate(`/profile/${userId}/edit`);
      return;
    }
  }, [id, navigate]);
  
  const {
    formData,
    setFormData,
    loading,
    saving,
    error,
    success,
    handleInputChange,
    handleImageSelect,
    handleAddTag,
    handleRemoveTag,
    handleSubmit,
    handleDeleteFeaturedProject
  } = useProfileForm(id || localStorage.getItem('userId') || undefined)

  // Handle success - redirect to profile page
  useEffect(() => {
    if (success && id) {
      navigate(`/profile/${id}`);
    }
  }, [success, id, navigate])

  if (loading) {
    return (
      <Layout>
        <div className="profile-edit-container">
          <div className="form-section">Loading profile data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="min-h-screen w-full bg-[#FFFEFF]">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

          {/* Error/Success Messages */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            {error && (
              <div className="error-message">{error}</div>
            )}
            {success && (
              <div className="success-message">Profile updated successfully!</div>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
            
            {/* Image section container */}
            <div className="flex flex-col items-center space-y-4">
              {/* Image Toggle Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className={`
                    relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium
                    transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none
                    ${
                    formData.profile_image_display === 'url' 
                      ? 'bg-spring text-black' 
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    profile_image_display: 'url',
                    profile_image_upload: ''
                  }))}
                >
                  Use URL Image
                </button>
                <button
                  type="button"
                  className={`
                    relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium
                    transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none
                    ${
                    formData.profile_image_display === 'upload' 
                      ? 'bg-spring text-black' 
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    profile_image_display: 'upload',
                    profile_image_url: '' 
                  }))}
                >
                  Use Uploaded Image
                </button>
              </div>

              {/* URL Input or Upload Component */}
              {formData.profile_image_display === 'url' ? (
                <div className="w-full max-w-md">
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="profile_image_url"
                    value={formData.profile_image_url}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      profile_image_url: e.target.value
                    }))}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              ) : (
                <ImageUpload 
                  onImageSelect={handleImageSelect}
                  currentImage={
                    formData.profile_image_upload 
                      ? `${API_URL.replace('/api', '')}/uploads/${formData.profile_image_upload}`
                      : undefined
                  }
                  showPreview={true}
                />
              )}
            </div>

            {/* Only show this preview for URL mode */}
            {formData.profile_image_display === 'url' && formData.profile_image_url && (
              <div className="mt-4 flex justify-center">
                <img
                  src={formData.profile_image_url}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                />
              </div>
            )}

            {/* Add back the basic user information fields */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="border border-black p-2 rounded-lg bg-white w-full"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border border-black p-2 rounded-lg bg-white w-full"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="border border-black p-2 rounded-lg bg-white w-full"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="user_type">User Type</label>
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleInputChange}
                  className="border border-black p-2 rounded-lg bg-white w-full"
                >
                  <option value="">Select user type...</option>
                  <option value="creator">Creator</option>
                  <option value="brand">Brand</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="contractor">Contractor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Professional Information</h2>
            <div className="form-grid">
              {/* Career Details */}
              <div>
                <h3 className="section-title">Career Details</h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="career_title">Career Title</label>
                  <input
                    type="text"
                    id="career_title"
                    name="career_title"
                    value={formData.career_title}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="career_experience">Career Experience (Years)</label>
                  <input
                    type="number"
                    id="career_experience"
                    name="career_experience"
                    value={formData.career_experience}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  />
                </div>
              </div>

              {/* Social Media Details */}
              <div>
                <h3 className="section-title">Social Media</h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="social_media_handle">Handle</label>
                  <input
                    type="text"
                    id="social_media_handle"
                    name="social_media_handle"
                    value={formData.social_media_handle}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="social_media_followers">Followers</label>
                  <input
                    type="number"
                    id="social_media_followers"
                    name="social_media_followers"
                    value={formData.social_media_followers}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  />
                </div>
              </div>
            </div>

            {/* Add Professional Affiliation and Contract Specifications */}
            <div className="form-grid mt-6">
              {/* Professional Affiliation */}
              <div>
                <h3 className="section-title">Professional Affiliation</h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="company_location">Company Location</label>
                  <input
                    type="text"
                    id="company_location"
                    name="company_location"
                    value={formData.company_location}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="company_website">Company Website</label>
                  <input
                    type="url"
                    id="company_website"
                    name="company_website"
                    value={formData.company_website}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Contract Specifications */}
              <div>
                <h3 className="section-title">Contract Specifications</h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="contract_type">Contract Type</label>
                  <select
                    id="contract_type"
                    name="contract_type"
                    value={formData.contract_type}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  >
                    <option value="">Select contract type...</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contract_duration">Contract Duration</label>
                  <input
                    type="text"
                    id="contract_duration"
                    name="contract_duration"
                    value={formData.contract_duration}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                    placeholder="e.g., 6 months, 1 year"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contract_rate">Contract Rate</label>
                  <input
                    type="text"
                    id="contract_rate"
                    name="contract_rate"
                    value={formData.contract_rate}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                    placeholder="e.g., $50/hour, $5000/month"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Availability & Work Preferences */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Availability & Work Preferences</h2>
            <div className="form-grid">
              {/* Availability */}
              <div>
                <h3 className="section-title">Availability</h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="availability_status">Availability Status</label>
                  <select
                    id="availability_status"
                    name="availability_status"
                    value={formData.availability_status}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  >
                    <option value="">Select availability...</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="not_available">Not Available</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="preferred_work_type">Preferred Work Type</label>
                  <select
                    id="preferred_work_type"
                    name="preferred_work_type"
                    value={formData.preferred_work_type}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
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

              {/* Compensation */}
              <div>
                <h3 className="section-title">Compensation</h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="standard_service_rate">Standard Service Rate</label>
                  <input
                    type="text"
                    id="standard_service_rate"
                    name="standard_service_rate"
                    value={formData.standard_service_rate}
                    onChange={handleInputChange}
                    placeholder="e.g. $100"
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="rate_range">General Rate Range</label>
                  <input
                    type="text"
                    id="rate_range"
                    name="rate_range"
                    value={formData.rate_range}
                    onChange={handleInputChange}
                    placeholder="e.g. $50-100"
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="standard_rate_type">Standard Rate Type</label>
                  <select
                    id="standard_rate_type"
                    name="standard_rate_type"
                    value={formData.standard_rate_type}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  >
                    <option value="">Select rate type...</option>
                    <option value="hourly">Hourly</option>
                    <option value="salary">Salary</option>
                    <option value="contract">Contract</option>
                    <option value="revenue_split">Revenue Split</option>
                    <option value="pro_bono">Pro Bono</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="compensation_type">Compensation Type</label>
                  <select
                    id="compensation_type"
                    name="compensation_type"
                    value={formData.compensation_type}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  >
                    <option value="">Select compensation type...</option>
                    <option value="usd">USD</option>
                    <option value="crypto">Crypto</option>
                    <option value="service_exchange">Service Exchange</option>
                    <option value="pro_bono">Pro Bono</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Focus */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Focus</h2>
            <div className="form-grid">
              {/* Target Audience */}
              <div>
                <h3 className="section-title">Target Audience</h3>
                <div className="form-group">
                  <TagInput
                    label="Target Audience"
                    tags={formData.target_audience}
                    onAddTag={handleAddTag("target_audience")}
                    onRemoveTag={handleRemoveTag("target_audience")}
                    placeholder="Add target audience..."
                    tagClassName="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800"
                    buttonClassName="relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-spring text-black"
                  />
                </div>
              </div>

              {/* Solutions Offered */}
              <div>
                <h3 className="section-title">Solutions Offered</h3>
                <div className="form-group">
                  <TagInput
                    label="Solutions Offered"
                    tags={formData.solutions_offered}
                    onAddTag={handleAddTag("solutions_offered")}
                    onRemoveTag={handleRemoveTag("solutions_offered")}
                    placeholder="Add a solution..."
                    tagClassName="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800"
                    buttonClassName="relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-spring text-black"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tags & Categories */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Tags & Categories</h2>
            <div className="space-y-6">
              <CategorySection title="Skills">
                <div className="w-full">
                  <TagInput
                    label="Skills"
                    tags={formData.skills}
                    onAddTag={handleAddTag("skills")}
                    onRemoveTag={handleRemoveTag("skills")}
                    placeholder="Add a skill..."
                    tagClassName="px-2 py-0.5 text-xs rounded-full bg-green-100 text-black border border-black transition-all duration-250 hover:scale-105"
                    buttonClassName="relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-spring text-black"
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
                    tagClassName="px-2 py-0.5 text-xs rounded-full bg-green-100 text-black border border-black transition-all duration-250 hover:scale-105"
                    buttonClassName="relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-spring text-black"
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
                    tagClassName="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-black border border-black transition-all duration-250 hover:scale-105"
                    buttonClassName="relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-spring text-black"
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
                    tagClassName="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-black border border-black transition-all duration-250 hover:scale-105"
                    buttonClassName="relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-spring text-black"
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
                    tagClassName="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-black border border-black transition-all duration-250 hover:scale-105"
                    buttonClassName="relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-spring text-black"
                  />
                </div>
              </CategorySection>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Status</h2>
            <div className="form-grid">
              <CategorySection title="Work Status">
                <div className="w-full">
                  <select
                    id="work_status"
                    name="work_status"
                    value={formData.work_status}
                    onChange={handleInputChange}
                    aria-label="Work Status"
                    className="border border-black p-2 rounded-lg bg-white w-full"
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
                    aria-label="Seeking"
                    className="border border-black p-2 rounded-lg bg-white w-full"
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
          </div>

          {/* Contact & Availability */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Contact & Availability</h2>
            <div className="form-grid">
              <CategorySection title="Social Links">
                <div className="space-y-4 w-full">
                  {Object.entries(formData.social_links).map(([platform, url]) => (
                    <div key={platform} className="form-group">
                      <label className="form-label capitalize" htmlFor={platform}>
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                    className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            website_links: prev.website_links.filter((_, i) => i !== index),
                          }))
                        }}
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </CategorySection>
            </div>
          </div>

          {/* Qualifications */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Qualifications</h2>
            <div className="form-grid">
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
                    className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <input
                        type="file"
                        id="work_experience_media"
                        aria-label="Work Experience Media"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            work_experience: prev.work_experience.filter((_, i) => i !== index),
                          }))
                        }}
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                    className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <input
                        type="file"
                        id="education_media"
                        aria-label="Education Media"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            education: prev.education.filter((_, i) => i !== index),
                          }))
                        }}
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </CategorySection>
            </div>
            <div className="form-grid mt-6">
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
                    className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <input
                        type="file"
                        id="certification_media"
                        aria-label="Certification Media"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            certifications: prev.certifications.filter((_, i) => i !== index),
                          }))
                        }}
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                    className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <input
                        type="file"
                        id="accolade_media"
                        aria-label="Accolade Media"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            accolades: prev.accolades.filter((_, i) => i !== index),
                          }))
                        }}
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                    className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <input
                        type="file"
                        id="endorsement_media"
                        aria-label="Endorsement Media"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            endorsements: prev.endorsements.filter((_, i) => i !== index),
                          }))
                        }}
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </CategorySection>
            </div>
          </div>

          {/* Collaboration & Goals */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Collaboration & Goals</h2>
            <div className="form-grid">
              {/* Short Term Goals */}
              <div>
                <h3 className="section-title">Short Term Goals</h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="short_term_goals">Short Term Goals</label>
                  <textarea
                    id="short_term_goals"
                    name="short_term_goals"
                    value={formData.short_term_goals}
                    onChange={handleInputChange}
                    rows={4}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                    placeholder="Enter your short term goals..."
                  ></textarea>
                </div>
              </div>

              {/* Long Term Goals */}
              <div>
                <h3 className="section-title">Long Term Goals</h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="long_term_goals">Long Term Goals</label>
                  <textarea
                    id="long_term_goals"
                    name="long_term_goals"
                    value={formData.long_term_goals}
                    onChange={handleInputChange}
                    rows={4}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                    placeholder="Enter your long term goals..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio & Showcase */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Portfolio & Showcase</h2>
            <div className="form-grid">
              {/* Featured Projects */}
              <div>
                <h3 className="section-title">Featured Projects</h3>
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
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  >
                    Add Featured Project
                  </button>
                  {formData.featured_projects.map((project, index) => (
                    <div key={project.id || index} className="space-y-2 p-4 border rounded-md">
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <input
                        type="file"
                        id="featured_project_media"
                        aria-label="Featured Project Media"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <button
                        type="button"
                        onClick={() => project.id ? 
                          handleDeleteFeaturedProject(project.id) : 
                          setFormData(prev => ({
                            ...prev,
                            featured_projects: prev.featured_projects.filter((_, i) => i !== index)
                          }))
                        }
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Studies */}
              <div>
                <h3 className="section-title">Case Studies</h3>
                <div className="space-y-4 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        case_studies: [...prev.case_studies, { title: "", description: "", url: "", media: undefined }],
                      }))
                    }}
                    className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <input
                        type="file"
                        id="case_study_media"
                        aria-label="Case Study Media"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            case_studies: prev.case_studies.filter((_, i) => i !== index),
                          }))
                        }}
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Notifications */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Privacy & Notifications</h2>
            <div className="form-grid">
              {/* Privacy Settings */}
              <div>
                <h3 className="section-title">Privacy Settings</h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile_visibility">Profile Visibility</label>
                  <select
                    id="profile_visibility"
                    name="profile_visibility"
                    value={formData.profile_visibility}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
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
                    className="border border-black p-2 rounded-lg bg-white w-full"
                  />
                  <label htmlFor="search_visibility" className="ml-2 block text-sm text-gray-900">
                    Visible in search results
                  </label>
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <h3 className="section-title">Notification Preferences</h3>
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
                        className="border border-black p-2 rounded-lg bg-white w-full"
                      />
                      <label htmlFor={`notification_${key}`} className="ml-2 block text-sm text-gray-900 capitalize">
                        {key.replace("_", " ")} Notifications
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button Section */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-center w-full">
              <Button 
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-spring text-black rounded-full focus:outline-none focus:ring-2 focus:ring-spring-dark focus:ring-offset-2 w-full md:w-auto"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}


"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useProjectForm } from "@/hooks/useProjectForm"
import PageSection from "./PageSection"
import CategorySection from "./CategorySection"
import TagInput from "./TagInput"
import ImageUpload from "./ImageUpload"
import ProjectImageUpload from "./ProjectImageUpload"
import { API_URL } from "@/config"

export default function ProjectEditForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")
    
    if (!token || !userId) {
      navigate("/login")
      return
    }
  }, [navigate])
  
  const {
    formData,
    setFormData,
    loading,
    saving,
    error,
    success,
    handleInputChange,
    handleImageSelect,
    handleSubmit,
  } = useProjectForm(id)

  // Handle success - redirect to project page
  useEffect(() => {
    if (success && id) {
      navigate(`/project/${id}`)
    }
  }, [success, id, navigate])

  // Debug log to check what image data is available
  useEffect(() => {
    if (!loading && formData) {
      console.log('Project image data in form:', {
        display: formData.project_image_display,
        url: formData.project_image_url,
        upload: formData.project_image_upload
      });
    }
  }, [loading, formData]);

  if (loading) {
        return (
      <div className="project-edit-container">
        <div className="form-section">Loading project data...</div>
            </div>
    )
  }

  return (
            <div className="w-full">
      <form onSubmit={handleSubmit} className="project-edit-container">
            <div>
          <div className="form-section">
            {error && (
              <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                  </div>
            )}
            {success && (
              <div className="success-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Success! </strong>
                <span className="block sm:inline">Project updated successfully!</span>
              </div>
            )}
            </div>

          {/* Project Information */}
          <div className="form-section">
            <h2 className="section-title">Project Information</h2>
            
            {/* Image section container */}
            <div className="flex flex-col items-center space-y-4">
              {/* Image Toggle Buttons */}
              <div className="flex items-center space-x-4">
              <button
                type="button"
                  className={`px-4 py-2 rounded transition-colors ${
                    formData.project_image_display === "url" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => setFormData(prev => ({ 
                    ...prev,
                    project_image_display: "url",
                    project_image_upload: "" // Use empty string instead of null
                  }))}
                >
                  Use URL Image
              </button>
                  <button
                    type="button"
                  className={`px-4 py-2 rounded transition-colors ${
                    formData.project_image_display === "upload" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => setFormData(prev => ({ 
                        ...prev,
                    project_image_display: "upload",
                    project_image_url: "" // Use empty string instead of null
                  }))}
                >
                  Use Uploaded Image
                  </button>
                </div>

              {/* URL Input or Upload Component */}
              {formData.project_image_display === "url" ? (
                <div className="w-full max-w-md">
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="project_image_url"
                    value={formData.project_image_url || ''}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                      project_image_url: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              ) : (
                <ProjectImageUpload 
                  onImageSelect={handleImageSelect}
                  currentImage={
                    formData.project_image_upload 
                      ? `${API_URL.replace("/api", "")}/uploads/${formData.project_image_upload}`
                      : undefined // Use undefined instead of null
                  }
                  showPreview={true}
                />
              )}
                </div>

            {/* Only show this preview for URL mode */}
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

            {/* Basic project information fields */}
            <div className="form-grid mt-6">
              <div className="form-group">
                <label className="form-label" htmlFor="project_name">Project Name</label>
                <input
                  type="text"
                  id="project_name"
                  name="project_name"
                  value={formData.project_name || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="project_description">Description</label>
              <textarea
                  id="project_description"
                  name="project_description"
                  value={formData.project_description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="project_type">Project Type</label>
                <select
                  id="project_type"
                  name="project_type"
                  value={formData.project_type || ''}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select project type...</option>
                  <option value="personal">Personal</option>
                  <option value="client">Client</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="open_source">Open Source</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="project_category">Category</label>
                <select
                  id="project_category"
                  name="project_category"
                  value={formData.project_category || ''}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select category...</option>
                  <option value="web">Web Development</option>
                  <option value="mobile">Mobile App</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              </div>
            </div>

          {/* Add more sections as needed */}
          
          <div className="form-section">
            <div className="flex items-center justify-center w-full">
        <button
          type="submit"
                disabled={saving}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full md:w-auto"
        >
                {saving ? "Saving..." : "Save Project"}
        </button>
            </div>
          </div>
      </div>
    </form>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import PageSection from "@/components/sections/PageSection"
import { Button } from "@/components/ui/button"
import { createArticle, updateArticle, fetchArticle, uploadArticleCoverImage } from "@/api/articles"
import ArticleImageUpload from "@/components/input/forms/ArticleImageUpload"
import { API_URL } from '@/config'
import TagInput from "@/components/input/forms/TagInput"

type SectionType = "full-width-text" | "full-width-media" | "left-media-right-text" | "left-text-right-media"

interface Section {
  id?: string
  type: SectionType
  title: string
  subtitle?: string
  text?: string
  mediaUrl?: string
  mediaSubtext?: string
  order?: number
}

export default function ArticleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("")
  const [sections, setSections] = useState<Section[]>([])
  const [citations, setCitations] = useState<string[]>([])
  const [contributors, setContributors] = useState<string[]>([])
  const [relatedMedia, setRelatedMedia] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    article_image_url: "",
    article_image_upload: "",
    article_image_display: "url" as 'url' | 'upload',
  });

  // Fetch article data if editing an existing article
  useEffect(() => {
    if (id && id !== 'new') {
      setLoading(true);
      fetchArticle(id)
        .then(data => {
          if (data) {
            setTitle(data.title || '');
            
            // Make sure sections are properly formatted
            const formattedSections = (data.sections || []).map(section => ({
              type: section.type || 'full-width-text',
              title: section.title || '',
              subtitle: section.subtitle || '',
              text: section.text || '',
              mediaUrl: section.mediaUrl || '',
              mediaSubtext: section.mediaSubtext || '',
              order: section.order ?? 0
            }));
            
            // Sort sections by order
            const sortedSections = [...formattedSections].sort((a, b) => 
              (a.order || 0) - (b.order || 0)
            );
            
            setSections(sortedSections);
            setCitations(data.citations || []);
            setContributors(data.contributors || []);
            setRelatedMedia(data.related_media || []);
            setTags(data.tags || []);
            setFormData({
              title: data.title || '',
              article_image_url: data.article_image_url || '',
              article_image_upload: data.article_image_upload || '',
              article_image_display: data.article_image_display || 'url'
            });
          }
        })
        .catch(error => {
          console.error('Error fetching article:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Ensure all sections have an order value
      const orderedSections = sections.map((section, index) => ({
        ...section,
        order: section.order !== undefined ? section.order : index
      }));
      
      // Prepare data for API
      const articleData = {
        title,
        sections: orderedSections,
        citations,
        contributors,
        related_media: relatedMedia,
        tags,
        article_image_url: formData.article_image_url,
        article_image_upload: formData.article_image_upload,
        article_image_display: formData.article_image_display
      };
      
      console.log('Submitting article data:', articleData);
      
      let response;
      if (id && id !== 'new') {
        // Update existing article
        response = await updateArticle(id, articleData);
      } else {
        // Create new article
        response = await createArticle(articleData);
      }
      
      console.log('API response:', response);
      
      // Navigate to article view page
      navigate(`/article/${response.id}`);
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    const newOrder = sections.length > 0 
      ? Math.max(...sections.map(s => s.order || 0)) + 1 
      : 0;
    setSections([...sections, { 
      type: "full-width-text", 
      title: "",
      order: newOrder 
    }]);
  };

  const updateSection = (index: number, updates: Partial<Section>) => {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], ...updates }
    setSections(newSections)
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index)
    // Update order values to be sequential
    newSections.forEach((section, idx) => {
      section.order = idx;
    });
    setSections(newSections)
  };
  
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === sections.length - 1)) {
      return; // Can't move further in this direction
    }
    
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the sections
    [newSections[index], newSections[targetIndex]] = 
    [newSections[targetIndex], newSections[index]];
    
    // Update orders to match new positions
    newSections.forEach((section, idx) => {
      section.order = idx;
    });
    
    setSections(newSections);
  };

  const renderSectionFields = (section: Section, index: number) => {
    switch (section.type) {
      case "full-width-text":
        // Only text fields for full-width-text
        return (
          <div className="space-y-4 article-adaptive-container">
            <input
              type="text"
              placeholder="Subtitle"
              value={section.subtitle || ""}
              onChange={(e) => updateSection(index, { subtitle: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Main text"
              value={section.text || ""}
              onChange={(e) => updateSection(index, { text: e.target.value })}
              rows={6}
              className="w-full p-2 border rounded"
            />
          </div>
        );
      case "full-width-media":
        // Only media fields for full-width-media, but without file input
        return (
          <div className="space-y-4 article-adaptive-container">
            <input
              type="text"
              placeholder="Media URL"
              value={section.mediaUrl || ""}
              onChange={(e) => updateSection(index, { mediaUrl: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Media subtext"
              value={section.mediaSubtext || ""}
              onChange={(e) => updateSection(index, { mediaSubtext: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
        );
      case "left-media-right-text":
      case "left-text-right-media":
        // Both media and text fields for mixed layouts, but without file input
        return (
          <div className="space-y-6">
            <div className="p-4 border rounded bg-gray-50">
              <h4 className="font-medium mb-2">Text Content</h4>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Subtitle"
                  value={section.subtitle || ""}
                  onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  placeholder="Main text"
                  value={section.text || ""}
                  onChange={(e) => updateSection(index, { text: e.target.value })}
                  rows={6}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="p-4 border rounded bg-gray-50">
              <h4 className="font-medium mb-2">Media Content</h4>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Media URL"
                  value={section.mediaUrl || ""}
                  onChange={(e) => updateSection(index, { mediaUrl: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Media subtext"
                  value={section.mediaSubtext || ""}
                  onChange={(e) => updateSection(index, { mediaSubtext: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
              <p>Note: For {section.type === "left-media-right-text" ? "Left Media - Right Text" : "Left Text - Right Media"} layout, 
              both text and media content are required.</p>
            </div>
          </div>
        );
    }
  };

  const addCitation = () => {
    setCitations([...citations, ""])
  };

  const updateCitation = (index: number, value: string) => {
    const newCitations = [...citations]
    newCitations[index] = value
    setCitations(newCitations)
  };

  const removeCitation = (index: number) => {
    const newCitations = citations.filter((_, i) => i !== index)
    setCitations(newCitations)
  };

  const addContributor = () => {
    setContributors([...contributors, ""])
  };

  const updateContributor = (index: number, value: string) => {
    const newContributors = [...contributors]
    newContributors[index] = value
    setContributors(newContributors)
  };

  const removeContributor = (index: number) => {
    const newContributors = contributors.filter((_, i) => i !== index)
    setContributors(newContributors)
  };

  const addRelatedMedia = () => {
    setRelatedMedia([...relatedMedia, ""])
  };

  const updateRelatedMedia = (index: number, value: string) => {
    const newRelatedMedia = [...relatedMedia]
    newRelatedMedia[index] = value
    setRelatedMedia(newRelatedMedia)
  };

  const removeRelatedMedia = (index: number) => {
    const newRelatedMedia = relatedMedia.filter((_, i) => i !== index)
    setRelatedMedia(newRelatedMedia)
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = async (file: File) => {
    try {
      if (id) {
        const result = await uploadArticleCoverImage(id, file);
        setFormData(prev => ({
          ...prev,
          article_image_upload: result.path,
          article_image_url: '',
          article_image_display: 'upload'
        }));
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      // Handle error (show message to user)
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFEFF]">
      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">{id === 'new' ? 'Create New Article' : 'Edit Article'}</h2>
            
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
                      formData.article_image_display === "url" 
                        ? 'bg-spring text-black' 
                        : 'bg-white text-black'
                    }`}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    article_image_display: "url",
                    article_image_upload: "" 
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
                      formData.article_image_display === "upload" 
                        ? 'bg-spring text-black' 
                        : 'bg-white text-black'
                    }`}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    article_image_display: "upload",
                    article_image_url: "" 
                  }))}
                >
                  Use Uploaded Image
                </button>
              </div>

              {/* URL Input or Upload Component */}
              {formData.article_image_display === "url" ? (
                <div className="w-full max-w-md">
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="article_image_url"
                    value={formData.article_image_url || ''}
                    onChange={handleInputChange}
                    className="border border-black p-2 rounded-lg bg-white w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              ) : (
                <ArticleImageUpload 
                  onImageSelect={handleImageSelect}
                  currentImage={
                    formData.article_image_upload 
                      ? `${API_URL.replace("/api", "")}/uploads/${formData.article_image_upload}`
                      : undefined
                  }
                  showPreview={true}
                />
              )}
            </div>

            {/* Article Content */}
            <div className="space-y-4 mt-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  placeholder="Enter article title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-black p-2 rounded-lg bg-white w-full"
                />
              </div>

              <div>
                <TagInput
                  label="Tags"
                  tags={tags}
                  onAddTag={(tag) => setTags([...tags, tag])}
                  onRemoveTag={(tagToRemove) => setTags(tags.filter(tag => tag !== tagToRemove))}
                  placeholder="Add a tag..."
                  tagClassName="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-lemon-light text-black border border-black transition-all duration-250 hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Article Sections */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Article Sections</h2>
            {sections.map((section, index) => (
              <div key={index} className="border border-black p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Section {index + 1}</h3>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => moveSection(index, 'up')} 
                      disabled={index === 0}
                      type="button"
                      className="bg-turquoise hover:bg-turquoise-dark text-black px-4 py-2 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                    >
                      Move Up
                    </Button>
                    <Button 
                      onClick={() => moveSection(index, 'down')} 
                      disabled={index === sections.length - 1}
                      type="button"
                      className="bg-turquoise hover:bg-turquoise-dark text-black px-4 py-2 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                    >
                      Move Down
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      placeholder="Section title"
                      value={section.title}
                      onChange={(e) => updateSection(index, { title: e.target.value })}
                      className="w-2/3 p-2 border rounded"
                    />
                    <select
                      value={section.type}
                      onChange={(e) => updateSection(index, { type: e.target.value as SectionType })}
                      className="w-1/3 p-2 border rounded ml-2"
                      aria-label="Section type"
                    >
                      <option value="full-width-text">Full Width Text</option>
                      <option value="full-width-media">Full Width Media</option>
                      <option value="left-media-right-text">Left Media - Right Text</option>
                      <option value="left-text-right-media">Left Text - Right Media</option>
                    </select>
                  </div>
                  {renderSectionFields(section, index)}
                  <Button 
                    onClick={() => removeSection(index)} 
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                  >
                    Remove Section
                  </Button>
                </div>
              </div>
            ))}
            
            <Button 
              onClick={addSection} 
              className="bg-spring text-black px-6 py-2 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              type="button"
            >
              Add Section
            </Button>
          </div>

          {/* Citations, Contributors, Related Media */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <PageSection title="Citations">
                {citations.map((citation, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Enter citation"
                      value={citation}
                      onChange={(e) => updateCitation(index, e.target.value)}
                      className="flex-grow p-2 border rounded"
                    />
                    <Button variant="destructive" onClick={() => removeCitation(index)} type="button">
                      Remove
                    </Button>
                  </div>
                ))}
                <Button onClick={addCitation} className="mt-2" type="button">
                  Add New Citation
                </Button>
              </PageSection>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <PageSection title="Contributors">
                {contributors.map((contributor, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Enter contributor"
                      value={contributor}
                      onChange={(e) => updateContributor(index, e.target.value)}
                      className="flex-grow p-2 border rounded"
                    />
                    <Button variant="destructive" onClick={() => removeContributor(index)} type="button">
                      Remove
                    </Button>
                  </div>
                ))}
                <Button onClick={addContributor} className="mt-2" type="button">
                  Add New Contributor
                </Button>
              </PageSection>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <PageSection title="Related Media">
                {relatedMedia.map((media, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Enter related media"
                      value={media}
                      onChange={(e) => updateRelatedMedia(index, e.target.value)}
                      className="flex-grow p-2 border rounded"
                    />
                    <Button variant="destructive" onClick={() => removeRelatedMedia(index)} type="button">
                      Remove
                    </Button>
                  </div>
                ))}
                <Button onClick={addRelatedMedia} className="mt-2" type="button">
                  Add New Related Media
                </Button>
              </PageSection>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-spring text-black px-6 py-2 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                disabled={saving}
              >
                {saving ? 'Saving...' : (id === 'new' ? 'Create Article' : 'Update Article')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}


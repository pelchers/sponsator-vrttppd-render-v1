import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArticleFormData, 
  defaultArticleFormState, 
  validateArticleForm 
} from '@/components/input/forms/config/articleFormConfig';
import { 
  fetchArticle, 
  createArticle, 
  updateArticle, 
  uploadArticleMedia 
} from '@/api/articles';

export interface ArticleFormDataWithFile extends ArticleFormData {
  sectionMedia?: Record<number, File>;
}

export const useArticleForm = (articleId?: string) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ArticleFormDataWithFile>(defaultArticleFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [mediaUploading, setMediaUploading] = useState<boolean>(false);
  
  // Fetch article data if editing an existing article
  useEffect(() => {
    if (articleId && articleId !== 'new') {
      setLoading(true);
      fetchArticle(articleId)
        .then(data => {
          if (data) {
            setFormData({
              ...data,
              sectionMedia: {}
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
  }, [articleId]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateArticleForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setSaving(true);
    
    try {
      // Transform form data for API
      const apiData = transformFormDataForApi(formData);
      
      let response;
      if (articleId && articleId !== 'new') {
        // Update existing article
        response = await updateArticle(articleId, apiData);
      } else {
        // Create new article
        response = await createArticle(apiData);
      }
      
      // Upload media files if any
      if (response && formData.sectionMedia && Object.keys(formData.sectionMedia).length > 0) {
        setMediaUploading(true);
        
        for (const [sectionIndex, file] of Object.entries(formData.sectionMedia)) {
          await uploadArticleMedia(response.id, parseInt(sectionIndex), file);
        }
        
        setMediaUploading(false);
      }
      
      // Navigate to article view page
      navigate(`/article/${response.id}`);
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Transform form data for API
  const transformFormDataForApi = (formData: ArticleFormDataWithFile) => {
    // Create a copy to avoid mutating the original
    const apiData = { ...formData };
    
    // Remove sectionMedia as it's handled separately
    delete apiData.sectionMedia;
    
    return apiData;
  };
  
  return {
    formData,
    setFormData,
    errors,
    loading,
    saving,
    mediaUploading,
    handleSubmit
  };
}; 
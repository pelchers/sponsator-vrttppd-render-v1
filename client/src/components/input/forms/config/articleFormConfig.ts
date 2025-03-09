// Define section types and default form state
export type SectionType = "full-width-text" | "full-width-media" | "left-media-right-text" | "left-text-right-media";

export interface Section {
  type: SectionType;
  title: string;
  subtitle?: string;
  text?: string;
  mediaUrl?: string;
  mediaSubtext?: string;
}

export interface ArticleFormData {
  title: string;
  sections: Section[];
  citations: string[];
  contributors: string[];
  related_media: string[];
  tags: string[];
}

export const defaultArticleFormState: ArticleFormData = {
  title: "",
  sections: [],
  citations: [],
  contributors: [],
  related_media: [],
  tags: []
};

// Validation rules
export const validateArticleForm = (formData: ArticleFormData): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!formData.title.trim()) {
    errors.title = "Title is required";
  }
  
  if (formData.sections.length === 0) {
    errors.sections = "At least one section is required";
  }
  
  formData.sections.forEach((section, index) => {
    if (!section.title.trim()) {
      errors[`sections[${index}].title`] = "Section title is required";
    }
    
    if (section.type === "full-width-text" || section.type === "left-text-right-media") {
      if (!section.text?.trim()) {
        errors[`sections[${index}].text`] = "Text is required for this section type";
      }
    }
    
    if (section.type === "full-width-media" || section.type === "left-media-right-text") {
      if (!section.mediaUrl?.trim()) {
        errors[`sections[${index}].mediaUrl`] = "Media URL is required for this section type";
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 
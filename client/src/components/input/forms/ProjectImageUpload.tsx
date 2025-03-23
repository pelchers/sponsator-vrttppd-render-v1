import React, { useState, useEffect } from 'react';

interface ProjectImageUploadProps {
  onImageSelect: (file: File) => Promise<void>;
  currentImage?: string;
  showPreview?: boolean;
}

const ProjectImageUpload: React.FC<ProjectImageUploadProps> = ({ 
  onImageSelect, 
  currentImage,
  showPreview = false
}) => {
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [error, setError] = useState<string | null>(null);
  
  // Update preview when currentImage changes
  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      // Validate file size (10MB limit for projects)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(`File size must be less than 10MB`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Call the parent handler
      onImageSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(undefined);
    // You might want to add a way to clear the image in the parent component
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <div className="flex flex-col items-center">
        {showPreview && preview ? (
          <div className="relative mb-4">
            <img
              src={preview}
              alt="Project preview"
              className="w-64 h-48 object-cover rounded-lg border-2 border-gray-200"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="w-64 h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg mb-4">
            <span className="text-gray-500">No image selected</span>
          </div>
        )}
        
        <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">
          Select Image
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*"
          />
        </label>
      </div>
    </div>
  );
};

export default ProjectImageUpload; 
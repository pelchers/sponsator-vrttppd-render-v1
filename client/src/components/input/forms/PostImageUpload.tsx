import React, { useState, useEffect } from 'react';

interface PostImageUploadProps {
  onImageSelect: (file: File) => Promise<void>;
  currentImage?: string;
  showPreview?: boolean;
}

const PostImageUpload: React.FC<PostImageUploadProps> = ({ 
  onImageSelect, 
  currentImage,
  showPreview = false
}) => {
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      // Validate file size (5MB limit for posts)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File size must be less than 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onImageSelect(file);
    }
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
              alt="Post preview"
              className="w-full max-w-xl object-cover rounded-lg border-2 border-gray-200"
            />
          </div>
        ) : (
          <div className="w-full max-w-xl h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg mb-4">
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

export default PostImageUpload; 
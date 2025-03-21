import React, { useRef, useState } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  currentImage?: string | null;
  maxSize?: number;  // in bytes
  accept?: string;
  className?: string;
  ariaLabel?: string;
}

export function ImageUpload({
  onImageSelect,
  currentImage,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = "image/*",
  className,
  ariaLabel = "Upload image"
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      // Validate file size
      if (file.size > maxSize) {
        setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onImageSelect(file);
    } else {
      setPreview(null);
      onImageSelect(null);
    }
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreview(null);
    onImageSelect(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview */}
      {(preview || currentImage) ? (
        <div className="relative w-32 h-32">
          <img
            src={preview || currentImage || DEFAULT_AVATAR}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-0 right-0 -mt-2 -mr-2"
            onClick={handleRemove}
          >
            ×
          </Button>
        </div>
      ) : (
        <div className="w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-lg">
          <span className="text-gray-400">No image selected</span>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Select Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          aria-label={ariaLabel}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 
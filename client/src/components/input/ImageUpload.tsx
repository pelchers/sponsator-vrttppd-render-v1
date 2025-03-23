interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImage?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

export default function ImageUpload({ 
  onImageSelect, 
  currentImage, 
  disabled,
  showPreview = false
}: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        disabled={disabled}
        aria-label="Upload image"
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      
      {showPreview && currentImage && (
        <div className="flex justify-center">
          <img
            src={currentImage}
            alt="Upload preview"
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
          />
        </div>
      )}
    </div>
  );
} 
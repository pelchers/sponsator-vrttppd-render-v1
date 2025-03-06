import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  onImageSelect: (file: File) => Promise<void>
  className?: string
  currentImage?: string
}

export default function ImageUpload({ onImageSelect, className, currentImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (currentImage && typeof currentImage === 'string') {
      setPreview(currentImage)
    }
  }, [currentImage])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageSelect(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300"
      >
        {preview ? (
          <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400">No image</span>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload profile image"
      />
      <Button 
        type="button" 
        onClick={handleButtonClick}
        variant="outline"
        size="sm"
      >
        {preview ? "Change Image" : "Upload Image"}
      </Button>
    </div>
  )
} 
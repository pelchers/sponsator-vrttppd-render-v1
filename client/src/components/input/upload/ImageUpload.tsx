"use client"

import { type ChangeEvent, useState } from "react"
import Image from "next/image"
import { Upload } from "lucide-react"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  currentImageUrl?: string
}

export default function ImageUpload({ onImageSelect, currentImageUrl }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageSelect(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        {previewUrl ? (
          <Image src={previewUrl || "/placeholder.svg"} alt="Profile" fill className="rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      <label className="cursor-pointer">
        <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
          {previewUrl ? "Change Photo" : "Upload Photo"}
        </span>
        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
      </label>
    </div>
  )
}


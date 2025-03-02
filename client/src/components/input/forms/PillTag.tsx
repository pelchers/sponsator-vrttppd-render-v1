import type React from "react"
import { X } from "lucide-react"

interface PillTagProps {
  text: string
  onRemove: () => void
}

export default function PillTag({ text, onRemove }: PillTagProps) {
  return (
    <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
      <span className="text-sm">{text}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-indigo-500 hover:text-indigo-700 focus:outline-none"
        aria-label={`Remove ${text}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
} 
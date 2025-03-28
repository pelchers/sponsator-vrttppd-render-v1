"use client"

import type React from "react"
import { useState } from "react"
import PillTag from "./PillTag"

interface TagInputProps {
  label: string
  tags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  addButtonText?: string
  placeholder?: string
  buttonClassName?: string
  tagClassName?: string
}

export default function TagInput({
  label,
  tags,
  onAddTag,
  onRemoveTag,
  addButtonText = "Add",
  placeholder = "Type and press Add...",
  buttonClassName,
  tagClassName,
}: TagInputProps) {
  const [input, setInput] = useState("")

  const handleAdd = () => {
    if (input.trim()) {
      onAddTag(input.trim())
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 border border-black p-2 rounded-lg bg-white"
        />
        <button
          type="button"
          onClick={handleAdd}
          className={buttonClassName || "relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-spring text-black"}
        >
          {addButtonText}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span 
            key={tag}
            className={tagClassName}
          >
            {tag}
            <button
              onClick={() => onRemoveTag(tag)}
              className="ml-2 hover:text-red-500"
              aria-label="Remove tag"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
} 
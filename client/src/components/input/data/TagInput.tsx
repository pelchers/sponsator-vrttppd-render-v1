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
}

export default function TagInput({
  label,
  tags,
  onAddTag,
  onRemoveTag,
  addButtonText = "Add",
  placeholder = "Type and press Add...",
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
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {addButtonText}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <PillTag key={tag} text={tag} onRemove={() => onRemoveTag(tag)} />
        ))}
      </div>
    </div>
  )
}


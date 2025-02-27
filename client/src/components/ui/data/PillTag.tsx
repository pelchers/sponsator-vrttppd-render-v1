interface PillTagProps {
    text: string
    onRemove: () => void
  }
  
  export default function PillTag({ text, onRemove }: PillTagProps) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
        {text}
        <button type="button" onClick={onRemove} className="text-gray-500 hover:text-gray-700 focus:outline-none">
          ×
        </button>
      </span>
    )
  }
  
  
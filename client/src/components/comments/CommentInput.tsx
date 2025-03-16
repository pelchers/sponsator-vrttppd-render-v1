import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface CommentInputProps {
  entityType: string;
  entityId: string;
  onCommentSubmit: (text: string) => Promise<void>;
  placeholder?: string;
}

export default function CommentInput({
  entityType,
  entityId,
  onCommentSubmit,
  placeholder = "Write a comment..."
}: CommentInputProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCommentSubmit(text);
      setText(""); // Clear input on success
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 p-2 border rounded resize-none"
        rows={1}
      />
      <Button 
        type="submit" 
        disabled={isSubmitting || !text.trim()}
      >
        {isSubmitting ? "Posting..." : "Post"}
      </Button>
    </form>
  );
} 
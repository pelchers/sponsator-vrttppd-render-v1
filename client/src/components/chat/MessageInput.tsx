import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, mediaFiles?: File[]) => Promise<void>;
  disabled?: boolean;
  canSendMedia?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false,
  canSendMedia = true
}) => {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (message.trim() || selectedFiles.length > 0) {
      await onSendMessage(message, selectedFiles.length > 0 ? selectedFiles : undefined);
      setMessage('');
      setSelectedFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedFiles.map((file, index) => (
            <div 
              key={index} 
              className="bg-gray-100 rounded p-1 flex items-center text-sm"
            >
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => handleRemoveFile(index)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <textarea
          className="flex-1 border rounded-lg p-3 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        
        <div className="flex flex-col gap-2">
          {canSendMedia && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </>
          )}
          
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={disabled || (!message.trim() && selectedFiles.length === 0)}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput; 
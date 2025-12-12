import React, { useState, useRef, useEffect } from 'react';
import { PaperclipIcon, SendIcon, XCircleIcon } from './IconComponents';

interface UserInputProps {
  onSend: (text: string, imageFile: File | null) => void;
  isLoading: boolean;
}

const UserInput: React.FC<UserInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [text]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || imageFile) && !isLoading) {
      onSend(text.trim(), imageFile);
      setText('');
      handleRemoveImage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
      {previewUrl && (
        <div className="relative inline-block mb-2">
            <img src={previewUrl} alt="Image preview" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
            <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-[#7E6961] text-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#7E6961]"
                aria-label="Remove image"
            >
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            hidden
            accept="image/*"
        />
        <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-[#7E6961] rounded-full transition-colors disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-[#CBC0B2]/20 focus:outline-none focus:ring-2 focus:ring-[#7E6961] focus:ring-offset-2"
        >
            <PaperclipIcon className="w-6 h-6" />
        </button>
        <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Aura, or upload a photo..."
            rows={1}
            className="flex-1 w-full p-3 bg-stone-100 rounded-xl resize-none focus:ring-2 focus:ring-[#550B14] focus:outline-none transition-shadow"
            disabled={isLoading}
        />
        <button
            type="submit"
            disabled={isLoading || (!text.trim() && !imageFile)}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#550B14] text-white rounded-full transition-colors disabled:bg-[#550B14]/50 disabled:cursor-not-allowed hover:bg-[#7E6961] focus:outline-none focus:ring-2 focus:ring-[#550B14] focus:ring-offset-2"
        >
            <SendIcon className="w-6 h-6" />
        </button>
      </div>
    </form>
  );
};

export default UserInput;
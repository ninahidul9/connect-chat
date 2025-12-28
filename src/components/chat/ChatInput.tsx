import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || disabled) return;
    onSend(message);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 p-4 border-t border-border bg-card"
    >
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className={cn(
            'min-h-[44px] max-h-[120px] resize-none pr-12',
            'bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary',
            'rounded-xl py-3 px-4'
          )}
          rows={1}
        />
      </div>
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || disabled}
        className="h-11 w-11 rounded-xl shrink-0"
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  );
};

export default ChatInput;

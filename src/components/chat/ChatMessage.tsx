import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types/database';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: Message;
  isSent: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isSent }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'flex w-full mb-3 px-2',
        isSent ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'relative max-w-[78%] md:max-w-[60%] px-4 py-2.5 rounded-2xl',
          'text-sm leading-relaxed break-words whitespace-pre-wrap',
          'shadow-sm backdrop-blur-md',
          isSent
            ? `
              bg-gradient-to-br from-primary to-primary/90
              text-primary-foreground
              rounded-br-md
            `
            : `
              bg-muted/80
              text-foreground
              rounded-bl-md
            `
        )}
      >
        {/* Message Text */}
        <p>{message.content}</p>

        {/* Time + Status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1 select-none',
            isSent ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isSent
                ? 'text-primary-foreground/70'
                : 'text-muted-foreground'
            )}
          >
            {format(new Date(message.created_at), 'HH:mm')}
          </span>

          {isSent && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
            >
              {message.is_read ? (
                <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
              ) : (
                <Check className="w-3.5 h-3.5 text-primary-foreground/70" />
              )}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;

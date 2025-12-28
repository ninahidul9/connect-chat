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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex w-full mb-3',
        isSent ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] md:max-w-[60%] px-4 py-2.5 rounded-2xl',
          isSent
            ? 'bg-chat-bubble-sent text-chat-bubble-sent-foreground rounded-br-md'
            : 'bg-chat-bubble-received text-chat-bubble-received-foreground rounded-bl-md'
        )}
      >
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.content}
        </p>
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isSent ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}
          >
            {format(new Date(message.created_at), 'HH:mm')}
          </span>
          {isSent && (
            message.is_read ? (
              <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
            ) : (
              <Check className="w-3.5 h-3.5 text-primary-foreground/70" />
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;

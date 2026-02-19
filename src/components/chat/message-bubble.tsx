'use client'

import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Check, CheckCheck } from 'lucide-react'
import Image from 'next/image'

type MessageBubbleProps = {
  text: string
  imageUrl: string | null
  createdAt: string
  isOwn: boolean
  isRead: boolean
}

export function MessageBubble({ text, imageUrl, createdAt, isOwn, isRead }: MessageBubbleProps) {
  const time = format(new Date(createdAt), 'HH:mm', { locale: ru })

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 shadow-sm',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        {imageUrl && (
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-2">
            <Image
              src={imageUrl}
              alt="Вложение"
              width={280}
              height={200}
              className="rounded-lg object-cover max-h-[200px] w-auto"
            />
          </a>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isOwn ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[11px]',
              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}
          >
            {time}
          </span>
          {isOwn && (
            isRead ? (
              <CheckCheck className={cn('h-3.5 w-3.5', 'text-primary-foreground/70')} />
            ) : (
              <Check className={cn('h-3.5 w-3.5', 'text-primary-foreground/70')} />
            )
          )}
        </div>
      </div>
    </div>
  )
}

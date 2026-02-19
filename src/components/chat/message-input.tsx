'use client'

import { useState, useRef, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Paperclip, Send, X, Loader2 } from 'lucide-react'
import { sendMessage } from '@/actions/chat'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

type MessageInputProps = {
  orderId: string
  onMessageSent?: () => void
}

export function MessageInput({ orderId, onMessageSent }: MessageInputProps) {
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed && !imageUrl) return

    startTransition(async () => {
      const result = await sendMessage({
        orderId,
        text: trimmed || (imageUrl ? '📷 Фото' : ''),
        imageUrl: imageUrl || undefined,
      })

      if (result.success) {
        setText('')
        setImageUrl(null)
        onMessageSent?.()
        textareaRef.current?.focus()
      } else {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: result.error || 'Не удалось отправить сообщение',
        })
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Сбрасываем input чтобы можно было выбрать тот же файл
    e.target.value = ''

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Файл слишком большой (макс. 5 МБ)' })
      return
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Только JPG, PNG, WebP, GIF' })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.success && data.data?.url) {
        setImageUrl(data.data.url)
      } else {
        toast({ variant: 'destructive', title: data.error || 'Ошибка загрузки' })
      }
    } catch {
      toast({ variant: 'destructive', title: 'Ошибка загрузки файла' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border-t bg-card p-3">
      {/* Превью прикреплённого фото */}
      {imageUrl && (
        <div className="mb-2 relative inline-block">
          <Image
            src={imageUrl}
            alt="Прикреплённое фото"
            width={120}
            height={80}
            className="rounded-lg object-cover max-h-[80px] w-auto"
          />
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Кнопка прикрепить */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          disabled={uploading || isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Поле ввода */}
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение..."
          className="min-h-[40px] max-h-[120px] resize-none"
          rows={1}
          disabled={isPending}
        />

        {/* Кнопка отправить */}
        <Button
          type="button"
          size="icon"
          className="shrink-0"
          disabled={isPending || (!text.trim() && !imageUrl)}
          onClick={handleSubmit}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  )
}

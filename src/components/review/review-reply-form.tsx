'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { replyToReview } from '@/actions/reviews'

interface ReviewReplyFormProps {
  reviewId: string
}

export function ReviewReplyForm({ reviewId }: ReviewReplyFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [text, setText] = useState('')
  const [expanded, setExpanded] = useState(false)

  if (!expanded) {
    return (
      <Button size="sm" variant="outline" onClick={() => setExpanded(true)}>
        Ответить на отзыв
      </Button>
    )
  }

  function handleSubmit() {
    if (!text.trim() || isPending) return

    startTransition(async () => {
      const result = await replyToReview(reviewId, text.trim())
      if (result.success) {
        toast({ title: 'Ответ опубликован' })
        setExpanded(false)
        router.refresh()
      } else {
        toast({ variant: 'destructive', title: 'Ошибка', description: result.error })
      }
    })
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Напишите ответ на отзыв..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isPending}
        rows={3}
        maxLength={500}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{text.length}/500</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setExpanded(false); setText('') }}
            disabled={isPending}
          >
            Отмена
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!text.trim() || isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Отправить'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createReview } from '@/actions/reviews'
import { StarRatingInput } from './star-rating-input'
import Image from 'next/image'

interface ReviewFormDialogProps {
  orderId: string
  executorName: string
}

const CRITERIA = [
  { key: 'rating', label: 'Общая оценка' },
  { key: 'qualityRating', label: 'Качество работы' },
  { key: 'punctualityRating', label: 'Пунктуальность' },
  { key: 'valueRating', label: 'Цена / качество' },
  { key: 'politenessRating', label: 'Вежливость' },
] as const

type RatingKey = (typeof CRITERIA)[number]['key']

export function ReviewFormDialog({ orderId, executorName }: ReviewFormDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    rating: 0,
    qualityRating: 0,
    punctualityRating: 0,
    valueRating: 0,
    politenessRating: 0,
  })
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function setRating(key: RatingKey, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }))
  }

  const allRated = Object.values(ratings).every((v) => v > 0)
  const canSubmit = allRated && text.trim().length > 0 && !isPending && !uploading

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (photos.length >= 5) {
      toast({ variant: 'destructive', title: 'Максимум 5 фотографий' })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (!json.success) {
        toast({ variant: 'destructive', title: 'Ошибка загрузки', description: json.error })
        return
      }
      setPhotos((prev) => [...prev, json.url])
    } finally {
      setUploading(false)
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    if (!canSubmit) return

    startTransition(async () => {
      const result = await createReview({
        orderId,
        ...ratings,
        text: text.trim(),
        photos,
      })

      if (result.success) {
        toast({ title: 'Отзыв отправлен', description: 'Спасибо за вашу оценку!' })
        setOpen(false)
        router.refresh()
      } else {
        toast({ variant: 'destructive', title: 'Ошибка', description: result.error })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Star className="mr-2 h-4 w-4" />
          Оставить отзыв
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Отзыв об исполнителе</DialogTitle>
          <DialogDescription>{executorName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Критерии оценки */}
          {CRITERIA.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <Label className="text-sm font-medium shrink-0">{label}</Label>
              <StarRatingInput
                value={ratings[key]}
                onChange={(v) => setRating(key, v)}
                disabled={isPending}
                size="sm"
              />
            </div>
          ))}

          {/* Текст отзыва */}
          <div className="space-y-2">
            <Label>Ваш отзыв</Label>
            <Textarea
              placeholder="Расскажите о вашем опыте работы с исполнителем..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isPending}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {text.length}/1000
            </p>
          </div>

          {/* Фото */}
          <div className="space-y-2">
            <Label>Фотографии (необязательно)</Label>
            <div className="flex gap-2 flex-wrap">
              {photos.map((url, i) => (
                <div key={i} className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                  <Image src={url} alt={`Фото ${i + 1}`} fill className="object-cover" sizes="64px" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || isPending}
                  className="h-16 w-16 rounded-md border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Кнопка отправки */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              'Отправить отзыв'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

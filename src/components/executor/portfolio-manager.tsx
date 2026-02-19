'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ImagePlus, Trash2, Loader2, Award, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  addPortfolioItem,
  deletePortfolioItem,
  addCertificate,
  deleteCertificate,
} from '@/actions/executor'
import type { Portfolio, Certificate } from '@/types'

interface PortfolioManagerProps {
  portfolio: Portfolio[]
  certificates: Certificate[]
}

export function PortfolioManager({ portfolio, certificates }: PortfolioManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // === Портфолио ===
  const portfolioInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)
  const [deletingPortfolioId, setDeletingPortfolioId] = useState<string | null>(null)

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const json = await res.json()
    if (!json.success) {
      toast({ variant: 'destructive', title: 'Ошибка загрузки', description: json.error })
      return null
    }
    return json.url as string
  }

  async function handlePortfolioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Сбрасываем input чтобы можно было загрузить тот же файл повторно
    e.target.value = ''

    if (portfolio.length >= 20) {
      toast({ variant: 'destructive', title: 'Лимит', description: 'Максимум 20 фотографий' })
      return
    }

    setUploadingPortfolio(true)
    try {
      const url = await uploadFile(file)
      if (!url) return

      const result = await addPortfolioItem(url)
      if (!result.success) {
        toast({ variant: 'destructive', title: 'Ошибка', description: result.error })
      } else {
        router.refresh()
      }
    } finally {
      setUploadingPortfolio(false)
    }
  }

  function handleDeletePortfolio(id: string) {
    setDeletingPortfolioId(id)
    startTransition(async () => {
      const result = await deletePortfolioItem(id)
      setDeletingPortfolioId(null)
      if (!result.success) {
        toast({ variant: 'destructive', title: 'Ошибка', description: result.error })
      } else {
        router.refresh()
      }
    })
  }

  // === Сертификаты ===
  const certInputRef = useRef<HTMLInputElement>(null)
  const [uploadingCert, setUploadingCert] = useState(false)
  const [certTitle, setCertTitle] = useState('')
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null)

  async function handleCertUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!certTitle.trim()) {
      toast({ variant: 'destructive', title: 'Введите название', description: 'Укажите название документа перед загрузкой' })
      return
    }

    setUploadingCert(true)
    try {
      const url = await uploadFile(file)
      if (!url) return

      const result = await addCertificate(url, certTitle.trim())
      if (!result.success) {
        toast({ variant: 'destructive', title: 'Ошибка', description: result.error })
      } else {
        setCertTitle('')
        router.refresh()
      }
    } finally {
      setUploadingCert(false)
    }
  }

  function handleDeleteCert(id: string) {
    setDeletingCertId(id)
    startTransition(async () => {
      const result = await deleteCertificate(id)
      setDeletingCertId(null)
      if (!result.success) {
        toast({ variant: 'destructive', title: 'Ошибка', description: result.error })
      } else {
        router.refresh()
      }
    })
  }

  const isLoading = isPending || uploadingPortfolio || uploadingCert

  return (
    <div className="space-y-8">
      {/* === Фотографии работ === */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Фотографии работ
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {portfolio.length}/20
              </span>
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading || portfolio.length >= 20}
              onClick={() => portfolioInputRef.current?.click()}
            >
              {uploadingPortfolio ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="mr-2 h-4 w-4" />
              )}
              Загрузить фото
            </Button>
            <input
              ref={portfolioInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePortfolioUpload}
            />
          </div>
        </CardHeader>
        <CardContent>
          {portfolio.length === 0 ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => portfolioInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-12 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">Нажмите чтобы загрузить первое фото</span>
              <span className="text-xs">JPG, PNG, WebP — до 5 МБ</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {portfolio.map((item) => (
                <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                  <Image
                    src={item.imageUrl}
                    alt={item.description ?? 'Фото работы'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      disabled={isLoading || deletingPortfolioId === item.id}
                      onClick={() => handleDeletePortfolio(item.id)}
                    >
                      {deletingPortfolioId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}

              {/* Кнопка добавить ещё */}
              {portfolio.length < 20 && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => portfolioInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingPortfolio ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="h-6 w-6 mb-1" />
                      <span className="text-xs">Добавить</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* === Сертификаты и документы === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4" />
            Сертификаты и дипломы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Форма добавления */}
          <div className="flex gap-2">
            <Input
              placeholder="Название документа (например: Диплом педагога)"
              value={certTitle}
              onChange={(e) => setCertTitle(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isLoading || !certTitle.trim()}
              onClick={() => certInputRef.current?.click()}
            >
              {uploadingCert ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="mr-2 h-4 w-4" />
              )}
              Загрузить
            </Button>
            <input
              ref={certInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleCertUpload}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Введите название и нажмите «Загрузить» чтобы добавить скан документа
          </p>

          {/* Список сертификатов */}
          {certificates.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="relative group rounded-lg border border-border overflow-hidden bg-muted"
                >
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={cert.imageUrl}
                      alt={cert.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-2 bg-card">
                    <p className="text-xs font-medium text-foreground truncate">{cert.title}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      disabled={isLoading || deletingCertId === cert.id}
                      onClick={() => handleDeleteCert(cert.id)}
                    >
                      {deletingCertId === cert.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {certificates.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Сертификаты ещё не добавлены
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

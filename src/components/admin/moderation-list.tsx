'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Eye, Clock, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { moderateProfile } from '@/actions/admin'
import { useToast } from '@/hooks/use-toast'

type Profile = {
  id: string
  description: string | null
  moderationStatus: string
  rejectionReason: string | null
  experienceYears: number
  district: string | null
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
    createdAt: Date
  }
  categories: { category: { name: string } }[]
  services: { id: string; name: string; isActive: boolean }[]
  _count: { reviews: number; orders: number }
}

const statusTabs = [
  { value: 'PENDING', label: 'На модерации', icon: Clock },
  { value: 'APPROVED', label: 'Одобрены', icon: CheckCircle },
  { value: 'REJECTED', label: 'Отклонены', icon: XCircle },
  { value: 'ALL', label: 'Все', icon: Eye },
]

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

export function ModerationList({ profiles, currentStatus }: { profiles: Profile[]; currentStatus: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleTabChange(status: string) {
    router.push(`/admin/moderation?status=${status}`)
  }

  function handleModerate(profileId: string, status: 'APPROVED' | 'REJECTED') {
    startTransition(async () => {
      try {
        await moderateProfile(profileId, status, status === 'REJECTED' ? rejectReason : undefined)
        toast({
          title: status === 'APPROVED' ? 'Профиль одобрен' : 'Профиль отклонён',
          description: status === 'APPROVED'
            ? 'Исполнитель уведомлён об одобрении'
            : 'Исполнитель уведомлён об отклонении',
        })
        setExpandedId(null)
        setRejectReason('')
        router.refresh()
      } catch (e) {
        toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' })
      }
    })
  }

  return (
    <div>
      {/* Табы статусов */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {statusTabs.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={currentStatus === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTabChange(value)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Нет профилей с данным статусом
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.user.avatarUrl || undefined} />
                      <AvatarFallback>{profile.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {profile.user.name}
                        <Badge className={statusColors[profile.moderationStatus] || ''} variant="secondary">
                          {profile.moderationStatus === 'PENDING' && 'На модерации'}
                          {profile.moderationStatus === 'APPROVED' && 'Одобрен'}
                          {profile.moderationStatus === 'REJECTED' && 'Отклонён'}
                        </Badge>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {profile.user.email} &middot; Опыт: {profile.experienceYears} лет
                        {profile.district && ` · ${profile.district}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/executor/${profile.user.id}`} target="_blank">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="h-4 w-4" />
                        Просмотр
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === profile.id ? null : profile.id)}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === profile.id ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedId === profile.id && (
                <CardContent className="pt-0 space-y-4">
                  {/* Описание */}
                  {profile.description && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Описание</p>
                      <p className="text-sm bg-muted/50 rounded-lg p-3">{profile.description}</p>
                    </div>
                  )}

                  {/* Категории и услуги */}
                  <div className="flex flex-wrap gap-4">
                    {profile.categories.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Категории</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.categories.map((c, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{c.category.name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.services.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Услуги ({profile.services.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.services.map((s) => (
                            <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Статистика */}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Заказов: {profile._count.orders}</span>
                    <span>Отзывов: {profile._count.reviews}</span>
                    <span>Регистрация: {new Date(profile.user.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>

                  {/* Причина отклонения (если была) */}
                  {profile.moderationStatus === 'REJECTED' && profile.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-red-800 mb-1">Причина отклонения</p>
                      <p className="text-sm text-red-700">{profile.rejectionReason}</p>
                    </div>
                  )}

                  {/* Кнопки действий */}
                  {profile.moderationStatus === 'PENDING' && (
                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleModerate(profile.id, 'APPROVED')}
                          disabled={isPending}
                          className="gap-2"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Одобрить
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            if (!rejectReason.trim()) {
                              toast({ title: 'Укажите причину отклонения', variant: 'destructive' })
                              return
                            }
                            handleModerate(profile.id, 'REJECTED')
                          }}
                          disabled={isPending}
                          className="gap-2"
                          size="sm"
                        >
                          <XCircle className="h-4 w-4" />
                          Отклонить
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Причина отклонения (обязательно при отклонении)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  )}

                  {/* Для уже обработанных — можно переназначить */}
                  {profile.moderationStatus !== 'PENDING' && (
                    <div className="flex gap-2 pt-2 border-t">
                      {profile.moderationStatus === 'REJECTED' && (
                        <Button
                          onClick={() => handleModerate(profile.id, 'APPROVED')}
                          disabled={isPending}
                          size="sm"
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Одобрить
                        </Button>
                      )}
                      {profile.moderationStatus === 'APPROVED' && (
                        <>
                          <Textarea
                            placeholder="Причина отклонения"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={2}
                            className="text-sm flex-1"
                          />
                          <Button
                            variant="destructive"
                            onClick={() => {
                              if (!rejectReason.trim()) {
                                toast({ title: 'Укажите причину отклонения', variant: 'destructive' })
                                return
                              }
                              handleModerate(profile.id, 'REJECTED')
                            }}
                            disabled={isPending}
                            size="sm"
                            className="gap-2 self-end"
                          >
                            <XCircle className="h-4 w-4" />
                            Отклонить
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

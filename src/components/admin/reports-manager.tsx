'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Star, CheckCircle, XCircle, AlertTriangle, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { moderateReview, resolveDispute } from '@/actions/admin'
import { useToast } from '@/hooks/use-toast'

type ReviewItem = {
  id: string
  rating: number
  text: string
  photos: string[]
  executorReply: string | null
  createdAt: Date
  client: { id: string; name: string; email: string }
  executor: { id: string; user: { name: string } }
  order: { id: string; description: string }
}

type DisputedOrder = {
  id: string
  description: string
  budget: number | null
  status: string
  createdAt: Date
  updatedAt: Date
  client: { id: string; name: string; email: string }
  executor: { id: string; user: { name: string; email: string } }
  service: { name: string } | null
}

export function ReportsManager({
  reviews,
  orders,
}: {
  reviews: ReviewItem[]
  orders: DisputedOrder[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Диалог разрешения спора
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false)
  const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null)
  const [disputeResolution, setDisputeResolution] = useState<'COMPLETED' | 'CANCELLED'>('COMPLETED')

  function handleModerateReview(reviewId: string, approve: boolean) {
    startTransition(async () => {
      try {
        await moderateReview(reviewId, approve)
        toast({ title: approve ? 'Отзыв одобрен' : 'Отзыв удалён' })
        router.refresh()
      } catch (e) {
        toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' })
      }
    })
  }

  function openDisputeDialog(orderId: string, resolution: 'COMPLETED' | 'CANCELLED') {
    setDisputeOrderId(orderId)
    setDisputeResolution(resolution)
    setDisputeDialogOpen(true)
  }

  function handleResolveDispute() {
    if (!disputeOrderId) return
    startTransition(async () => {
      try {
        await resolveDispute(disputeOrderId, disputeResolution)
        toast({ title: 'Спор разрешён' })
        setDisputeDialogOpen(false)
        router.refresh()
      } catch (e) {
        toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' })
      }
    })
  }

  return (
    <Tabs defaultValue="reviews">
      <TabsList className="mb-6">
        <TabsTrigger value="reviews" className="gap-2">
          <Star className="h-4 w-4" />
          Отзывы на модерации
          {reviews.length > 0 && (
            <Badge variant="destructive" className="ml-1 text-xs">{reviews.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="disputes" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          Споры
          {orders.length > 0 && (
            <Badge variant="destructive" className="ml-1 text-xs">{orders.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Отзывы на модерации */}
      <TabsContent value="reviews">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Нет отзывов на модерации
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium">
                        Отзыв от {review.client.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        на исполнителя {review.executor.user.name} · {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{review.text}</p>

                  {review.photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {review.photos.map((photo, i) => (
                        <Image
                          key={i}
                          src={photo}
                          alt={`Фото ${i + 1}`}
                          width={64}
                          height={64}
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {review.executorReply && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Ответ исполнителя
                      </p>
                      <p className="text-sm">{review.executorReply}</p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Заказ: {review.order.description.slice(0, 100)}...
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleModerateReview(review.id, true)}
                      disabled={isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Одобрить
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleModerateReview(review.id, false)}
                      disabled={isPending}
                    >
                      <XCircle className="h-4 w-4" />
                      Удалить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Споры по заказам */}
      <TabsContent value="disputes">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Нет активных споров
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Спор по заказу
                        {order.service && (
                          <Badge variant="outline" className="text-xs">{order.service.name}</Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Открыт: {new Date(order.updatedAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    {order.budget && (
                      <Badge variant="secondary">
                        {(order.budget / 100).toLocaleString('ru-RU')} ₽
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{order.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="font-medium text-blue-800 mb-1">Клиент</p>
                      <p>{order.client.name}</p>
                      <p className="text-muted-foreground">{order.client.email}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="font-medium text-green-800 mb-1">Исполнитель</p>
                      <p>{order.executor.user.name}</p>
                      <p className="text-muted-foreground">{order.executor.user.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => openDisputeDialog(order.id, 'COMPLETED')}
                      disabled={isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Завершить (в пользу исполнителя)
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => openDisputeDialog(order.id, 'CANCELLED')}
                      disabled={isPending}
                    >
                      <XCircle className="h-4 w-4" />
                      Отменить (в пользу клиента)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Подтверждение разрешения спора */}
      <AlertDialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Разрешить спор?</AlertDialogTitle>
            <AlertDialogDescription>
              {disputeResolution === 'COMPLETED'
                ? 'Заказ будет отмечен как выполненный. Обе стороны получат уведомление.'
                : 'Заказ будет отменён. Обе стороны получат уведомление.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResolveDispute}
              disabled={isPending}
              className={disputeResolution === 'CANCELLED' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  )
}

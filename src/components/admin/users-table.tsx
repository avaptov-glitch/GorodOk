'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Ban, CheckCircle, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { toggleUserActive, changeUserRole } from '@/actions/admin'
import { useToast } from '@/hooks/use-toast'

type UserItem = {
  id: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  role: string
  isActive: boolean
  createdAt: Date
  lastSeenAt: Date | null
  executorProfile: {
    id: string
    moderationStatus: string
    isPublished: boolean
    ratingAvg: number
    reviewsCount: number
  } | null
  _count: { orders: number; reviews: number; tasks: number }
}

const roleTabs = [
  { value: 'ALL', label: 'Все' },
  { value: 'CLIENT', label: 'Клиенты' },
  { value: 'EXECUTOR', label: 'Исполнители' },
  { value: 'ADMIN', label: 'Администраторы' },
]

const roleColors: Record<string, string> = {
  CLIENT: 'bg-blue-100 text-blue-800',
  EXECUTOR: 'bg-green-100 text-green-800',
  ADMIN: 'bg-violet-100 text-violet-800',
}

const roleLabels: Record<string, string> = {
  CLIENT: 'Клиент',
  EXECUTOR: 'Исполнитель',
  ADMIN: 'Админ',
}

export function UsersTable({
  users,
  total,
  page,
  totalPages,
  currentRole,
  currentSearch,
}: {
  users: UserItem[]
  total: number
  page: number
  totalPages: number
  currentRole: string
  currentSearch: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState(currentSearch)

  // Диалог блокировки
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [blockingUser, setBlockingUser] = useState<UserItem | null>(null)

  function navigate(params: { role?: string; search?: string; page?: number }) {
    const sp = new URLSearchParams()
    const role = params.role ?? currentRole
    const search = params.search ?? currentSearch
    const p = params.page ?? 1
    if (role !== 'ALL') sp.set('role', role)
    if (search) sp.set('search', search)
    if (p > 1) sp.set('page', p.toString())
    router.push(`/admin/users?${sp.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate({ search: searchQuery, page: 1 })
  }

  function handleToggleActive(user: UserItem) {
    setBlockingUser(user)
    setBlockDialogOpen(true)
  }

  function confirmToggleActive() {
    if (!blockingUser) return
    startTransition(async () => {
      try {
        const result = await toggleUserActive(blockingUser.id)
        toast({
          title: result.isActive ? 'Пользователь разблокирован' : 'Пользователь заблокирован',
        })
        setBlockDialogOpen(false)
        setBlockingUser(null)
        router.refresh()
      } catch (e) {
        toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' })
      }
    })
  }

  function handleRoleChange(userId: string, newRole: string) {
    startTransition(async () => {
      try {
        await changeUserRole(userId, newRole as 'CLIENT' | 'EXECUTOR' | 'ADMIN')
        toast({ title: 'Роль изменена' })
        router.refresh()
      } catch (e) {
        toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' })
      }
    })
  }

  return (
    <div>
      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {roleTabs.map(({ value, label }) => (
            <Button
              key={value}
              variant={currentRole === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate({ role: value, page: 1 })}
            >
              {label}
            </Button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <Input
            placeholder="Поиск по имени или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Button type="submit" size="sm" variant="outline" className="gap-1">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Найдено: {total} пользователей
      </p>

      {/* Таблица */}
      {users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Пользователи не найдены</div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Аватар и имя */}
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{user.name}</span>
                      <Badge className={roleColors[user.role] || ''} variant="secondary">
                        {roleLabels[user.role] || user.role}
                      </Badge>
                      {!user.isActive && (
                        <Badge variant="destructive" className="text-xs">Заблокирован</Badge>
                      )}
                      {user.executorProfile && (
                        <Badge variant="outline" className="text-[10px]">
                          Модерация: {user.executorProfile.moderationStatus === 'APPROVED' ? 'Одобрен' :
                            user.executorProfile.moderationStatus === 'REJECTED' ? 'Отклонён' : 'На проверке'}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {user.email}
                      {user.phone && ` · ${user.phone}`}
                      {' · '}Рег: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                      {user.executorProfile && (
                        <>
                          {' · '}Рейтинг: {user.executorProfile.ratingAvg.toFixed(1)} ({user.executorProfile.reviewsCount} отз.)
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Заказов: {user._count.orders} · Отзывов: {user._count.reviews} · Заданий: {user._count.tasks}
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="flex items-center gap-2 shrink-0">
                    {user.role !== 'ADMIN' && (
                      <Select
                        value={user.role}
                        onValueChange={(val) => handleRoleChange(user.id, val)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CLIENT">Клиент</SelectItem>
                          <SelectItem value="EXECUTOR">Исполнитель</SelectItem>
                          <SelectItem value="ADMIN">Админ</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {user.role === 'ADMIN' && (
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Защищён
                      </Badge>
                    )}
                    {user.role !== 'ADMIN' && (
                      <Button
                        variant={user.isActive ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleToggleActive(user)}
                        disabled={isPending}
                        className="gap-1"
                      >
                        {user.isActive ? (
                          <>
                            <Ban className="h-3.5 w-3.5" />
                            Блок
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            Разблок
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => navigate({ page: page - 1 })}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => navigate({ page: page + 1 })}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Подтверждение блокировки */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockingUser?.isActive ? 'Заблокировать пользователя?' : 'Разблокировать пользователя?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockingUser?.isActive
                ? `Пользователь "${blockingUser?.name}" не сможет войти в систему.`
                : `Пользователь "${blockingUser?.name}" снова сможет пользоваться платформой.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleActive}
              disabled={isPending}
              className={blockingUser?.isActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {blockingUser?.isActive ? 'Заблокировать' : 'Разблокировать'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

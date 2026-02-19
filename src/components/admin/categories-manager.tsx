'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, ChevronRight, FolderOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { createCategory, updateCategory, deleteCategory } from '@/actions/admin'
import { useToast } from '@/hooks/use-toast'

type SubCategory = {
  id: string
  name: string
  slug: string
  icon: string
  order: number
  _count: { executors: number; services: number }
}

type CategoryWithChildren = {
  id: string
  name: string
  slug: string
  icon: string
  order: number
  children: SubCategory[]
  _count: { executors: number; services: number }
}

type FormData = {
  name: string
  slug: string
  icon: string
  order: number
}

export function CategoriesManager({ categories }: { categories: CategoryWithChildren[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Диалог создания/редактирования
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({ name: '', slug: '', icon: 'Folder', order: 0 })

  // Диалог удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openCreate(parentCategoryId?: string) {
    setEditingId(null)
    setParentId(parentCategoryId || null)
    setForm({ name: '', slug: '', icon: 'Folder', order: 0 })
    setDialogOpen(true)
  }

  function openEdit(cat: { id: string; name: string; slug: string; icon: string; order: number }, isChild?: boolean) {
    setEditingId(cat.id)
    setParentId(isChild ? 'child' : null) // marker, не используется при edit
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, order: cat.order })
    setDialogOpen(true)
  }

  function handleSlugFromName(name: string) {
    const slug = name
      .toLowerCase()
      .replace(/[а-яё]/g, (ch) => {
        const map: Record<string, string> = {
          'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i',
          'й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t',
          'у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y',
          'ь':'','э':'e','ю':'yu','я':'ya',
        }
        return map[ch] || ch
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    return slug
  }

  function handleNameChange(name: string) {
    setForm(prev => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : handleSlugFromName(name),
    }))
  }

  function handleSave() {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: 'Заполните название и slug', variant: 'destructive' })
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateCategory(editingId, form)
          toast({ title: 'Категория обновлена' })
        } else {
          await createCategory({ ...form, parentId })
          toast({ title: 'Категория создана' })
        }
        setDialogOpen(false)
        router.refresh()
      } catch (e) {
        toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' })
      }
    })
  }

  function handleDelete() {
    if (!deletingId) return
    startTransition(async () => {
      try {
        await deleteCategory(deletingId)
        toast({ title: 'Категория удалена' })
        setDeleteDialogOpen(false)
        setDeletingId(null)
        router.refresh()
      } catch (e) {
        toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' })
      }
    })
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => openCreate()} className="gap-2">
          <Plus className="h-4 w-4" />
          Добавить категорию
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Категории не найдены</div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                  >
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === cat.id ? 'rotate-90' : ''}`}
                    />
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm font-medium">{cat.name}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">{cat.slug}</Badge>
                    <span className="text-xs text-muted-foreground">
                      icon: {cat.icon}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {cat._count.executors} исп. · {cat._count.services} усл.
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {cat.children.length} подкат.
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setDeletingId(cat.id); setDeleteDialogOpen(true) }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedId === cat.id && (
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="ml-8 space-y-2">
                    {cat.children.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{sub.name}</span>
                          <Badge variant="outline" className="text-[10px]">{sub.slug}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {sub._count.executors} исп. · {sub._count.services} усл.
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(sub, true)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setDeletingId(sub.id); setDeleteDialogOpen(true) }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 mt-2"
                      onClick={() => openCreate(cat.id)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Добавить подкатегорию
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Диалог создания / редактирования */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Редактировать категорию' : parentId ? 'Добавить подкатегорию' : 'Добавить категорию'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Название</Label>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Например: Репетиторы"
              />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="repetitory"
              />
            </div>
            <div>
              <Label>Иконка (Lucide)</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="GraduationCap"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Название иконки из библиотеки Lucide React
              </p>
            </div>
            <div>
              <Label>Порядок сортировки</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {editingId ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Подтверждение удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. Категория будет удалена из системы.
              Нельзя удалить категорию, у которой есть подкатегории или привязанные исполнители.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

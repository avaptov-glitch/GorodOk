import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap, Dumbbell, Hammer, Car, Monitor, Sparkles, Home,
  Scale, PartyPopper, PawPrint, BookOpen, Languages, Music, School,
  Leaf, Waves, Shield, Droplets, Zap, PaintBucket, Armchair, Wrench,
  Truck, Globe, Settings, Share2, Palette, Scissors, Hand, Heart,
  Smile, PackageOpen, TreePine, ChefHat, Calculator, Building,
  Camera, Video, Star, Mic, Stethoscope, Briefcase,
  type LucideProps,
} from 'lucide-react'
import { type ComponentType } from 'react'

export const metadata: Metadata = {
  title: 'Категории услуг',
  description:
    'Найдите нужного специалиста по категории — репетиторы, мастера, тренеры и сотни других профессионалов.',
}

// Маппинг имён иконок на компоненты Lucide
const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  GraduationCap, Dumbbell, Hammer, Car, Monitor, Sparkles, Home,
  Scale, PartyPopper, PawPrint, BookOpen, Languages, Music, School,
  Leaf, Waves, Shield, Droplets, Zap, PaintBucket, Armchair, Wrench,
  Truck, Globe, Settings, Share2, Palette, Scissors, Hand, Heart,
  Smile, PackageOpen, TreePine, ChefHat, Calculator, Building,
  Camera, Video, Star, Mic, Stethoscope,
}

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Briefcase
  return <Icon className={className} />
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    include: {
      children: {
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { executors: true } },
        },
      },
      _count: { select: { executors: true } },
    },
  })

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Все категории услуг</h1>
        <p className="text-muted-foreground">Выберите нужное направление и найдите специалиста</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            {/* Заголовок категории */}
            <Link
              href={`/category/${cat.slug}`}
              className="flex items-center gap-3 mb-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <CategoryIcon name={cat.icon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {cat._count.executors > 0
                    ? `${cat._count.executors} исполнителей`
                    : 'Нет исполнителей'}
                </span>
              </div>
            </Link>

            {/* Подкатегории */}
            {cat.children.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cat.children.map((sub) => (
                  <Link key={sub.id} href={`/category/${sub.slug}`}>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-sm py-1 px-3 font-normal"
                    >
                      {sub.name}
                      {sub._count.executors > 0 && (
                        <span className="ml-1.5 text-xs opacity-60">
                          {sub._count.executors}
                        </span>
                      )}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

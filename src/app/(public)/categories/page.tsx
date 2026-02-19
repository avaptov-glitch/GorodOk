import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
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
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Категории услуг',
  description:
    'Найдите нужного специалиста по категории — репетиторы, мастера, тренеры и сотни других профессионалов.',
}

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Категории услуг</h1>
        <p className="text-sm text-muted-foreground">Выберите направление и найдите специалиста</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
            {/* Заголовок категории */}
            <Link
              href={`/category/${cat.slug}`}
              className="flex items-center gap-2.5 mb-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <CategoryIcon name={cat.icon} className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {cat.name}
                </h2>
                {cat._count.executors > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {cat._count.executors} исполн.
                  </span>
                )}
              </div>
            </Link>

            {/* Подкатегории */}
            {cat.children.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pl-[46px]">
                {cat.children.map((sub) => (
                  <Link key={sub.id} href={`/category/${sub.slug}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer text-xs py-0.5 px-2 font-normal text-foreground/60 border-transparent hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-colors"
                    >
                      {sub.name}
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

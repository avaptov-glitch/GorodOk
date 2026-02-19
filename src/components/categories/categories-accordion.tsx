'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  GraduationCap, Dumbbell, Hammer, Car, Monitor, Sparkles, Home,
  Scale, PartyPopper, PawPrint, BookOpen, Languages, Music, School,
  Leaf, Waves, Shield, Droplets, Zap, PaintBucket, Armchair, Wrench,
  Truck, Globe, Settings, Share2, Palette, Scissors, Hand, Heart,
  Smile, PackageOpen, TreePine, ChefHat, Calculator, Building,
  Camera, Video, Star, Mic, Stethoscope, Briefcase, ChevronRight,
  type LucideProps,
} from 'lucide-react'
import { type ComponentType } from 'react'

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

type CategoryData = {
  id: string
  name: string
  slug: string
  icon: string
  _count: { executors: number }
  children: Array<{
    id: string
    name: string
    slug: string
    _count: { executors: number }
  }>
}

export function CategoriesSidebar({ categories }: { categories: CategoryData[] }) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? '')
  const active = categories.find((c) => c.id === activeId)

  return (
    <div className="flex border border-border rounded-lg bg-card overflow-hidden min-h-[480px]">
      {/* Left — category list */}
      <nav className="w-64 shrink-0 border-r border-border overflow-y-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onMouseEnter={() => setActiveId(cat.id)}
            onClick={() => setActiveId(cat.id)}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
              activeId === cat.id
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <CategoryIcon name={cat.icon} className="h-4 w-4 shrink-0" />
            <span className="truncate">{cat.name}</span>
          </button>
        ))}
      </nav>

      {/* Right — subcategories */}
      <div className="flex-1 p-6">
        {active && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-base text-foreground">{active.name}</h2>
              <Link
                href={`/category/${active.slug}`}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                Все исполнители
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {active.children.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.slug}`}
                  className="flex items-center justify-between py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">{sub.name}</span>
                  {sub._count.executors > 0 && (
                    <span className="text-xs opacity-40">{sub._count.executors}</span>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, X, ChevronRight } from 'lucide-react'
import {
    GraduationCap, Dumbbell, Hammer, Car, Monitor, Sparkles, Home,
    Scale, PartyPopper, PawPrint, BookOpen, Languages, Music, School,
    Leaf, Waves, Shield, Droplets, Zap, PaintBucket, Armchair, Wrench,
    Truck, Globe, Settings, Share2, Palette, Scissors, Hand, Heart,
    Smile, PackageOpen, TreePine, ChefHat, Calculator, Building,
    Camera, Video, Star, Mic, Stethoscope, Briefcase, type LucideProps,
} from 'lucide-react'
import { type ComponentType } from 'react'
import { Button } from '@/components/ui/button'

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
    GraduationCap, Dumbbell, Hammer, Car, Monitor, Sparkles, Home,
    Scale, PartyPopper, PawPrint, BookOpen, Languages, Music, School,
    Leaf, Waves, Shield, Droplets, Zap, PaintBucket, Armchair, Wrench,
    Truck, Globe, Settings, Share2, Palette, Scissors, Hand, Heart,
    Smile, PackageOpen, TreePine, ChefHat, Calculator, Building,
    Camera, Video, Star, Mic, Stethoscope,
}

function CategoryIcon({ name, className }: { name?: string; className?: string }) {
    const Icon = name ? (ICON_MAP[name] ?? Briefcase) : Briefcase
    return <Icon className={className} />
}

interface CategoryData { id: string; name: string; slug: string; icon?: string; children?: CategoryData[] }

export default function DrawerDesign({ categories }: { categories: CategoryData[] }) {
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const activeCategory = categories.find(c => c.id === activeCategoryId)

    const openDrawer = (id: string) => {
        setActiveCategoryId(id)
        setIsDrawerOpen(true)
        document.body.style.overflow = 'hidden' // Prevent background scrolling
    }

    const closeDrawer = () => {
        setIsDrawerOpen(false)
        document.body.style.overflow = '' // Restore background scrolling
        setTimeout(() => setActiveCategoryId(null), 300) // Clear after animation
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans relative">
            <div className="container mx-auto px-4 max-w-6xl py-12">
                <Link href="/designs/categories" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Назад к выбору дизайна
                </Link>

                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-[-0.03em] mb-4">
                        Каталог услуг
                    </h1>
                    <p className="text-xl text-slate-500 font-medium">
                        Выберите направление, чтобы увидеть список подкатегорий
                    </p>
                </div>

                {/* The Grid of Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => openDrawer(cat.id)}
                            className="bg-white rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center shadow-sm border border-slate-200/60 ring-1 ring-slate-900/5 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group aspect-square"
                        >
                            <div className="w-16 h-16 rounded-[1.25rem] bg-slate-50 text-slate-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-slate-100">
                                <CategoryIcon name={cat.icon} className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                                {cat.name}
                            </h3>
                        </button>
                    ))}
                </div>
            </div>

            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={closeDrawer}
            ></div>

            {/* Drawer (Side Sheet) */}
            <div
                className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-200/60 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            {activeCategory && <CategoryIcon name={activeCategory.icon} className="w-5 h-5" />}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{activeCategory?.name}</h2>
                    </div>
                    <button
                        onClick={closeDrawer}
                        className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                        Все направления
                    </div>
                    <div className="space-y-1">
                        {activeCategory?.children?.map((sub: CategoryData) => (
                            <Link
                                key={sub.id}
                                href={`/category/${sub.slug}`}
                                className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all"
                            >
                                <span className="font-semibold text-slate-700 group-hover:text-blue-700">{sub.name}</span>
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                </div>
                            </Link>
                        ))}

                        {(!activeCategory?.children || activeCategory.children.length === 0) && (
                            <div className="py-12 text-center text-slate-400">
                                Пусто
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200/60 bg-slate-50/50">
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 font-bold text-base shadow-lg hover:shadow-xl transition-all">
                        <Link href={`/category/${activeCategory?.slug}`}>
                            Перейти в раздел &laquo;{activeCategory?.name}&raquo;
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

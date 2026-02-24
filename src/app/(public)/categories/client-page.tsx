'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'
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

// Map categories to beautiful pastel colors for the icons
const COLOR_MAP: Record<number, string> = {
    0: 'bg-blue-50 text-blue-600 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white',
    1: 'bg-emerald-50 text-emerald-600 ring-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
    2: 'bg-purple-50 text-purple-600 ring-purple-100 group-hover:bg-purple-600 group-hover:text-white',
    3: 'bg-amber-50 text-amber-600 ring-amber-100 group-hover:bg-amber-500 group-hover:text-white',
    4: 'bg-rose-50 text-rose-600 ring-rose-100 group-hover:bg-rose-500 group-hover:text-white',
    5: 'bg-cyan-50 text-cyan-600 ring-cyan-100 group-hover:bg-cyan-600 group-hover:text-white',
    6: 'bg-indigo-50 text-indigo-600 ring-indigo-100 group-hover:bg-indigo-600 group-hover:text-white',
    7: 'bg-orange-50 text-orange-600 ring-orange-100 group-hover:bg-orange-500 group-hover:text-white',
    8: 'bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-100 group-hover:bg-fuchsia-600 group-hover:text-white',
    9: 'bg-teal-50 text-teal-600 ring-teal-100 group-hover:bg-teal-600 group-hover:text-white',
}

function CategoryIcon({ name, className }: { name?: string; className?: string }) {
    const Icon = name ? (ICON_MAP[name] ?? Briefcase) : Briefcase
    return <Icon className={className} />
}

interface CategoryData { id: string; name: string; slug: string; icon?: string; children?: CategoryData[]; _count?: { executors: number } }

export default function CategoriesClient({ categories }: { categories: CategoryData[] }) {
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const activeCategory = categories.find(c => c.id === activeCategoryId)

    const openDrawer = (id: string) => {
        setActiveCategoryId(id)
        setIsDrawerOpen(true)
        document.body.style.overflow = 'hidden'
    }

    const closeDrawer = () => {
        setIsDrawerOpen(false)
        document.body.style.overflow = ''
        setTimeout(() => setActiveCategoryId(null), 300)
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans relative overflow-x-hidden">

            {/* Hero Header Area */}
            <div className="relative bg-white border-b border-slate-200/60 pt-16 pb-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-400/10 via-indigo-300/5 to-transparent rounded-full blur-[80px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-400/5 via-teal-300/5 to-transparent rounded-full blur-[80px] -z-10 -translate-x-1/3 translate-y-1/3"></div>

                <div className="container mx-auto px-4 max-w-[1360px] relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-blue-100 shadow-sm">
                        <Sparkles className="w-4 h-4" /> Направления
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-[-0.03em] mb-4">
                        Что вам нужно <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">сделать?</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                        Выберите категорию из сетки ниже, чтобы увидеть доступные услуги и найти проверенного специалиста.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-[1360px] py-16">
                {/* The Grid of Buttons */}
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                    {categories.map((cat, index) => {
                        const colorClass = COLOR_MAP[index % 10]

                        return (
                            <button
                                key={cat.id}
                                onClick={() => openDrawer(cat.id)}
                                className="bg-white rounded-[2rem] p-6 lg:p-8 flex flex-col items-center justify-center text-center shadow-sm border border-slate-200/60 ring-1 ring-slate-900/5 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)] transition-all duration-400 ease-out group aspect-square relative overflow-hidden"
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-transparent group-hover:bg-blue-500 transition-colors duration-400"></div>

                                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-6 transition-all duration-400 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:rotate-3 ${colorClass}`}>
                                    <CategoryIcon name={cat.icon ?? 'Briefcase'} className="w-10 h-10" />
                                </div>

                                <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-blue-700 transition-colors tracking-tight">
                                    {cat.name}
                                </h3>

                                {(cat._count?.executors ?? 0) > 0 && (
                                    <div className="mt-3 text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        {cat._count?.executors} спецов
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-400 ease-out ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={closeDrawer}
            ></div>

            {/* Drawer (Side Sheet) */}
            <div
                className={`fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-[0_0_80px_rgba(0,0,0,0.2)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[1.25rem] bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100 shadow-sm">
                            {activeCategory && <CategoryIcon name={activeCategory.icon ?? 'Briefcase'} className="w-7 h-7" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{activeCategory?.name}</h2>
                            <p className="text-sm font-medium text-slate-500">{activeCategory?.children?.length || 0} направлений</p>
                        </div>
                    </div>
                    <button
                        onClick={closeDrawer}
                        className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors shadow-sm"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F8FAFC]">
                    <div className="space-y-3">
                        {activeCategory?.children?.map((sub: CategoryData) => (
                            <Link
                                key={sub.id}
                                href={`/category/${sub.slug}`}
                                onClick={closeDrawer}
                                className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-200 ring-1 ring-slate-900/5 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between z-10">
                                    <span className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">{sub.name}</span>
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400 ease-out group-hover:bg-blue-50">
                                        <ArrowRight className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                                {(sub._count?.executors ?? 0) > 0 && (
                                    <span className="text-sm font-semibold text-slate-400 mt-1 z-10">
                                        {sub._count?.executors} специалистов
                                    </span>
                                )}
                                {/* Hover Background Effect */}
                                <div className="absolute inset-0 bg-blue-50/50 scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-300 z-0"></div>
                            </Link>
                        ))}

                        {(!activeCategory?.children || activeCategory.children.length === 0) && (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                    <Briefcase className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Пока ничего нет</h3>
                                <p className="text-slate-500 font-medium">В этой категории скоро появятся новые направления услуг.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 sm:p-8 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10">
                    <Button asChild className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-[1.25rem] h-14 font-bold text-lg shadow-[0_8px_30px_rgba(15,23,42,0.15)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.25)] transition-all duration-400">
                        <Link href={`/category/${activeCategory?.slug}`} onClick={closeDrawer}>
                            Смотреть всех профи в разделе
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import {
    GraduationCap, Dumbbell, Hammer, Car, Monitor, Sparkles, Home,
    Scale, PartyPopper, PawPrint, BookOpen, Languages, Music, School,
    Leaf, Waves, Shield, Droplets, Zap, PaintBucket, Armchair, Wrench,
    Truck, Globe, Settings, Share2, Palette, Scissors, Hand, Heart,
    Smile, PackageOpen, TreePine, ChefHat, Calculator, Building,
    Camera, Video, Star, Mic, Stethoscope, Briefcase, type LucideProps,
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

function CategoryIcon({ name, className }: { name?: string; className?: string }) {
    const Icon = name ? (ICON_MAP[name] ?? Briefcase) : Briefcase
    return <Icon className={className} />
}

interface CategoryData { id: string; name: string; slug: string; icon?: string; children?: CategoryData[] }

export default function SidebarDesign({ categories }: { categories: CategoryData[] }) {
    const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || '')

    const activeCategory = categories.find(c => c.id === activeCategoryId)

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="container mx-auto px-4 max-w-6xl py-8">
                <Link href="/designs/categories" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Назад
                </Link>
                <h1 className="text-3xl font-bold text-slate-900 mb-8">
                    Все категории <span className="text-slate-400 font-medium text-xl ml-2">(Боковое меню)</span>
                </h1>

                <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden ring-1 ring-slate-900/5 flex min-h-[700px]">
                    {/* Sidebar */}
                    <div className="w-[320px] bg-slate-50/50 border-r border-slate-200/60 py-4 hidden md:block shrink-0">
                        <div className="px-4 mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Направления</span>
                        </div>
                        <div className="space-y-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategoryId(cat.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors relative ${activeCategoryId === cat.id ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-900/5 z-10' : 'text-slate-600 hover:bg-slate-100/50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CategoryIcon name={cat.icon} className={`w-5 h-5 ${activeCategoryId === cat.id ? 'text-blue-500' : 'text-slate-400'}`} />
                                        <span className="font-semibold text-sm">{cat.name}</span>
                                    </div>
                                    {activeCategoryId === cat.id && <ChevronRight className="w-4 h-4 text-blue-500" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-8 sm:p-12 bg-white">
                        {activeCategory ? (
                            <div className="max-w-3xl animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-both">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100">
                                        <CategoryIcon name={activeCategory.icon} className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{activeCategory.name}</h2>
                                        <p className="text-slate-500 font-medium">{activeCategory.children?.length || 0} подкатегорий</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                                    {activeCategory.children?.map((sub: CategoryData) => (
                                        <Link key={sub.id} href={`/category/${sub.slug}`} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/60">
                                            <div className="w-2 h-2 rounded-full bg-blue-100 group-hover:bg-blue-500 transition-colors"></div>
                                            <span className="text-slate-700 font-medium text-sm group-hover:text-blue-700 transition-colors">{sub.name}</span>
                                        </Link>
                                    ))}
                                    {(!activeCategory.children || activeCategory.children.length === 0) && (
                                        <div className="col-span-full py-12 text-center text-slate-400">
                                            В этой категории пока нет подкатегорий
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Выберите категорию слева
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

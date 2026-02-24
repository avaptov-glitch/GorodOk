'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
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

export default function HoverDesign({ categories }: { categories: CategoryData[] }) {
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            <div className="container mx-auto px-4 max-w-7xl py-12">
                <Link href="/designs/categories" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Назад к обзору концептов
                </Link>

                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-[-0.03em] mb-4">
                        Каталог
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 ml-3">
                            ГородОк
                        </span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium">
                        Наведите курсор на карточку, чтобы увидеть популярные подкатегории.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((cat, index) => {
                        const hue = index * 40 + 200
                        const colorClass = `hsl(${hue}, 70%, 50%)`
                        const bgLight = `hsl(${hue}, 80%, 96%)`

                        return (
                            <div
                                key={cat.id}
                                className="relative bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60 h-[240px] overflow-hidden group perspective-1000"
                            >
                                {/* Default State (Front of card) */}
                                <div className="absolute inset-x-6 top-6 bottom-6 flex flex-col justify-between transition-all duration-500 ease-out z-10 group-hover:-translate-y-4 group-hover:opacity-0 group-hover:blur-sm">
                                    <div
                                        className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center border border-white/50 shadow-sm"
                                        style={{ backgroundColor: bgLight, color: colorClass }}
                                    >
                                        <CategoryIcon name={cat.icon} className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{cat.name}</h2>
                                        <p className="text-sm font-semibold text-slate-400 mt-1">{cat.children?.length || 0} направлений</p>
                                    </div>
                                </div>

                                {/* Hover Reveal State */}
                                <div className="absolute inset-0 bg-slate-900 p-6 flex flex-col opacity-0 translate-y-8 blur-md group-hover:opacity-100 group-hover:translate-y-0 group-hover:blur-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-20 rounded-[2rem]">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <CategoryIcon name={cat.icon} className="w-4 h-4 text-blue-400" />
                                        {cat.name}
                                    </h3>

                                    <ul className="space-y-2 mb-auto flex-1 overflow-hidden relative">
                                        {cat.children?.map((sub: CategoryData) => (
                                            <li key={sub.id}>
                                                <Link
                                                    href={`/category/${sub.slug}`}
                                                    className="text-slate-300 hover:text-white text-sm font-medium transition-colors block truncate"
                                                >
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                        {/* Fade out bottom text if too many items */}
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
                                    </ul>

                                    <Button asChild variant="secondary" className="w-full mt-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 border-none rounded-xl h-10 font-bold backdrop-blur-sm transition-all duration-300">
                                        <Link href={`/category/${cat.slug}`}>
                                            Смотреть все <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    ChevronDown, ArrowLeft, GraduationCap, Dumbbell, Hammer, Car, Monitor, Sparkles, Home,
    Scale, PartyPopper, PawPrint, BookOpen, Languages, Music, School,
    Leaf, Waves, Shield, Droplets, Zap, PaintBucket, Armchair, Wrench,
    Truck, Globe, Settings, Share2, Palette, Scissors, Hand, Heart,
    Smile, PackageOpen, TreePine, ChefHat, Calculator, Building,
    Camera, Video, Star, Mic, Stethoscope, Briefcase, type LucideProps,
} from 'lucide-react'
import { type ComponentType } from 'react'

// Добавим Server Action для получения категорий, так как клиентские компоненты не могут напрямую юзать prisma
// Но для прототипа обойдемся fetch или useEffect с загрузкой списка. Так как это 'use client'.
// В реальном приложении лучше передавать категории через props из серверного page.tsx.

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

export default function AccordionDesign({ categories }: { categories: CategoryData[] }) {
    const [openId, setOpenId] = useState<string | null>(null)

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="container mx-auto px-4 max-w-3xl py-12">
                <Link href="/designs/categories" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> К списку вариантов
                </Link>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-8">
                    Категории услуг <span className="text-slate-400 font-medium text-2xl ml-2">(Вариант 1)</span>
                </h1>

                <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden ring-1 ring-slate-900/5">
                    {categories.map((cat) => (
                        <div key={cat.id} className={`border-b border-slate-100 last:border-0`}>
                            <button
                                onClick={() => setOpenId(openId === cat.id ? null : cat.id)}
                                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors`}>
                                        <CategoryIcon name={cat.icon} className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{cat.name}</h2>
                                        <p className="text-sm font-medium text-slate-500">{cat.children?.length || 0} направлений</p>
                                    </div>
                                </div>
                                <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-transform duration-300 ${openId === cat.id ? 'rotate-180 bg-blue-50 text-blue-600' : 'text-slate-400'}`}>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </button>

                            {/* Accordion Content */}
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openId === cat.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="p-6 pt-0 pl-[5.5rem] bg-slate-50/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                        {cat.children?.map((sub: CategoryData) => (
                                            <Link key={sub.id} href={`/category/${sub.slug}`} className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors py-1 flex items-center justify-between group/link">
                                                <span>{sub.name}</span>
                                                <span className="text-slate-300 group-hover/link:text-blue-300 text-xs">→</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

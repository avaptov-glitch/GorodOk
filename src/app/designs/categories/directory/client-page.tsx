'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface CategoryData { id: string; name: string; slug: string; children?: CategoryData[] }

export default function DirectoryDesign({ categories }: { categories: CategoryData[] }) {
    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="container mx-auto px-4 max-w-7xl py-12 sm:py-20">
                <Link href="/designs/categories" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 mb-12 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Назад к выбору
                </Link>

                <header className="mb-20 max-w-3xl">
                    <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-[-0.04em] mb-6 leading-[1.1]">
                        Все услуги
                    </h1>
                    <p className="text-2xl text-slate-500 font-medium tracking-tight">
                        Выберите направление из нашего каталога.
                    </p>
                </header>

                {/* Directory Columns */}
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-x-12 gap-y-16 space-y-16">
                    {categories.map((cat) => (
                        <div key={cat.id} className="break-inside-avoid shadow-none border-none bg-transparent">
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight flex items-baseline gap-2 group cursor-pointer inline-flex">
                                <Link href={`/category/${cat.slug}`} className="hover:text-blue-600 transition-colors">
                                    {cat.name}
                                </Link>
                            </h2>

                            <ul className="space-y-3">
                                {cat.children?.map((sub: CategoryData) => (
                                    <li key={sub.id}>
                                        <Link
                                            href={`/category/${sub.slug}`}
                                            className="text-base font-medium text-slate-500 hover:text-blue-600 transition-colors inline-block"
                                        >
                                            {sub.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

import Link from 'next/link'
import { ArrowLeft, LayoutTemplate, Columns, Grid, AlignLeft, Layers } from 'lucide-react'

export default function CategoriesDesignsIndex() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 sm:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Вернуться на главную
                </Link>

                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Дизайн-концепты: Страница категорий
                </h1>
                <p className="text-lg text-slate-500 mb-10 max-w-2xl font-medium">
                    5 различных подходов к отображению большого списка категорий и подкатегорий,
                    разработанных для снижения визуальной нагрузки.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DesignCard
                        title="1. Аккордеон"
                        desc="Минималистичный вертикальный список. Подкатегории раскрываются по клику."
                        href="/designs/categories/accordion"
                        icon={<AlignLeft className="w-6 h-6" />}
                        color="blue"
                    />
                    <DesignCard
                        title="2. Боковое меню (Split-View)"
                        desc="Главные категории слева, подкатегории подгружаются в правой части экрана."
                        href="/designs/categories/sidebar"
                        icon={<Columns className="w-6 h-6" />}
                        color="emerald"
                    />
                    <DesignCard
                        title="3. Сетка + Шторка (Drawer)"
                        desc="Только иконки на главном экране. Подкатегории выезжают сбоку (шторка)."
                        href="/designs/categories/drawer"
                        icon={<LayoutTemplate className="w-6 h-6" />}
                        color="purple"
                    />
                    <DesignCard
                        title="4. Типографический справочник"
                        desc="Строгий журнальный стиль. Максимум текста, минимум карточек и рамок."
                        href="/designs/categories/directory"
                        icon={<Grid className="w-6 h-6" />}
                        color="amber"
                    />
                    <DesignCard
                        title="5. Скрытые (Hover-Reveal)"
                        desc="Идеально ровная сетка. Подкатегории появляются только при наведении мыши."
                        href="/designs/categories/hover"
                        icon={<Layers className="w-6 h-6" />}
                        color="rose"
                    />
                </div>
            </div>
        </div>
    )
}

function DesignCard({ title, desc, href, icon, color }: { title: string, desc: string, href: string, icon: React.ReactNode, color: string }) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white',
        emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
        purple: 'bg-purple-50 text-purple-600 ring-purple-100 group-hover:bg-purple-600 group-hover:text-white',
        amber: 'bg-amber-50 text-amber-600 ring-amber-100 group-hover:bg-amber-500 group-hover:text-white',
        rose: 'bg-rose-50 text-rose-600 ring-rose-100 group-hover:bg-rose-500 group-hover:text-white',
    }

    return (
        <Link href={href} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60 ring-1 ring-slate-900/5 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 transition-all duration-300 group flex flex-col cursor-pointer">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ring-1 transition-colors duration-300 ${colorMap[color]}`}>
                {icon}
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-2 leading-tight tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
        </Link>
    )
}

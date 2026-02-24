import Link from 'next/link'

export default function DesignsIndex() {
    return (
        <div className="min-h-screen bg-slate-50 p-10 font-sans">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-3xl font-bold mb-6 text-slate-900">Варианты дизайна главной</h1>
                <p className="text-slate-500 mb-8">Выберите один из вариантов ниже, чтобы посмотреть его вживую.</p>

                <div className="flex flex-col gap-4">
                    <Link href="/designs/bento" className="block p-4 rounded-xl border-2 border-primary/20 bg-primary/5 hover:border-primary hover:bg-primary/10 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black uppercase px-2 py-1 rounded-bl-xl">New!</div>
                        <h2 className="font-bold text-lg text-primary">⭐ 6. Creative Bento Box (Мой фаворит)</h2>
                        <p className="text-slate-600 text-sm mt-1">Трендовый плиточный &laquo;Bento&raquo; дизайн (как виджеты в iOS). Очень сочный, современный, с градиентами и тенями.</p>
                    </Link>

                    <Link href="/designs/minimal" className="block p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all">
                        <h2 className="font-bold text-lg text-slate-800">1. Minimal Search-First</h2>
                        <p className="text-slate-500 text-sm mt-1">Минималистичный дизайн. Строка поиска по центру, ничего лишнего.</p>
                    </Link>

                    <Link href="/designs/dashboard" className="block p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all">
                        <h2 className="font-bold text-lg text-slate-800">2. App Dashboard</h2>
                        <p className="text-slate-500 text-sm mt-1">Внешний вид веб-приложения, боковое меню и онлайн-лента исполнителей.</p>
                    </Link>

                    <Link href="/designs/dark" className="block p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all">
                        <h2 className="font-bold text-lg text-slate-800">3. Premium Dark Mode</h2>
                        <p className="text-slate-500 text-sm mt-1">Темная тема, акцент на элитных и проверенных специалистов.</p>
                    </Link>

                    <Link href="/designs/local" className="block p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all">
                        <h2 className="font-bold text-lg text-slate-800">4. Local Community</h2>
                        <p className="text-slate-500 text-sm mt-1">Теплый дизайн с акцентом на локальность — &laquo;ваши соседи по Вологде&raquo;.</p>
                    </Link>

                    <Link href="/designs/catalog" className="block p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all">
                        <h2 className="font-bold text-lg text-slate-800">5. E-commerce Catalog</h2>
                        <p className="text-slate-500 text-sm mt-1">Стиль классического маркетплейса (как Ozon), развернутый каталог всех услуг.</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}

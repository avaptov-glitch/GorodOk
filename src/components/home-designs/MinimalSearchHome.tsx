import { Search, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'

export default function MinimalSearchHome() {
    return (
        <div className="flex flex-col min-h-screen bg-white selection:bg-blue-100">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center py-32 px-4 relative overflow-hidden">
                {/* Subtle background blurs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl -z-10 opacity-60"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-60"></div>

                <div className="text-center mb-8 inline-flex items-center gap-2 bg-neutral-100/80 backdrop-blur-sm text-neutral-800 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm border border-neutral-200/50">
                    <Zap className="w-4 h-4 text-blue-600 fill-blue-600" /> ГородОк — поиск за секунды
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 text-center leading-[1.1]">
                    Найти мастера.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Просто как раз, два.</span>
                </h1>
                <p className="text-xl text-slate-500 mb-12 text-center max-w-lg font-medium">
                    Тысячи проверенных специалистов в Вологде для любой вашей задачи.
                </p>

                <form className="w-full max-w-3xl flex relative shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] rounded-[2rem] overflow-hidden border border-slate-200/80 bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-300 group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 group-focus-within:scale-110 transition-transform">
                        <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <Input
                        className="w-full h-20 sm:h-24 pl-[4.5rem] pr-[160px] text-xl border-0 bg-transparent focus-visible:ring-0 placeholder:text-slate-400 font-medium"
                        placeholder="Что нужно сделать?"
                    />
                    <Button className="absolute right-3 top-3 bottom-3 h-auto px-10 rounded-2xl text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-transform hover:scale-105 active:scale-95">
                        Найти
                    </Button>
                </form>

                <div className="mt-14 flex flex-col items-center">
                    <p className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Часто ищут</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {['Ремонт', 'Уборка', 'Репетиторы', 'Красота', 'IT-специалисты'].map(tag => (
                            <Link key={tag} href="#" className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 text-sm font-bold bg-white shadow-sm hover:-translate-y-1 hover:shadow-md">
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-20 flex items-center gap-8 text-slate-400">
                    <div className="flex items-center gap-2 font-medium">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Средняя оценка 4.9
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <div className="flex items-center gap-2 font-medium">
                        10,000+ успешных заказов
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

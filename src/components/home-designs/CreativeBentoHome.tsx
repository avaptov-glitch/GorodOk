import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Search, Zap, Shield, Wrench, Paintbrush, BookOpen, Truck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CreativeBentoHome() {
    return (
        <div className="flex flex-col min-h-screen bg-neutral-100 font-sans">
            <Header />
            <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    <div className="mb-12 text-center sm:text-left sm:flex sm:items-end sm:justify-between relative z-10">
                        <div className="relative">
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-400/20 blur-3xl rounded-full"></div>
                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-neutral-900 tracking-tight leading-[1.1] relative">
                                Мастера.<br className="hidden sm:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
                                    Без заморочек.
                                </span>
                            </h1>
                            <p className="mt-5 text-lg sm:text-xl text-neutral-600 max-w-lg font-medium">
                                Современный подход к поиску исполнителей. Прямой контакт, честные отзывы, никаких скрытых комиссий.
                            </p>
                        </div>

                        <div className="hidden sm:flex items-center gap-3">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-12 h-12 rounded-full border-4 border-neutral-100 flex items-center justify-center font-bold text-white z-${5 - i} shadow-sm`} style={{ backgroundColor: `hsl(${i * 40 + 200}, 70%, 50%)` }}>
                                        {['А', 'М', 'К', 'С'][i - 1]}
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm font-medium text-neutral-500">
                                <strong className="text-neutral-900 block text-base">5,000+</strong>
                                мастеров онлайн
                            </div>
                        </div>
                    </div>

                    {/* BENTO GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 auto-rows-[180px] relative z-10">

                        {/* 1. Main Search (Spans 2 cols, 2 rows) */}
                        <div className="md:col-span-2 md:row-span-2 bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-neutral-200/50 relative overflow-hidden flex flex-col justify-between group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-100/80 via-indigo-50/50 to-transparent rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3 opacity-80 group-hover:scale-110 transition-transform duration-700"></div>

                            <div>
                                <div className="inline-flex items-center gap-2 bg-neutral-100/80 backdrop-blur-sm text-neutral-800 px-4 py-2 rounded-2xl text-sm font-bold mb-8 shadow-sm border border-neutral-200/50">
                                    <Zap className="w-4 h-4 text-blue-600 fill-blue-600" /> Молниеносный поиск
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-3 tracking-tight">Что случилось?</h2>
                                <p className="text-neutral-500 mb-8 max-w-sm text-base leading-relaxed">Опишите задачу своими словами. Наш умный алгоритм сам подберет нужных специалистов рядом с вами.</p>
                            </div>

                            <form className="relative flex shadow-md hover:shadow-lg rounded-[1.25rem] overflow-hidden ring-1 ring-neutral-200/80 bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-300">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
                                <input type="text" placeholder="Например: потёк кран на кухне..." className="w-full h-16 sm:h-20 bg-transparent border-0 pl-16 pr-[140px] outline-none font-medium text-lg placeholder:text-neutral-400" />
                                <Button className="absolute right-2 top-2 bottom-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-8 font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 text-base h-auto">
                                    Найти
                                </Button>
                            </form>
                        </div>

                        {/* 2. Top Rated Category 1 (1 col, 1 row) */}
                        <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-red-500 rounded-[2rem] p-6 shadow-lg shadow-orange-500/20 text-white flex flex-col justify-between cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 relative overflow-hidden group/card border border-white/10">
                            <div className="absolute inset-0 bg-white/0 group-hover/card:bg-white/10 transition-colors duration-300"></div>
                            <Wrench className="w-10 h-10 opacity-90 mb-2 drop-shadow-sm group-hover/card:scale-110 transition-transform duration-500 origin-bottom-left" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black leading-tight tracking-tight">Ремонт<br />и стройка</h3>
                            </div>
                            <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 -translate-x-4 group-hover/card:translate-x-0 transition-all duration-300">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        {/* 3. Stats / Trust (1 col, 1 row) */}
                        <div className="bg-neutral-900 rounded-[2rem] p-6 shadow-xl text-white flex flex-col justify-center items-center text-center relative overflow-hidden group/trust border border-neutral-800">
                            <Shield className="w-10 h-10 text-emerald-400 fill-emerald-400/20 mb-3 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)] group-hover/trust:scale-110 transition-transform duration-500" />
                            <div className="text-4xl font-black tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400">100%</div>
                            <div className="text-neutral-400 text-sm font-semibold tracking-wide uppercase">Верифицированы</div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay"></div>
                            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-emerald-500/10 blur-[50px] rounded-full group-hover/trust:bg-emerald-500/20 transition-colors duration-500"></div>
                        </div>

                        {/* 4. Top Rated Category 2 (1 col, 1 row) */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60 flex flex-col justify-between cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(59,130,246,0.12)] hover:border-blue-200 transition-all duration-300 group/cat">
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2 group-hover/cat:bg-blue-600 group-hover/cat:text-white transition-colors duration-300">
                                    <Truck className="w-7 h-7" />
                                </div>
                                <div className="bg-neutral-100 text-neutral-500 text-xs font-bold px-3 py-1 rounded-full group-hover/cat:bg-blue-50 group-hover/cat:text-blue-600 transition-colors">ХИТ</div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Грузоперевозки</h3>
                                <p className="text-sm text-neutral-500 font-medium mt-1">От 500 ₽/час</p>
                            </div>
                        </div>

                        {/* 5. Create Task CTA (1 col, 1 row) */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-100/50 rounded-[2rem] p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between border border-emerald-200/50 hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300 group">
                            <div>
                                <h3 className="font-bold text-emerald-950 text-xl tracking-tight mb-1">Сложная задача?</h3>
                                <p className="text-emerald-800/80 text-sm leading-snug">Создайте задание, и мастера сами предложат цены и сроки.</p>
                            </div>
                            <Button variant="outline" className="w-full bg-white hover:bg-emerald-600 hover:text-white text-emerald-800 border-none shadow-sm rounded-xl font-bold h-12 transition-all duration-300 mt-4 group-hover:scale-[1.02]">
                                Создать задание
                            </Button>
                        </div>

                        {/* 6. Popular Categories Scrolling/List (Spans 2 cols, 1 row) */}
                        <div className="md:col-span-2 bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Часто ищут сейчас</h3>
                                <Link href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-full transition-colors">Все услуги</Link>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-4 -mb-4 scrollbar-hide snap-x pt-1">
                                {[
                                    { name: 'Уборка', icon: <Paintbrush className="w-4 h-4" />, color: 'bg-indigo-50 text-indigo-700 ring-indigo-200/50 hover:bg-indigo-600 hover:text-white', shadow: 'hover:shadow-indigo-500/20' },
                                    { name: 'Электрик', icon: <Zap className="w-4 h-4" />, color: 'bg-amber-50 text-amber-700 ring-amber-200/50 hover:bg-amber-500 hover:text-white', shadow: 'hover:shadow-amber-500/20' },
                                    { name: 'Репетитор', icon: <BookOpen className="w-4 h-4" />, color: 'bg-rose-50 text-rose-700 ring-rose-200/50 hover:bg-rose-500 hover:text-white', shadow: 'hover:shadow-rose-500/20' },
                                    { name: 'Сантехник', icon: <Wrench className="w-4 h-4" />, color: 'bg-cyan-50 text-cyan-700 ring-cyan-200/50 hover:bg-cyan-500 hover:text-white', shadow: 'hover:shadow-cyan-500/20' },
                                ].map((c, i) => (
                                    <div key={i} className={`shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm ring-1 cursor-pointer transition-all duration-300 snap-start shadow-sm hover:-translate-y-1 ${c.color} ${c.shadow}`}>
                                        {c.icon} {c.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    )
}

import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { MapPin, Users, Heart, Search } from 'lucide-react'

export default function LocalCommunityHome() {
    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc]">
            <Header />
            <main className="flex-1">

                {/* HERO SECTION - LOCAL VIBE */}
                <section className="bg-emerald-600 px-4 py-20 lg:py-28 text-white rounded-b-[3rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none scale-150 origin-top-right">
                        <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z" /><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /></svg>
                    </div>

                    <div className="container mx-auto max-w-4xl text-center relative z-10">
                        <div className="inline-flex items-center gap-2 bg-emerald-700/50 backdrop-blur-md border border-emerald-500/30 rounded-full px-5 py-2 mb-8">
                            <MapPin className="w-5 h-5 text-emerald-300" />
                            <span className="text-sm font-semibold tracking-wide">Ваши соседи уже здесь</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-8 leading-tight drop-shadow-sm">
                            Свои люди для <br />любых задач в Вологде
                        </h1>

                        <p className="text-lg md:text-2xl opacity-90 mb-12 max-w-2xl mx-auto font-medium">
                            Поддержите местных мастеров. Найдите проверенных специалистов из вашего района.
                        </p>

                        <div className="bg-white p-2 sm:p-3 rounded-3xl sm:rounded-full flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto shadow-2xl ring-4 ring-emerald-500/20">
                            <div className="flex-1 flex items-center px-4 relative">
                                <Search className="text-slate-400 w-6 h-6 absolute left-6" />
                                <input
                                    type="text"
                                    placeholder="Что будем чинить или созидать?"
                                    className="w-full h-full min-h-[50px] pl-12 pr-4 rounded-full text-slate-900 border-none outline-none font-medium text-lg placeholder:text-slate-400"
                                />
                            </div>
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl sm:rounded-full h-14 sm:h-auto sm:py-4 px-10 text-lg font-bold shadow-md">
                                Найти земляка
                            </Button>
                        </div>
                    </div>
                </section>

                {/* FEATURES & CARDS */}
                <section className="py-24 container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                        <div className="space-y-8">
                            <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">Помогаем городу<br />стать ближе</h2>
                            <p className="text-slate-600 text-xl leading-relaxed">
                                ГородОк объединяет тех, кому нужна помощь, и тех, кто готов её оказать качественно, быстро и с душой. Настоящие отзывы от реальных горожан.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    { icon: <Users className="w-6 h-6" />, text: 'Более 5,000 мастеров с подтверждённой личностью', color: 'bg-blue-100 text-blue-600' },
                                    { icon: <Heart className="w-6 h-6" />, text: 'Честные отзывы от ваших соседей и знакомых', color: 'bg-rose-100 text-rose-600' },
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-5 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 hover:border-emerald-300 transition-colors">
                                        <div className={`p-4 rounded-xl ${item.color}`}>{item.icon}</div>
                                        <span className="font-semibold text-lg text-slate-800">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:gap-6 relative">
                            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl -z-10 rounded-full"></div>
                            {['Электрика', 'Уборка', 'Няни', 'Ремонт авто'].map((t, i) => (
                                <div key={i} className={`bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center font-bold text-xl text-slate-800 h-48 cursor-pointer hover:-translate-y-2 transition-transform duration-300 hover:text-emerald-600
                 ${i === 1 || i === 2 ? 'translate-y-12' : ''} 
                 ${i === 0 ? 'rounded-tl-[4rem] bg-gradient-to-br from-emerald-50 to-white' : ''}
                 ${i === 3 ? 'rounded-br-[4rem] bg-gradient-to-tl from-emerald-50 to-white' : ''}`}>
                                    {t}
                                </div>
                            ))}
                        </div>

                    </div>
                </section>
            </main>
        </div>
    )
}

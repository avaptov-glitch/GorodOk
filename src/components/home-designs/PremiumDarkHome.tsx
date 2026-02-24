import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Star, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react'

export default function PremiumDarkHome() {
    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-amber-500/30">
            <Header />
            <main className="flex-1">

                {/* HERO SECTION */}
                <section className="relative px-4 py-24 sm:py-32 lg:py-40 flex flex-col items-center justify-center overflow-hidden border-b border-zinc-800/50">
                    <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 opacity-100"></div>

                    {/* Decorative glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-[100%] pointer-events-none"></div>

                    {/* Subtle noise/texture */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>

                    <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8 sm:space-y-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 backdrop-blur-md px-4 py-2 text-sm font-bold tracking-wide text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <Star className="w-4 h-4 fill-amber-400" /> Элитные исполнители Вологды
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[1.05] bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500 pb-2">
                            Качество без<br className="hidden sm:block" /> компромиссов.
                        </h1>

                        <p className="text-xl sm:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
                            Эксклюзивный доступ к лучшим мастерам с подтвержденным рейтингом, гарантией качества и проверенным портфолио.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                            <Button size="lg" className="bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-950 hover:from-amber-300 hover:to-amber-500 text-lg font-black px-12 h-16 rounded-2xl border-0 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]">
                                Найти эксперта
                            </Button>
                            <Button size="lg" variant="outline" className="border-zinc-700 bg-zinc-900/50 backdrop-blur-md text-zinc-300 hover:bg-zinc-800 hover:text-white text-lg font-bold px-12 h-16 rounded-2xl hover:border-zinc-600 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                Стать исполнителем
                            </Button>
                        </div>
                    </div>
                </section>

                {/* PROMISE SECTION */}
                <section className="py-24 sm:py-32 px-4 container mx-auto relative relative">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">Золотой стандарт сервиса</h2>
                        <p className="text-zinc-500 font-medium text-lg">Почему выбирают именно нас</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                        {[
                            { icon: <Star />, title: 'Топ рейтинг 4.9+', desc: 'Мы отбираем только тех специалистов, чья оценка не опускается ниже 4.9 баллов из 5. Менее качественные отсеиваются алгоритмом.' },
                            { icon: <ShieldCheck />, title: 'Проверено сервисом', desc: 'Служба безопасности проверяет документы, сертификаты и подлинность портфолио каждого профи перед публикацией.' },
                            { icon: <CheckCircle2 />, title: 'Безопасная сделка', desc: 'Гарантия сохранности ваших средств. Деньги переводятся мастеру только после того, как вы примете качественную работу.' }
                        ].map((feature, i) => (
                            <div key={i} className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-[2rem] p-8 sm:p-10 hover:border-amber-500/50 transition-all duration-500 group hover:shadow-[0_0_40px_rgba(245,158,11,0.05)] hover:-translate-y-2 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="w-16 h-16 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-2xl mb-8 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 group-hover:border-amber-500/30 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300 relative z-10">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-black mb-4 text-zinc-100 tracking-tight relative z-10">{feature.title}</h3>
                                <p className="text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors relative z-10">
                                    {feature.desc}
                                </p>

                                <div className="mt-8 flex items-center gap-2 text-amber-500 font-bold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 relative z-10">
                                    Подробнее <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}

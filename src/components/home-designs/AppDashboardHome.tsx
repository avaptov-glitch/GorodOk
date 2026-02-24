import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wrench, Sparkles, BookOpen, Plus, Activity, Star } from 'lucide-react'

export default function AppDashboardHome() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-[1400px]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Sidebar - Quick Actions */}
                    <div className="lg:col-span-4 lg:col-start-1 space-y-8">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2rem] p-8 sm:p-10 shadow-lg shadow-blue-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>

                            <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight relative z-10">Добро пожаловать!</h2>
                            <p className="text-blue-100 mb-8 text-lg font-medium relative z-10">Какая помощь нужна сегодня?</p>

                            <Button size="lg" className="w-full font-bold rounded-2xl h-14 bg-white text-blue-700 hover:bg-blue-50 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] relative z-10 text-base flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Создать задание
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2 mb-2">
                                <h3 className="font-bold text-slate-900 text-lg">Популярные категории</h3>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">Сезон</span>
                            </div>

                            {[
                                { name: 'Ремонт и стройка', icon: <Wrench className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-100' },
                                { name: 'Уборка', icon: <Sparkles className="w-5 h-5" />, color: 'text-indigo-600', bg: 'bg-indigo-100' },
                                { name: 'Репетиторы', icon: <BookOpen className="w-5 h-5" />, color: 'text-rose-600', bg: 'bg-rose-100' },
                            ].map(cat => (
                                <Card key={cat.name} className="hover:border-blue-200 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md border-slate-200/60 rounded-2xl group overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/50 transition-colors"></div>
                                    <CardContent className="p-4 sm:p-5 flex items-center gap-4 relative z-10">
                                        <div className={`${cat.bg} ${cat.color} p-3.5 rounded-xl group-hover:scale-110 transition-transform duration-300`}>{cat.icon}</div>
                                        <span className="font-bold flex-1 text-slate-800 text-lg">{cat.name}</span>
                                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Button variant="ghost" className="w-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-bold rounded-xl h-12">
                            Смотреть все категории <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    {/* Right Content - Feed */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center gap-3 mb-8 px-2">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <Activity className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-2xl text-slate-900 tracking-tight">Сейчас онлайн</h3>
                                <p className="text-slate-500 text-sm font-medium">Готовы приступить к работе в ближайшее время</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Card key={i} className="shadow-sm border-slate-200/60 rounded-3xl hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] hover:border-blue-200 transition-all duration-300 group">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-5 mb-6">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full shrink-0 relative overflow-hidden ring-4 ring-white shadow-sm">
                                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i * 13}`} alt="avatar" className="w-full h-full object-cover" />
                                                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-black text-lg text-slate-900 leading-tight">Специалист #{i}</h4>
                                                    <div className="bg-amber-100 text-amber-700 font-bold text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                                        4.9 <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-500 mt-1 font-medium">Сантехник, Электрик</p>
                                                <p className="text-sm font-bold text-slate-800 mt-2">От 1 500 ₽/ч</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full rounded-xl h-12 font-bold border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300">
                                            Предложить работу
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}

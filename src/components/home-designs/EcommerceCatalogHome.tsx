import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, ChevronRight, Percent, Clock } from 'lucide-react'

export default function EcommerceCatalogHome() {
    const catalog = [
        { title: 'Ремонт и строительство', sub: ['Отделочные работы', 'Сантехника', 'Электрика', 'Сборка мебели'] },
        { title: 'Красота и здоровье', sub: ['Маникюр', 'Парикмахер', 'Массаж', 'Косметология'] },
        { title: 'Обучение и курсы', sub: ['Английский', 'Математика', 'Вождение', 'Вокал'] },
        { title: 'IT и фриланс', sub: ['Разработка сайтов', 'Дизайн', 'Тексты', 'СММ'] },
        { title: 'Дом и уборка', sub: ['Генеральная уборка', 'Химчистка', 'Вывоз мусора', 'Домашний мастер'] },
        { title: 'Авто услуги', sub: ['Автосервис', 'Шиномонтаж', 'Эвакуатор', 'Автоэксперт'] },
        { title: 'Мероприятия', sub: ['Ведущие', 'Фотографы', 'Аниматоры', 'Кейтеринг'] },
        { title: 'Ремонт техники', sub: ['Ремонт телефонов', 'Ремонт ПК', 'Бытовая техника', 'Кондиционеры'] },
        { title: 'Юристы и бизнес', sub: ['Консультация', 'Бухгалтерия', 'Договоры', 'Регистрация'] }
    ]

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Header />
            <main className="flex-1">

                {/* COMPACT HERO BAR */}
                <section className="bg-white border-b py-6 px-4">
                    <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1 w-full flex items-center gap-6">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight shrink-0 hidden lg:block">Всё для задач</h1>
                            <div className="relative w-full max-w-2xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
                                <Input
                                    className="w-full h-12 pl-12 pr-4 bg-primary/5 border-primary/20 hover:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/20 text-base rounded-xl font-medium"
                                    placeholder="Поиск по 10 000+ услуг и специалистам..."
                                />
                            </div>
                        </div>

                        {/* Promo badges array */}
                        <div className="hidden lg:flex gap-3 shrink-0">
                            <div className="bg-rose-50 text-rose-700 rounded-xl px-4 py-2 flex items-center gap-2 border border-rose-100 font-bold text-sm cursor-pointer hover:bg-rose-100 transition-colors">
                                <Percent className="w-4 h-4" /> Акции
                            </div>
                            <div className="bg-blue-50 text-blue-700 rounded-xl px-4 py-2 flex items-center gap-2 border border-blue-100 font-bold text-sm cursor-pointer hover:bg-blue-100 transition-colors">
                                <Clock className="w-4 h-4" /> Срочный вызов
                            </div>
                        </div>
                    </div>
                </section>

                {/* FULL CATALOG GRID */}
                <section className="container mx-auto max-w-7xl py-10 px-4">
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Популярные категории</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {catalog.map((cat, i) => (
                            <Card key={i} className="hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden group">
                                <CardContent className="p-0">
                                    {/* Card Header (Category Title) */}
                                    <div className="bg-white p-5 border-b border-slate-100 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                                        <h3 className="font-bold text-lg text-slate-800">{cat.title}</h3>
                                        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                                            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-primary" />
                                        </div>
                                    </div>

                                    {/* Category Items List */}
                                    <ul className="p-5 space-y-3 bg-white">
                                        {cat.sub.map((sub, j) => (
                                            <li key={j}>
                                                <a href="#" className="text-[15px] font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                    {sub}
                                                </a>
                                            </li>
                                        ))}
                                        <li className="pt-3 mt-3 border-t border-slate-50">
                                            <a href="#" className="inline-flex text-[14px] font-bold text-primary hover:underline hover:text-primary items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-md">
                                                Смотреть все <span className="opacity-50">24+</span>
                                            </a>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* SEO blocks often found in e-commerce */}
                    <div className="mt-16 bg-white p-8 rounded-2xl border border-slate-200">
                        <h3 className="text-lg font-bold mb-3">ГородОк — маркетплейс услуг в Вологде</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Ваша надежная площадка для поиска специалистов для любых задач. Мы собрали более 10 тысяч предложений от электриков до дизайнеров, чтобы вы могли легко сравнить цены, читать отзывы и выбрать лучшее. Ежедневно сотни людей находят помощь для дома, бизнеса и учебы.
                        </p>
                    </div>
                </section>

            </main>
        </div>
    )
}

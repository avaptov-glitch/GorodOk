export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import {
  Search, CheckCircle, ArrowRight, MessageSquare,
  Hammer, Monitor, Sparkles,
  ClipboardList, Users,
  Zap, Shield, Truck, Paintbrush, Wrench, BookOpen, Star,
  CreditCard, Award, ArrowUpRight
} from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'ГородОк — найди исполнителя рядом',
  description:
    'Маркетплейс услуг в Вологде: репетиторы, сантехники, тренеры, мастера по ремонту и сотни других специалистов. Быстро найдите проверенного исполнителя рядом.',
  openGraph: {
    title: 'ГородОк — найди исполнителя рядом',
    description:
      'Маркетплейс услуг в Вологде: репетиторы, сантехники, тренеры и другие специалисты — быстро и удобно.',
  },
}

export default async function HomePage() {
  const topExecutors = await prisma.executorProfile.findMany({
    where: {
      isPublished: true,
      moderationStatus: 'APPROVED',
      reviewsCount: { gt: 0 },
    },
    orderBy: [{ ratingAvg: 'desc' }, { reviewsCount: 'desc' }],
    take: 6,
    include: {
      user: { select: { name: true, avatarUrl: true, lastSeenAt: true } },
    },
  })

  // Считаем опубликованных исполнителей
  const totalExecutors = await prisma.executorProfile.count({
    where: { isPublished: true, moderationStatus: 'APPROVED' },
  })

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-sans overflow-x-hidden selection:bg-blue-200">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'ГородОк',
          url: siteUrl,
          description: 'Маркетплейс услуг вашего города',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      <Header />

      <main className="flex-1">

        {/* =========================================
            SECTION 1: HERO (THE PREMIUM BENTO GRID)
        ========================================= */}
        <section className="pt-12 pb-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-[1360px] mx-auto">
            {/* BACKGROUND BLURS */}
            <div className="fixed top-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-blue-100/40 via-purple-50/30 to-transparent blur-[100px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
            <div className="fixed bottom-0 left-0 w-[600px] h-[500px] bg-gradient-to-tr from-emerald-50/40 via-teal-50/20 to-transparent blur-[100px] -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

            {/* HEADER TEXT */}
            <div className="mb-14 text-center sm:text-left sm:flex sm:items-end sm:justify-between relative z-10 w-full pl-2">
              <div className="relative">
                <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-bold text-slate-900 tracking-[-0.03em] leading-[1.05]">
                  Только лучшие<br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mix-blend-multiply">
                    мастера.
                  </span>
                </h1>
                <p className="mt-6 text-xl text-slate-500 max-w-lg font-medium tracking-tight">
                  Без скрытых комиссий и долгих поисков. Выбирайте по реальным отзывам напрямую.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-4 bg-white/60 backdrop-blur-xl border border-white/40 p-3 pr-6 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 transition-transform hover:scale-105 duration-300">
                <div className="flex -space-x-3">
                  {topExecutors.length > 0 ? topExecutors.slice(0, 6).map((exec, i) => (
                    <div key={exec.id} className={`w-12 h-12 rounded-full border-[3px] border-white flex items-center justify-center font-bold text-white shadow-sm overflow-hidden`} style={{ backgroundColor: `hsl(${i * 40 + 200}, 70%, 50%)`, zIndex: 10 - i }}>
                      {exec.user.avatarUrl ? (
                        <img src={exec.user.avatarUrl} alt={exec.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm shadow-sm">{exec.user.name.charAt(0)}</span>
                      )}
                    </div>
                  )) : (
                    [
                      { id: 'f1', name: 'А', color: 'hsl(200, 70%, 50%)' },
                      { id: 'f2', name: 'М', color: 'hsl(240, 70%, 50%)' },
                      { id: 'f3', name: 'Д', color: 'hsl(280, 70%, 50%)' },
                      { id: 'f4', name: 'Е', color: 'hsl(320, 70%, 50%)' },
                      { id: 'f5', name: 'С', color: 'hsl(360, 70%, 50%)' },
                      { id: 'f6', name: 'В', color: 'hsl(400, 70%, 50%)' },
                    ].map((fallback, i) => (
                      <div key={fallback.id} className={`w-12 h-12 rounded-full border-[3px] border-white flex items-center justify-center font-bold text-white shadow-sm overflow-hidden`} style={{ backgroundColor: fallback.color, zIndex: 10 - i }}>
                        <span className="text-sm shadow-sm">{fallback.name}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-500 leading-tight">
                  <span className="text-slate-900 text-base font-bold tracking-tight">{totalExecutors > 0 ? `${totalExecutors}+` : '5,000+'}</span><br />
                  свободно
                </div>
              </div>
            </div>

            {/* BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 auto-rows-[220px] relative z-10">

              <div className="md:col-span-2 md:row-span-2 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-white/60 relative overflow-hidden flex flex-col justify-between group hover:shadow-[0_20px_60px_rgba(37,99,235,0.08)] hover:bg-white/90 transition-all duration-500 ease-out ring-1 ring-slate-900/5">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-400/20 via-indigo-300/10 to-transparent rounded-full blur-[60px] -z-10 -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"></div>
                <div>
                  <div className="inline-flex items-center gap-2 bg-blue-50/80 text-blue-700 px-4 py-2 rounded-2xl text-sm font-bold mb-8 border border-blue-100/50 shadow-sm backdrop-blur-md">
                    <Zap className="w-4 h-4 fill-blue-600" /> Подбор за секунды
                  </div>
                  <h2 className="text-4xl lg:text-[2.5rem] font-bold text-slate-900 mb-4 tracking-[-0.02em] leading-none">Что случилось?</h2>
                  <p className="text-slate-500 mb-8 max-w-sm text-lg leading-relaxed font-medium">Опишите задачу своими словами, а мы быстро найдем профи.</p>
                </div>
                <form action="/search" method="get" className="relative flex shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-[1.5rem] overflow-hidden ring-1 ring-slate-200/60 bg-white/90 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-300 ease-out group/form">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within/form:text-blue-500 transition-colors duration-300" />
                  <input name="q" type="text" placeholder="Потёк кран, нужен репетитор..." className="w-full h-[4.5rem] bg-transparent border-0 pl-[4.5rem] pr-[150px] outline-none font-medium text-lg placeholder:text-slate-400 text-slate-900" />
                  <Button type="submit" className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.25rem] px-8 font-semibold shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 text-base h-auto">
                    Найти
                  </Button>
                </form>
              </div>

              <Link href="/category/remont-i-stroitelstvo" className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] rounded-[2.5rem] p-8 shadow-[0_10px_30px_rgba(255,107,107,0.2)] text-white flex flex-col justify-between cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,107,107,0.3)] transition-all duration-400 ease-out relative overflow-hidden group/card border border-white/20">
                <div className="absolute inset-0 bg-white/0 group-hover/card:bg-white/10 transition-colors duration-300"></div>
                <Wrench className="w-10 h-10 opacity-90 drop-shadow-md group-hover/card:scale-110 group-hover/card:-rotate-6 transition-transform duration-500 ease-out origin-bottom-left" />
                <div className="relative z-10 flex items-end justify-between">
                  <h3 className="text-2xl font-bold leading-tight tracking-[-0.02em]">Ремонт<br />и стройка</h3>
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center -translate-x-4 opacity-0 group-hover/card:translate-x-0 group-hover/card:opacity-100 transition-all duration-400 ease-out">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>

              <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-[0_15px_40px_rgba(15,23,42,0.15)] text-white flex flex-col justify-center items-center text-center relative overflow-hidden group/trust border border-slate-800 ring-1 ring-white/10">
                <Shield className="w-12 h-12 text-[#34D399] drop-shadow-[0_0_20px_rgba(52,211,153,0.3)] mb-4 group-hover/trust:scale-110 group-hover/trust:rotate-3 transition-transform duration-500 ease-out" />
                <div className="text-[2.75rem] font-bold tracking-tight leading-none mb-1 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">100%</div>
                <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mt-1">Проверены</div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.04] mix-blend-overlay"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-[150%] h-[150%] bg-emerald-500/10 blur-[60px] rounded-full group-hover/trust:bg-emerald-500/20 transition-colors duration-700 ease-out"></div>
              </div>

              <Link href="/category/avto" className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white/60 flex flex-col justify-between cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(59,130,246,0.08)] hover:bg-white transition-all duration-400 ease-out ring-1 ring-slate-900/5 group/cat">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-blue-50/80 text-blue-600 rounded-2xl flex items-center justify-center group-hover/cat:bg-blue-600 group-hover/cat:text-white transition-all duration-400 ease-out shadow-sm border border-blue-100/50">
                    <Truck className="w-7 h-7" />
                  </div>
                  <div className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-full group-hover/cat:bg-blue-100 group-hover/cat:text-blue-700 transition-colors duration-300">ХИТ</div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-[-0.02em]">Услуги Авто</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">От 500 ₽/час</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center opacity-0 -translate-x-4 group-hover/cat:opacity-100 group-hover/cat:translate-x-0 transition-all duration-400 ease-out">
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </Link>

              <div className="bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgba(16,185,129,0.05)] flex flex-col justify-between border border-emerald-100/50 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:border-emerald-200 transition-all duration-400 ease-out group/btn">
                <div>
                  <h3 className="font-bold text-emerald-950 text-2xl tracking-[-0.02em] mb-2 leading-tight">Сложная<br />задача?</h3>
                  <p className="text-emerald-800/70 text-sm font-medium">Создайте задание сами.</p>
                </div>
                <Button variant="outline" asChild className="w-full bg-white/80 backdrop-blur-sm border-white/60 shadow-sm rounded-[1.25rem] font-bold h-12 mt-4 text-emerald-900 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 group-hover/btn:scale-[1.03]">
                  <Link href="/tasks/create">Создать задание</Link>
                </Button>
              </div>

              <div className="md:col-span-4 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white/60 flex flex-col justify-center ring-1 ring-slate-900/5 hover:bg-white transition-colors duration-500 ease-out">
                <div className="flex items-center justify-between xl:mb-6 mb-4">
                  <h3 className="text-xl font-bold text-slate-900 tracking-[-0.01em]">Популярные направления</h3>
                  <Link href="/categories" className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100 px-5 py-2 rounded-full transition-colors border border-blue-100/50">Всё меню</Link>
                </div>
                <div className="flex w-full gap-3 overflow-x-auto pb-2 scrollbar-hide pt-1">
                  {[
                    { name: 'Уборка', link: 'klining', icon: <Paintbrush className="w-4 h-4 shrink-0" />, base: 'bg-[#EFF6FF] text-[#2563EB] ring-[#DBEAFE]', hover: 'hover:bg-[#2563EB] hover:text-white hover:shadow-[0_8px_20px_rgba(37,99,235,0.2)]' },
                    { name: 'Электрик', link: 'elektrik', icon: <Zap className="w-4 h-4 shrink-0" />, base: 'bg-[#FEF3C7] text-[#D97706] ring-[#FDE68A]', hover: 'hover:bg-[#F59E0B] hover:text-white hover:shadow-[0_8px_20px_rgba(245,158,11,0.2)]' },
                    { name: 'Репетитор', link: 'repetitory', icon: <BookOpen className="w-4 h-4 shrink-0" />, base: 'bg-[#FFE4E6] text-[#E11D48] ring-[#FECDD3]', hover: 'hover:bg-[#E11D48] hover:text-white hover:shadow-[0_8px_20px_rgba(225,29,72,0.2)]' },
                    { name: 'Сантехник', link: 'santehnik', icon: <Wrench className="w-4 h-4 shrink-0" />, base: 'bg-[#ECFEFF] text-[#0891B2] ring-[#CFFAFE]', hover: 'hover:bg-[#06B6D4] hover:text-white hover:shadow-[0_8px_20px_rgba(6,182,212,0.2)]' },
                    { name: 'Автоуслуги', link: 'avto', icon: <Truck className="w-4 h-4 shrink-0" />, base: 'bg-[#F3E8FF] text-[#9333EA] ring-[#E9D5FF]', hover: 'hover:bg-[#9333EA] hover:text-white hover:shadow-[0_8px_20px_rgba(147,51,234,0.2)]' },
                    { name: 'Сборка мебели', link: 'remont-i-stroitelstvo', icon: <Hammer className="w-4 h-4 shrink-0" />, base: 'bg-[#F1F5F9] text-[#475569] ring-[#E2E8F0]', hover: 'hover:bg-[#475569] hover:text-white hover:shadow-[0_8px_20px_rgba(71,85,105,0.2)]' },
                    { name: 'Компьютеры', link: 'kompyuternaya-pomosh', icon: <Monitor className="w-4 h-4 shrink-0" />, base: 'bg-[#F0FDF4] text-[#16A34A] ring-[#DCFCE7]', hover: 'hover:bg-[#16A34A] hover:text-white hover:shadow-[0_8px_20px_rgba(22,163,74,0.2)]' },
                    { name: 'Красота', link: 'krasota', icon: <Sparkles className="w-4 h-4 shrink-0" />, base: 'bg-[#FFF1F2] text-[#E11D48] ring-[#FFE4E6]', hover: 'hover:bg-[#E11D48] hover:text-white hover:shadow-[0_8px_20px_rgba(225,29,72,0.2)]' },
                  ].map((c, i) => (
                    <Link href={`/category/${c.link}`} key={i} className={`flex-1 shrink-0 min-w-[140px] flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl font-bold text-sm ring-1 ring-inset cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 ${c.base} ${c.hover}`}>
                      {c.icon} <span className="truncate whitespace-nowrap">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 2: HOW IT WORKS (REBUILT & PREMIUM)
        ========================================= */}
        <section className="py-24 px-4 bg-white relative overflow-hidden border-y border-slate-200/50">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-50 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

          <div className="container mx-auto max-w-[1360px]">
            <div className="mb-20 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" /> Простой процесс
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-[-0.02em] leading-tight">
                От идеи до результата — <br className="hidden sm:block" />
                <span className="text-slate-400">ровно 4 шага</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Desktop connecting line */}
              <div className="hidden lg:block absolute top-[60px] left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-100 via-slate-200 to-emerald-100 -z-10"></div>

              {[
                {
                  icon: <ClipboardList className="h-8 w-8" />,
                  step: '01',
                  title: 'Опишите задачу',
                  desc: 'Пара слов о том, что нужно сделать и где вы находитесь.',
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                  ring: 'ring-blue-100'
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  step: '02',
                  title: 'Мастера увидят',
                  desc: 'Наш алгоритм покажет задание лучшим профи поблизости.',
                  color: 'text-orange-600',
                  bg: 'bg-orange-50',
                  ring: 'ring-orange-100'
                },
                {
                  icon: <MessageSquare className="h-8 w-8" />,
                  step: '03',
                  title: 'Сравните цены',
                  desc: 'Получите отклики, почитайте отзывы и выберите своего.',
                  color: 'text-purple-600',
                  bg: 'bg-purple-50',
                  ring: 'ring-purple-100'
                },
                {
                  icon: <CheckCircle className="h-8 w-8" />,
                  step: '04',
                  title: 'Готово!',
                  desc: 'Специалист выполнит работу, а вы оставите ему честный отзыв.',
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                  ring: 'ring-emerald-100'
                },
              ].map(({ icon, step, title, desc, color, bg, ring }) => (
                <div key={step} className="relative flex flex-col items-center text-center group cursor-default">
                  {/* Icon Node */}
                  <div className={`w-[120px] h-[120px] rounded-[2rem] flex items-center justify-center bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] ring-1 ${ring} relative transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
                      {icon}
                    </div>
                    {/* Step badge */}
                    <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-md ring-4 ring-white transition-transform duration-500 group-hover:scale-110 group-hover:bg-blue-600`}>
                      {step}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-8 px-2 border-t border-transparent group-hover:border-slate-100 pt-6 transition-colors duration-500">
                    <h3 className="font-bold text-2xl text-slate-900 tracking-[-0.01em] mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 3: WHY CHOOSE US (BENEFITS)
        ========================================= */}
        <section className="py-24 px-4 bg-[#F8FAFC]">
          <div className="container mx-auto max-w-[1360px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

              {/* Text side */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-[-0.02em] leading-[1.1] mb-6">
                  Никаких посредников.<br />
                  <span className="text-blue-600">Только прямой контакт.</span>
                </h2>
                <p className="text-xl text-slate-500 font-medium mb-12">
                  Мы создали маркетплейс, где правила диктуете вы.
                  Каждый профи проходит проверку, а все отзывы — 100% реальные.
                </p>

                <div className="space-y-8">
                  {[
                    { icon: <Shield className="w-6 h-6 text-emerald-500" />, title: 'Безопасность', desc: 'Все мастера проходят проверку документов' },
                    { icon: <Star className="w-6 h-6 text-amber-500" />, title: 'Честные рейтинги', desc: 'Отзывы оставляют только те, кто заказал услугу' },
                    { icon: <CreditCard className="w-6 h-6 text-indigo-500" />, title: 'Без комиссий', desc: 'Оплата происходит напрямую исполнителю' },
                  ].map((benefit, i) => (
                    <div key={i} className="flex gap-5 group">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        {benefit.icon}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">{benefit.title}</h4>
                        <p className="text-slate-500 font-medium">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual side (Premium Card Stack) */}
              <div className="relative h-[500px] w-full hidden md:block perspective-1000">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-slate-200 z-20 hover:-translate-y-[60%] transition-transform duration-500">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">А</div>
                      <div>
                        <div className="font-bold text-slate-900 tracking-tight">Александр В.</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1 font-medium"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9 (124 отзыва)</div>
                      </div>
                    </div>
                    <Award className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="font-bold text-slate-900 text-lg mb-2">Ремонт ванной под ключ</div>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2">Выполнил работу в срок, убрал за собой мусор. Очень вежливый специалист, рекомендую всем соседям.</p>
                  <Button className="w-full bg-slate-900 rounded-xl" size="lg">Написать мастеру</Button>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-[45%] -translate-y-[40%] w-full max-w-sm bg-white/60 backdrop-blur-md rounded-[2rem] p-8 shadow-sm ring-1 ring-slate-200/50 z-10 scale-95 opacity-60">
                  <div className="h-12 w-3/4 bg-slate-200 rounded-lg mb-5 animate-pulse"></div>
                  <div className="h-4 w-full bg-slate-100 rounded-full mb-3"></div>
                  <div className="h-4 w-5/6 bg-slate-100 rounded-full"></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 4: PRE-FOOTER CTA
        ========================================= */}
        <section className="py-12 px-4 bg-[#F8FAFC]">
          <div className="container mx-auto max-w-[1360px]">
            <div className="bg-slate-900 rounded-[3rem] overflow-hidden relative shadow-[0_30px_60px_rgba(15,23,42,0.2)]">
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-blue-600/30 via-indigo-600/10 to-transparent blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/5 to-transparent blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] mix-blend-overlay"></div>

              <div className="relative z-10 px-6 py-20 sm:p-24 flex flex-col items-center text-center">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-[-0.02em] leading-tight mb-6">
                  Готовы начать работать <br className="hidden md:block" /> с лучшими?
                </h2>
                <p className="text-xl text-slate-300 font-medium max-w-2xl mb-10">
                  Присоединяйтесь к тысячам горожан, которые уже решили свои задачи быстро и безопасно.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold px-10 h-16 text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                    <Link href="/tasks/create">Создать задание <ArrowUpRight className="ml-2 w-5 h-5" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-2xl font-bold px-10 h-16 text-lg backdrop-blur-md">
                    <Link href="/register">Стать исполнителем</Link>
                  </Button>
                </div>

                <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-slate-400">
                  <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400" /> Бесплатная публикация</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400" /> Прямая связь</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400" /> Отзывы реальных людей</div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Global Footer remains untouched, but seamless transition now */}
      <Footer />
    </div>
  )
}

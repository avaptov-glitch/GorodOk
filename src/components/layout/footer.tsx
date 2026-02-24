import Link from 'next/link'
import { Github, Twitter, Linkedin, Facebook } from 'lucide-react'

const footerSections = [
  {
    title: 'Для клиентов',
    links: [
      { href: '/categories', label: 'Каталог услуг' },
      { href: '/tasks/create', label: 'Создать задание' },
      { href: '/search', label: 'Найти мастера' },
      { href: '#', label: 'Как это работает' },
    ],
  },
  {
    title: 'Для исполнителей',
    links: [
      { href: '/register', label: 'Стать профи' },
      { href: '#', label: 'Платные тарифы' },
      { href: '#', label: 'Правила платформы' },
      { href: '#', label: 'Справка для мастеров' },
    ],
  },
  {
    title: 'О ГородОк',
    links: [
      { href: '#', label: 'О компании' },
      { href: '#', label: 'Блог и новости' },
      { href: '#', label: 'Безопасность' },
      { href: '#', label: 'Контакты' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/60 pt-20 pb-10 overflow-hidden relative mt-auto">
      {/* Subtle top illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

      <div className="container mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand Info */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 rounded-[0.8rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_4px_15px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-black text-xl leading-none">Г</span>
              </div>
              <span className="font-extrabold text-[1.4rem] text-slate-900 tracking-[-0.03em]">
                ГородОк<span className="text-blue-600">.</span>
              </span>
            </Link>

            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 max-w-[280px]">
              Платформа для поиска надежных исполнителей в вашем городе. Мы связываем лучших специалистов с теми, кому нужна их помощь.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {[Twitter, Github, Linkedin, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Links Grid */}
          <div className="md:col-span-7 lg:col-span-6 grid grid-cols-2 lg:grid-cols-3 gap-8">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-slate-900 tracking-[-0.01em] mb-5">
                  {section.title}
                </h3>
                <ul className="space-y-3.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-slate-400">
          <p>© {new Date().getFullYear()} ГородОк. Все права защищены.</p>

          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-600 transition-colors">Политика конфиденциальности</Link>
            <Link href="#" className="hover:text-slate-600 transition-colors">Оферта</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}

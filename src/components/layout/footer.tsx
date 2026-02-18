import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

const footerSections = [
  {
    title: 'Для клиентов',
    links: [
      { href: '/categories', label: 'Каталог услуг' },
      { href: '/tasks', label: 'Разместить задание' },
      { href: '/search', label: 'Найти мастера' },
    ],
  },
  {
    title: 'Для исполнителей',
    links: [
      { href: '/register', label: 'Стать исполнителем' },
      { href: '#', label: 'Тарифы и подписки' },
      { href: '#', label: 'Правила размещения' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { href: '#', label: 'О проекте' },
      { href: '#', label: 'FAQ' },
      { href: '#', label: 'Контакты' },
      { href: '#', label: 'Пользовательское соглашение' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Бренд */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm leading-none">Г</span>
              </div>
              <span className="font-bold text-xl">ГородОк</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Маркетплейс услуг вашего города. Находите лучших специалистов рядом с вами.
            </p>
          </div>

          {/* Секции ссылок */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm mb-3 text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ГородОк. Все права защищены.</p>
          <p>Сделано с заботой о вашем городе</p>
        </div>
      </div>
    </footer>
  )
}

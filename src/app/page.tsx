import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Search, Star, Users, Briefcase } from 'lucide-react'

// Временная заглушка главной страницы — полная реализация в Этапе 4
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero-секция */}
        <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
              Найди лучшего специалиста <span className="text-primary">в твоём городе</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Репетиторы, сантехники, тренеры, мастера на час и сотни других профессионалов — рядом с вами на ГородОк
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link href="/categories">
                  <Search className="h-5 w-5 mr-2" />
                  Найти исполнителя
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Стать исполнителем</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Статистика */}
        <section className="py-12 px-4 border-b border-border">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { icon: Users, value: '500+', label: 'Исполнителей' },
                { icon: Briefcase, value: '10+', label: 'Категорий услуг' },
                { icon: Star, value: '4.8', label: 'Средний рейтинг' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <Icon className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-bold text-foreground">{value}</span>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Заглушка с информацией об этапе */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <p className="text-muted-foreground text-sm">
              Полная главная страница (каталог категорий, блок исполнителей, как это работает) —{' '}
              <strong>Этап 4</strong>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

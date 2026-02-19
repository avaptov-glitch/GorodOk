import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { SearchX, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <SearchX className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Страница не найдена
          </h2>
          <p className="text-muted-foreground mb-8">
            К сожалению, запрашиваемая страница не существует, была удалена или
            перемещена по другому адресу.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                На главную
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                К категориям
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

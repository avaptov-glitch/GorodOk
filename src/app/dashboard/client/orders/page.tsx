import type { Metadata } from 'next'
import { FileText } from 'lucide-react'

export const metadata: Metadata = { title: 'Мои заявки' }

// Заглушка — полная реализация в Этапе 7 (Система заявок)
export default function ClientOrdersPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Мои заявки</h1>
      <p className="text-muted-foreground mb-8">
        Здесь будут отображаться ваши активные и завершённые заявки.
      </p>
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground font-medium">У вас пока нет заявок</p>
        <p className="text-sm text-muted-foreground mt-1">
          Функциональность появится в Этапе 7
        </p>
      </div>
    </div>
  )
}

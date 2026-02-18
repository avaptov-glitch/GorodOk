import type { Metadata } from 'next'
import { User } from 'lucide-react'

export const metadata: Metadata = { title: 'Моя анкета' }

// Заглушка — полная реализация в Этапе 6 (Кабинет исполнителя)
export default function ExecutorProfilePage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Моя анкета</h1>
      <p className="text-muted-foreground mb-8">
        Здесь вы сможете заполнить и редактировать свою анкету исполнителя.
      </p>
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
        <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground font-medium">Анкета ещё не заполнена</p>
        <p className="text-sm text-muted-foreground mt-1">
          Функциональность появится в Этапе 6
        </p>
      </div>
    </div>
  )
}

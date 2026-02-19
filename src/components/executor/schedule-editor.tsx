'use client'

import { useState, useTransition } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { saveSchedule } from '@/actions/executor'
import type { ScheduleDayInput } from '@/actions/executor'

const DAY_NAMES: Record<number, string> = {
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
  6: 'Суббота',
  0: 'Воскресенье',
}

// Порядок отображения: Пн–Вс
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

interface ScheduleEditorProps {
  schedule: ScheduleDayInput[]
}

export function ScheduleEditor({ schedule: initialSchedule }: ScheduleEditorProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Инициализируем стейт строго в порядке Пн–Вс
  const [days, setDays] = useState<ScheduleDayInput[]>(() =>
    DAY_ORDER.map(
      (day) =>
        initialSchedule.find((d) => d.dayOfWeek === day) ?? {
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: false,
        }
    )
  )

  function updateDay(dayOfWeek: number, patch: Partial<ScheduleDayInput>) {
    setDays((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d))
    )
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveSchedule(days)
      if (result.success) {
        toast({ title: 'Расписание сохранено' })
      } else {
        toast({ variant: 'destructive', title: 'Ошибка', description: result.error })
      }
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 pb-2">
          {/* Шапка таблицы */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 px-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">День</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Доступен</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">С</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">До</span>
          </div>

          <div className="divide-y divide-border">
            {days.map((day) => (
              <div
                key={day.dayOfWeek}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 items-center py-3 px-2"
              >
                {/* Название дня */}
                <span
                  className={
                    day.isAvailable
                      ? 'text-sm font-medium text-foreground'
                      : 'text-sm text-muted-foreground'
                  }
                >
                  {DAY_NAMES[day.dayOfWeek]}
                </span>

                {/* Чекбокс доступности */}
                <div className="flex justify-center">
                  <Checkbox
                    checked={day.isAvailable}
                    onCheckedChange={(checked) =>
                      updateDay(day.dayOfWeek, { isAvailable: !!checked })
                    }
                    disabled={isPending}
                  />
                </div>

                {/* Время начала */}
                <Input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => updateDay(day.dayOfWeek, { startTime: e.target.value })}
                  disabled={isPending || !day.isAvailable}
                  className="text-sm h-8 px-2"
                />

                {/* Время конца */}
                <Input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => updateDay(day.dayOfWeek, { endTime: e.target.value })}
                  disabled={isPending || !day.isAvailable}
                  className="text-sm h-8 px-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} size="lg">
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Сохранение...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" />Сохранить расписание</>
          )}
        </Button>
      </div>
    </div>
  )
}

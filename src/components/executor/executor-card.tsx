import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, Briefcase, Zap, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type PriceType = 'FIXED' | 'FROM' | 'RANGE' | 'NEGOTIABLE' | 'PER_HOUR'

export interface ExecutorCardProps {
  id: string
  user: {
    name: string
    avatarUrl: string | null
    lastSeenAt?: Date | string | null
  }
  ratingAvg: number
  reviewsCount: number
  isVerified: boolean
  isPro: boolean
  district: string | null
  worksOnline: boolean
  acceptsAtOwnPlace: boolean
  travelsToClient: boolean
  avgResponseTimeMinutes?: number | null
  services: Array<{
    name: string
    priceFrom: number
    priceType: PriceType
  }>
  categories: Array<{
    category: { name: string }
  }>
  portfolio: Array<{ imageUrl: string }>
}

function formatPrice(priceFrom: number, priceType: PriceType): string {
  const rubles = Math.floor(priceFrom / 100)
  if (priceType === 'NEGOTIABLE') return 'По договорённости'
  if (priceType === 'FIXED') return `${rubles.toLocaleString('ru-RU')} ₽`
  if (priceType === 'PER_HOUR') return `${rubles.toLocaleString('ru-RU')} ₽/час`
  return `от ${rubles.toLocaleString('ru-RU')} ₽`
}

function isOnline(lastSeenAt: Date | string | null | undefined): boolean {
  if (!lastSeenAt) return false
  return (Date.now() - new Date(lastSeenAt).getTime()) / 60000 < 5
}

export function ExecutorCard({
  id,
  user,
  ratingAvg,
  reviewsCount,
  isVerified,
  isPro,
  district,
  worksOnline,
  acceptsAtOwnPlace,
  travelsToClient,
  avgResponseTimeMinutes,
  services,
  categories,
  portfolio,
}: ExecutorCardProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const minPriceService =
    services.length > 0
      ? services.reduce((min, s) => (s.priceFrom < min.priceFrom ? s : min), services[0])
      : null

  const online = isOnline(user.lastSeenAt)
  const isTopSpecialist = ratingAvg >= 4.8 && reviewsCount >= 10
  const respondsQuickly = avgResponseTimeMinutes != null && avgResponseTimeMinutes <= 60

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200/60 shadow-sm ring-1 ring-slate-900/5 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-blue-200 transition-all duration-400 flex flex-col group h-full">
      {/* Portfolio Header Image */}
      {portfolio.length > 0 ? (
        <div className="relative h-36 bg-slate-100 shrink-0 overflow-hidden">
          <Image
            src={portfolio[0].imageUrl}
            alt="Портфолио"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0"></div>
      )}

      {/* Main Content Area */}
      <div className="p-6 pt-0 flex flex-col flex-1 relative">
        {/* Avatar (Overlapping Image) */}
        <div className="relative shrink-0 -mt-10 mb-3 flex items-end justify-between">
          <div className="relative inline-block">
            <Avatar className="h-20 w-20 ring-4 ring-white shadow-md">
              <AvatarImage src={user.avatarUrl ?? undefined} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {online && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            )}
          </div>

          {/* Quick Stats Pill */}
          {reviewsCount > 0 && (
            <div className="mb-2 bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-slate-200/50 rounded-full px-3 py-1 flex items-center gap-1.5 transform translate-y-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-slate-900">{ratingAvg.toFixed(2)}</span>
              <span className="text-xs font-semibold text-slate-400">({reviewsCount})</span>
            </div>
          )}
        </div>

        {/* User Info & Badges */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
              <Link href={`/executor/${id}`} className="before:absolute before:inset-0 block truncate">
                {user.name}
              </Link>
            </h3>
            {isVerified && (
              <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0" aria-label="Проверен" />
            )}
            {isPro && (
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                PRO
              </div>
            )}
          </div>

          <p className="text-sm font-medium text-slate-500 mb-3 line-clamp-1">
            {categories.map((c) => c.category.name).join(', ')}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {isTopSpecialist && (
              <div className="bg-amber-50 text-amber-700 border border-amber-200/50 text-xs font-bold px-2.5 py-1 rounded-full flex items-center shadow-sm">
                Топ мастер
              </div>
            )}
            {respondsQuickly && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-xs font-bold px-2.5 py-1 rounded-full flex items-center shadow-sm">
                <Zap className="h-3 w-3 mr-1 fill-emerald-500" /> Быстро отвечает
              </div>
            )}
          </div>

          {/* Location */}
          {(district || worksOnline || travelsToClient || acceptsAtOwnPlace) && (
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4 bg-slate-50 rounded-xl p-2.5 ring-1 ring-slate-100">
              <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
              <span className="truncate">
                {[district, worksOnline ? 'Онлайн' : null, travelsToClient ? 'Выезд' : null, acceptsAtOwnPlace ? 'У себя' : null].filter(Boolean).join(' · ')}
              </span>
            </div>
          )}

          {/* Services Section */}
          <div className="mt-auto pt-2">
            {services.length > 0 ? (
              <div className="space-y-2 mb-4">
                {services.slice(0, 2).map((service, i) => (
                  <div key={i} className="flex justify-between items-center text-sm group/service">
                    <span className="text-slate-600 font-medium truncate pr-4 group-hover/service:text-slate-900 transition-colors">{service.name}</span>
                    <span className="font-bold text-slate-900 shrink-0 bg-slate-100 px-2 py-0.5 rounded-md">
                      {formatPrice(service.priceFrom, service.priceType)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-4 text-sm font-medium text-slate-400 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> Прайс-лист не заполнен
              </div>
            )}
          </div>

          {/* Bottom Action Area */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {minPriceService ? (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Услуги</span>
                <span className="text-lg font-black text-blue-600">
                  {formatPrice(minPriceService.priceFrom, minPriceService.priceType)}
                </span>
              </div>
            ) : (
              <div></div>
            )}
            <Button
              className="rounded-full bg-slate-900 hover:bg-blue-600 text-white font-bold px-6 shadow-md hover:shadow-lg transition-all z-10 relative pointer-events-none group-hover:bg-blue-600"
            >
              Перейти
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

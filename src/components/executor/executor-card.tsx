import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, CheckCircle, Briefcase } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type PriceType = 'FIXED' | 'FROM' | 'RANGE' | 'NEGOTIABLE' | 'PER_HOUR'

export interface ExecutorCardProps {
  id: string
  user: {
    name: string
    avatarUrl: string | null
  }
  ratingAvg: number
  reviewsCount: number
  isVerified: boolean
  isPro: boolean
  district: string | null
  worksOnline: boolean
  acceptsAtOwnPlace: boolean
  travelsToClient: boolean
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

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      <CardContent className="p-0 flex flex-col flex-1">
        {/* Portfolio preview image */}
        {portfolio.length > 0 && (
          <div className="relative h-32 bg-muted shrink-0">
            <Image
              src={portfolio[0].imageUrl}
              alt="Портфолио"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="p-4 space-y-3 flex flex-col flex-1">
          {/* Header: avatar + name + rating */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                {isVerified && (
                  <CheckCircle
                    className="h-4 w-4 text-primary shrink-0"
                    aria-label="Верифицирован"
                  />
                )}
                {isPro && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                    PRO
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {categories.map((c) => c.category.name).join(', ')}
              </p>
              {reviewsCount > 0 ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{ratingAvg.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({reviewsCount})</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground mt-0.5 block">Нет отзывов</span>
              )}
            </div>
          </div>

          {/* Location */}
          {(district || worksOnline || travelsToClient || acceptsAtOwnPlace) && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {[district, worksOnline ? 'Онлайн' : null, travelsToClient ? 'Выезд' : null, acceptsAtOwnPlace ? 'У себя' : null].filter(Boolean).join(' · ')}
              </span>
            </div>
          )}

          {/* Services preview */}
          {services.length > 0 && (
            <div className="space-y-1">
              {services.slice(0, 2).map((service, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground truncate">{service.name}</span>
                  <span className="font-medium text-foreground shrink-0">
                    {formatPrice(service.priceFrom, service.priceType)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Spacer to push footer down */}
          <div className="flex-1" />

          {/* Min price + CTA */}
          <div className="flex items-center justify-between pt-1 border-t border-border">
            {minPriceService ? (
              <div className="text-sm">
                <span className="text-muted-foreground">Услуги </span>
                <span className="font-semibold text-foreground">
                  {formatPrice(minPriceService.priceFrom, minPriceService.priceType)}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                Нет услуг
              </span>
            )}
            <Button size="sm" asChild>
              <Link href={`/executor/${id}`}>Подробнее</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

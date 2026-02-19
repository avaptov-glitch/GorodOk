import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const SITE_NAME = 'ГородОк'
const SITE_DESCRIPTION =
  'ГородОк: маркетплейс услуг вашего города. Репетиторы, сантехники, тренеры и другие специалисты — быстро и удобно.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ГородОк — найди исполнителя рядом',
    template: '%s | ГородОк',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'исполнители', 'услуги', 'маркетплейс', 'репетиторы', 'сантехники',
    'тренеры', 'клининг', 'ремонт', 'мастера', 'специалисты', 'Вологда',
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'ГородОк — найди исполнителя рядом',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ГородОк — найди исполнителя рядом',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ГородОк',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Pre-fetch сессии на сервере, чтобы SessionProvider получил её сразу без лишнего запроса
  const session = await getServerSession(authOptions)

  // Обновляем lastSeenAt для отслеживания онлайн-статуса (fire-and-forget)
  if (session?.user?.id) {
    prisma.user
      .update({ where: { id: session.user.id }, data: { lastSeenAt: new Date() } })
      .catch(() => {})
  }

  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers session={session}>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

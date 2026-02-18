import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

export const metadata: Metadata = {
  title: 'ГородОк — найди исполнителя рядом',
  description: 'ГородОк: маркетплейс услуг вашего города. Репетиторы, сантехники, тренеры и другие специалисты — быстро и удобно.',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Pre-fetch сессии на сервере, чтобы SessionProvider получил её сразу без лишнего запроса
  const session = await getServerSession(authOptions)

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

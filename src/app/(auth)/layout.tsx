import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    template: '%s | ГородОк',
    default: 'Вход',
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-base leading-none">Г</span>
        </div>
        <span className="text-2xl font-bold text-primary">ГородОк</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}

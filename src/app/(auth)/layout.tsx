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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Premium Background Blurs */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/10 to-transparent rounded-full blur-[100px] -z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-400/10 via-teal-300/10 to-transparent rounded-full blur-[80px] -z-10 translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>

      <Link href="/" className="mb-10 flex items-center gap-3 group relative z-10 transition-transform hover:scale-105 duration-300">
        <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_4px_20px_rgba(37,99,235,0.4)] relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-white font-black text-2xl leading-none font-sans tracking-tight">Г</span>
        </div>
        <span className="text-3xl font-extrabold text-slate-900 tracking-[-0.03em]">
          ГородОк<span className="text-blue-600">.</span>
        </span>
      </Link>

      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  )
}

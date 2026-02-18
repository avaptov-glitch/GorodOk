import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Только администраторы могут заходить в /admin
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Пропускаем только авторизованных пользователей
      authorized: ({ token }) => token !== null,
    },
    pages: {
      signIn: '/login',
    },
  }
)

// Middleware применяется к защищённым маршрутам
// Паттерн (/:path*)? покрывает как /dashboard, так и /dashboard/client/orders
export const config = {
  matcher: ['/dashboard(/:path*)?', '/admin(/:path*)?'],
}

import type { Role } from '@/generated/prisma/client'

// Расширение типов NextAuth — добавляем кастомные поля в Session и JWT
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string | null
      role: Role
    }
  }

  interface User {
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
}

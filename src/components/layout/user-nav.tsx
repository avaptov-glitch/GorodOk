'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import type { Session } from 'next-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, LogOut, Settings } from 'lucide-react'

interface UserNavProps {
  user: Session['user']
}

export function UserNav({ user }: UserNavProps) {
  const initials =
    user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? 'U'

  const dashboardHref =
    user.role === 'ADMIN'
      ? '/admin'
      : user.role === 'EXECUTOR'
        ? '/dashboard/executor/profile'
        : '/dashboard/client/orders'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ''} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardHref} className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="h-4 w-4" />
            Личный кабинет
          </Link>
        </DropdownMenuItem>
        {user.role === 'CLIENT' && (
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/client/settings"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              Настройки
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

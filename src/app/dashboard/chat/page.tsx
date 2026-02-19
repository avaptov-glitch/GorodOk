export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getConversations } from '@/actions/chat'
import { ChatLayout } from '@/components/chat/chat-layout'

export const metadata: Metadata = {
  title: 'Чат',
}

export default async function ChatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const result = await getConversations()
  const conversations = result.success && result.data ? result.data : []

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Чат</h1>
      <ChatLayout initialConversations={conversations} />
    </div>
  )
}

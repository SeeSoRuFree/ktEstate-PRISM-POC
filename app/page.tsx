'use client'

import { AppLayout } from '@/components/layout'
import { ChatInterface } from '@/components/search'

export default function HomePage() {
  return (
    <AppLayout showSearch={true}>
      <div className="h-[calc(100vh-8rem)]">
        <ChatInterface />
      </div>
    </AppLayout>
  )
}

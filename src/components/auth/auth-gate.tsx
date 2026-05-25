
"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/firebase'
import { Loader2 } from 'lucide-react'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login')
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="size-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">جاري التحقق من الهوية...</p>
      </div>
    )
  }

  if (!user && pathname !== '/login') {
    return null
  }

  return <>{children}</>
}

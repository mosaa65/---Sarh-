"use client"

import React from 'react'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Menu,
  ChevronLeft
} from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'لوحة التحكم', href: '/', icon: LayoutDashboard },
  { name: 'العقارات', href: '/properties', icon: Building2 },
  { name: 'المستأجرين', href: '/tenants', icon: Users },
  { name: 'العقود', href: '/contracts', icon: FileText },
  { name: 'الدفعات', href: '/payments', icon: CreditCard },
  { name: 'التقارير', href: '/reports', icon: BarChart3 },
]

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-l" side="right">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl text-primary-foreground">
                <Building2 className="size-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-headline tracking-tight">مدى إنماء</h1>
                <p className="text-xs text-muted-foreground">لإدارة العقارات</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4 py-2">
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} className="py-6 px-4">
                      <Link href={item.href} className="flex items-center gap-4 text-base font-medium">
                        <item.icon className={`size-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6 border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="py-6 px-4">
                  <Settings className="size-5 text-muted-foreground" />
                  <span className="font-medium">الإعدادات</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 border-b bg-card px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="relative max-w-md hidden md:block">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="بحث عن عقار، مستأجر أو عقد..." 
                  className="bg-muted/50 border-none rounded-full pr-10 pl-4 py-2 text-sm w-80 focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="size-5" />
                <span className="absolute top-2 left-2 size-2 bg-destructive rounded-full border-2 border-card" />
              </Button>
              <div className="flex items-center gap-3 pr-4 border-r">
                <div className="text-left">
                  <p className="text-sm font-bold font-headline">أحمد المالك</p>
                  <p className="text-[10px] text-muted-foreground">مسؤول النظام</p>
                </div>
                <Avatar className="size-9 ring-2 ring-primary/10">
                  <AvatarImage src="https://picsum.photos/seed/admin/100/100" />
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 bg-background">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

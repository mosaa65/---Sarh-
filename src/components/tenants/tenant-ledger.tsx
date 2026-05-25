"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Phone, Mail, FileText, Calendar, Plus, Search } from 'lucide-react'

const tenants = [
  {
    id: 1,
    name: 'محمد بن عبدالله العتيبي',
    unit: 'عمارة السلام - شقة 102',
    phone: '0501234567',
    email: 'mohammed@example.com',
    status: 'active',
    balance: 0,
    avatar: 'https://picsum.photos/seed/user1/100/100'
  },
  {
    id: 2,
    name: 'سارة خالد القحطاني',
    unit: 'فيلا المرجان',
    phone: '0509876543',
    email: 'sara@example.com',
    status: 'active',
    balance: -2500,
    avatar: 'https://picsum.photos/seed/user2/100/100'
  },
  {
    id: 3,
    name: 'شركة التقنية المحدودة',
    unit: 'برج النخيل - مكتب 401',
    phone: '0112233445',
    email: 'contact@tech-inc.com',
    status: 'warning',
    balance: -12400,
    avatar: 'https://picsum.photos/seed/user3/100/100'
  },
  {
    id: 4,
    name: 'عبدالرحمن الشهري',
    unit: 'عمارة السلام - شقة 205',
    phone: '0554433221',
    email: 'a.shehri@example.com',
    status: 'inactive',
    balance: 0,
    avatar: 'https://picsum.photos/seed/user4/100/100'
  }
]

export function TenantLedger() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-slate-900 tracking-tight">سجل المستأجرين الموحد</h2>
          <p className="text-slate-500 mt-1">دليل كامل لبيانات المستأجرين وتاريخ التواصل.</p>
        </div>
        <Button className="gap-2 rounded-xl h-12 shadow-lg shadow-primary/20">
          <Plus className="size-5" />
          إضافة مستأجر جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="bento-card border-none shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <Avatar className="size-16 ring-4 ring-primary/10">
                  <AvatarImage src={tenant.avatar} />
                  <AvatarFallback>{tenant.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={tenant.status === 'active' ? 'default' : tenant.status === 'warning' ? 'secondary' : 'outline'} className="rounded-lg px-3 py-1">
                    {tenant.status === 'active' ? 'نشط' : tenant.status === 'warning' ? 'متأخر' : 'منتهي'}
                  </Badge>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                    <MoreHorizontal className="size-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="text-xl font-bold font-headline">{tenant.name}</h3>
                <p className="text-sm text-primary font-medium">{tenant.unit}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">رقم الجوال</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="size-3 text-muted-foreground" />
                    {tenant.phone}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">الرصيد</p>
                  <p className={`text-sm font-bold ${tenant.balance < 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {tenant.balance === 0 ? 'لا يوجد' : `${Math.abs(tenant.balance).toLocaleString()} ر.س`}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2 rounded-xl" variant="outline">
                  <FileText className="size-4" />
                  العقد
                </Button>
                <Button className="flex-1 gap-2 rounded-xl" variant="outline">
                  <Phone className="size-4" />
                  اتصال
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

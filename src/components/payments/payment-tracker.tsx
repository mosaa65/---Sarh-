"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Plus, Filter, Search, CreditCard, Banknote, Landmark } from 'lucide-react'

const payments = [
  { id: 'PAY-1001', tenant: 'محمد العتيبي', property: 'عمارة السلام', amount: '45,000 ر.س', date: '01 مارس 2024', method: 'تحويل بنكي', status: 'paid' },
  { id: 'PAY-1002', tenant: 'سارة خالد', property: 'فيلا المرجان', amount: '12,000 ر.س', date: '28 فبراير 2024', method: 'مدى', status: 'paid' },
  { id: 'PAY-1003', tenant: 'شركة التقنية', property: 'برج النخيل', amount: '24,000 ر.س', date: '15 فبراير 2024', method: 'شيك', status: 'pending' },
  { id: 'PAY-1004', tenant: 'عبدالرحمن الشهري', property: 'عمارة السلام', amount: '3,500 ر.س', date: '10 فبراير 2024', method: 'نقدي', status: 'failed' },
]

export function PaymentTracker() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-slate-900 tracking-tight">تتبع الدفعات</h2>
          <p className="text-slate-500 mt-1">إدارة الإيرادات، المستحقات، وحالة التحصيل المالي.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Download className="size-4" />
            تصدير كشف حساب
          </Button>
          <Button className="gap-2 rounded-xl">
            <Plus className="size-4" />
            سند قبض جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bento-card border-none bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-80">إجمالي المحصل (هذا الشهر)</p>
                <h3 className="text-3xl font-bold font-headline mt-1">132,720 ر.س</h3>
              </div>
              <Banknote className="size-8 opacity-20" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <Badge className="bg-white/20 text-white hover:bg-white/30">+15%</Badge>
              <span>مقارنة بالشهر الماضي</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bento-card border-none bg-slate-900 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-80">مستحقات غير محصلة</p>
                <h3 className="text-3xl font-bold font-headline mt-1">28,400 ر.س</h3>
              </div>
              <Landmark className="size-8 opacity-20" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <Badge variant="destructive">تأخير في 5 وحدات</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bento-card border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">طرق الدفع الأكثر استخداماً</p>
                <h3 className="text-xl font-bold font-headline mt-1">التحويل البنكي</h3>
              </div>
              <CreditCard className="size-8 text-primary/40" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex -space-x-1 space-x-reverse">
                <div className="size-6 rounded-full bg-slate-100 border flex items-center justify-center"><CreditCard className="size-3" /></div>
                <div className="size-6 rounded-full bg-slate-100 border flex items-center justify-center"><Banknote className="size-3" /></div>
              </div>
              <span className="text-xs text-muted-foreground">72% من العمليات بنكية</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
          <CardTitle className="text-lg font-headline">آخر العمليات المالية</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input type="text" placeholder="بحث برقم السند..." className="h-9 rounded-lg border bg-background pr-9 pl-3 text-xs w-48 focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="size-4" />
              تصفية
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>رقم السند</TableHead>
                <TableHead>المستأجر</TableHead>
                <TableHead>العقار</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                  <TableCell className="font-bold">{payment.tenant}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.property}</TableCell>
                  <TableCell className="font-bold text-primary">{payment.amount}</TableCell>
                  <TableCell className="text-xs">{payment.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">{payment.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      payment.status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : 
                      payment.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-none' : 
                      'bg-red-100 text-red-700 hover:bg-red-100 border-none'
                    }>
                      {payment.status === 'paid' ? 'مدفوع' : payment.status === 'pending' ? 'معلق' : 'فشل'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    <Button variant="ghost" size="sm">تحميل</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  Plus, 
  Filter, 
  Search, 
  CreditCard, 
  Banknote, 
  Landmark, 
  MessageSquare, 
  Send,
  MoreVertical,
  Printer
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const initialPayments = [
  { id: 'PAY-1001', tenant: 'محمد العتيبي', phone: '0501234567', property: 'عمارة السلام', amount: '45,000 ر.س', date: '01 مارس 2024', method: 'تحويل بنكي', status: 'paid' },
  { id: 'PAY-1002', tenant: 'سارة خالد', phone: '0555555555', property: 'فيلا المرجان', amount: '12,000 ر.س', date: '28 فبراير 2024', method: 'مدى', status: 'paid' },
  { id: 'PAY-1003', tenant: 'شركة التقنية', phone: '0566666666', property: 'برج النخيل', amount: '24,000 ر.س', date: '15 فبراير 2024', method: 'شيك', status: 'pending' },
  { id: 'PAY-1004', tenant: 'عبدالرحمن الشهري', phone: '0577777777', property: 'عمارة السلام', amount: '3,500 ر.س', date: '10 فبراير 2024', method: 'نقدي', status: 'failed' },
]

export function PaymentTracker() {
  const [searchTerm, setSearchTerm] = useState('')

  const handleWhatsApp = (phone: string, tenant: string, amount: string) => {
    const message = `مرحباً ${tenant}، نود تذكيركم بسداد دفعة الإيجار المستحقة وقدرها ${amount}. شكراً لكم.`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleSMS = (phone: string, tenant: string, amount: string) => {
    const message = `مرحباً ${tenant}، نود تذكيركم بسداد دفعة الإيجار بقيمة ${amount}.`
    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`
  }

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
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-muted/20">
          <CardTitle className="text-lg font-headline">آخر العمليات المالية</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="بحث برقم السند..." 
                className="h-10 rounded-xl border bg-background pr-10 pl-4 text-sm w-full md:w-64 focus:ring-2 focus:ring-primary outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-10 gap-2 rounded-xl">
              <Filter className="size-4" />
              تصفية
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-right">رقم السند</TableHead>
                  <TableHead className="text-right">المستأجر</TableHead>
                  <TableHead className="text-right">العقار</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">طريقة الدفع</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialPayments.filter(p => p.id.includes(searchTerm) || p.tenant.includes(searchTerm)).map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/10">
                    <TableCell className="font-mono text-xs font-medium">{payment.id}</TableCell>
                    <TableCell>
                      <div className="font-bold text-sm">{payment.tenant}</div>
                      <div className="text-[10px] text-muted-foreground">{payment.phone}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{payment.property}</TableCell>
                    <TableCell className="font-bold text-primary text-sm whitespace-nowrap">{payment.amount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{payment.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium text-[10px] py-0">{payment.method}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        payment.status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-none' : 
                        payment.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-none' : 
                        'bg-red-100 text-red-700 hover:bg-red-200 border-none'
                      }>
                        {payment.status === 'paid' ? 'مدفوع' : payment.status === 'pending' ? 'معلق' : 'فشل'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="size-8 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleWhatsApp(payment.phone, payment.tenant, payment.amount)}>
                          <MessageSquare className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleSMS(payment.phone, payment.tenant, payment.amount)}>
                          <Send className="size-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 justify-end">
                              <Printer className="size-4" /> طباعة السند
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 justify-end text-primary">
                              <Download className="size-4" /> تحميل PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

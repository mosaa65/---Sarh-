
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
  Printer,
  Loader2
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCollection, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

export function PaymentTracker() {
  const db = useFirestore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: payments, loading } = useCollection(
    db ? query(collection(db, 'payments'), orderBy('date', 'desc')) : null
  )

  const handleWhatsApp = (payment: any) => {
    let message = ""
    if (payment.status === 'paid') {
      message = `مرحباً أستاذ/ة ${payment.tenantName}، نؤكد لكم استلام مبلغ ${payment.amount} ر.س مقابل إيجار ${payment.propertyName}. شكراً لالتزامكم.`
    } else {
      message = `مرحباً أستاذ/ة ${payment.tenantName}، نود تذكيركم بسداد الدفعة المستحقة لـ ${payment.propertyName} وقدرها ${payment.amount} ر.س. يرجى السداد في أقرب وقت.`
    }
    window.open(`https://wa.me/${payment.tenantPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleNewReceipt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const newPayment = {
      tenantName: formData.get('tenantName') as string,
      tenantPhone: formData.get('tenantPhone') as string,
      propertyName: formData.get('propertyName') as string,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      method: formData.get('method') as string,
      status: formData.get('status') as string,
      receiptNo: `PAY-${Date.now().toString().slice(-4)}`,
      createdAt: serverTimestamp(),
    }

    const paymentsRef = collection(db, 'payments')
    addDoc(paymentsRef, newPayment)
      .then(() => {
        toast({ title: "تم تسجيل السند", description: "تمت إضافة دفعة جديدة بنجاح." })
        setIsDialogOpen(false)
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: paymentsRef.path,
          operation: 'create',
          requestResourceData: newPayment,
        })
        errorEmitter.emit('permission-error', permissionError)
      })
      .finally(() => setIsSubmitting(false))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-slate-900 tracking-tight">تتبع الدفعات المالية</h2>
          <p className="text-slate-500 mt-1">إدارة الإيرادات، المستحقات، وسندات القبض.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Download className="size-4" />
            تصدير كشف حساب
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl h-12 shadow-lg shadow-primary/20">
                <Plus className="size-4" />
                سند قبض جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-xl">إصدار سند قبض جديد</DialogTitle>
                <DialogDescription>أدخل تفاصيل الدفعة المستلمة لتسجيلها في النظام.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewReceipt} className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                  <Label>اسم المستأجر</Label>
                  <Input name="tenantName" required placeholder="مثلاً: فهد السبيعي" />
                </div>
                <div className="space-y-2">
                  <Label>رقم الجوال</Label>
                  <Input name="tenantPhone" required placeholder="05xxxxxxxx" />
                </div>
                <div className="space-y-2">
                  <Label>اسم العقار</Label>
                  <Input name="propertyName" required placeholder="عمارة النرجس" />
                </div>
                <div className="space-y-2">
                  <Label>المبلغ (ر.س)</Label>
                  <Input name="amount" type="number" required placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>التاريخ</Label>
                  <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>
                  <Select name="method" defaultValue="mada">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="mada">بطاقة مدى</SelectItem>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="check">شيك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select name="status" defaultValue="paid">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">مدفوع</SelectItem>
                      <SelectItem value="pending">معلق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="col-span-2 pt-4">
                  <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    حفظ وتسجيل السند
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bento-card border-none bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-80">إجمالي المحصل</p>
                <h3 className="text-3xl font-bold font-headline mt-1">
                  {payments?.reduce((acc: any, p: any) => p.status === 'paid' ? acc + Number(p.amount) : acc, 0).toLocaleString()} ر.س
                </h3>
              </div>
              <Banknote className="size-8 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bento-card border-none bg-slate-900 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-80">مستحقات معلقة</p>
                <h3 className="text-3xl font-bold font-headline mt-1">
                   {payments?.reduce((acc: any, p: any) => p.status === 'pending' ? acc + Number(p.amount) : acc, 0).toLocaleString()} ر.س
                </h3>
              </div>
              <Landmark className="size-8 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bento-card border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">عدد العمليات</p>
                <h3 className="text-3xl font-bold font-headline mt-1">{payments?.length || 0}</h3>
              </div>
              <CreditCard className="size-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-muted/20">
          <CardTitle className="text-lg font-headline">سجل العمليات المالية</CardTitle>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="بحث باسم المستأجر..." 
              className="h-10 rounded-xl border bg-background pr-10 pl-4 text-sm w-full md:w-64 focus:ring-2 focus:ring-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                  <TableHead className="text-left px-6">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-10">جاري التحميل...</TableCell></TableRow>
                ) : payments?.filter((p: any) => p.tenantName.includes(searchTerm)).map((payment: any) => (
                  <TableRow key={payment.id} className="hover:bg-muted/10">
                    <TableCell className="font-mono text-xs font-medium">{payment.receiptNo}</TableCell>
                    <TableCell>
                      <div className="font-bold text-sm">{payment.tenantName}</div>
                      <div className="text-[10px] text-muted-foreground">{payment.tenantPhone}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{payment.propertyName}</TableCell>
                    <TableCell className="font-bold text-primary text-sm whitespace-nowrap">{Number(payment.amount).toLocaleString()} ر.س</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{payment.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium text-[10px] py-0">{payment.method === 'mada' ? 'مدى' : payment.method === 'bank_transfer' ? 'تحويل' : 'نقدي'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        payment.status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-none' : 
                        'bg-amber-100 text-amber-700 hover:bg-amber-200 border-none'
                      }>
                        {payment.status === 'paid' ? 'مدفوع' : 'معلق'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left px-6">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-8 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50" 
                          title={payment.status === 'paid' ? 'إرسال شكر' : 'إرسال تذكير'}
                          onClick={() => handleWhatsApp(payment)}
                        >
                          <MessageSquare className="size-4" />
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

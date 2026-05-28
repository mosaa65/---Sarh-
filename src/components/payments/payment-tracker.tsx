
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Search, MessageSquare, MoreVertical, Printer, Loader2, FileDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCollection, useFirestore, useUser } from '@/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, where, doc, updateDoc, increment } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

export function PaymentTracker() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: tenants } = useCollection(
    user ? query(collection(db, 'tenants'), where('ownerId', '==', user.uid)) : null
  )

  const { data: payments, loading } = useCollection(
    user ? query(collection(db, 'payments'), where('ownerId', '==', user.uid), orderBy('date', 'desc')) : null
  )

  const handleWhatsApp = (payment: any) => {
    const message = payment.status === 'paid' 
      ? `نؤكد استلام مبلغ ${Number(payment.amount).toLocaleString()} ر.س من ${payment.tenantName} مقابل إيجار ${payment.propertyName}. رقم السند: ${payment.receiptNo}. شكراً لكم.`
      : `تذكير لـ ${payment.tenantName}: نرجو سداد إيجار ${payment.propertyName} بمبلغ ${Number(payment.amount).toLocaleString()} ر.س. شكراً لتفهمكم.`;
    window.open(`https://wa.me/${payment.tenantPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleNewReceipt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !db) return
    
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const tenantId = formData.get('tenantId') as string;
    const tenant = tenants?.find(t => t.id === tenantId);
    
    if (!tenant) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى اختيار مستأجر." });
      setIsSubmitting(false);
      return;
    }

    const amount = Number(formData.get('amount'));
    const receiptNo = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newPayment = {
      tenantId: tenantId,
      tenantName: tenant.name,
      tenantPhone: tenant.phone,
      propertyId: tenant.propertyId || '',
      propertyName: tenant.propertyName || 'عقار غير محدد',
      amount: amount,
      date: formData.get('date') as string,
      method: formData.get('method') as string,
      status: formData.get('status') as string,
      receiptNo: receiptNo,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    }

    try {
      await addDoc(collection(db, 'payments'), newPayment);
      if (newPayment.status === 'paid') {
        await updateDoc(doc(db, 'tenants', tenantId), {
          accumulatedDebt: increment(-amount)
        });
      }
      toast({ title: "تم تسجيل السند", description: `رقم السند ${receiptNo}` })
      setIsDialogOpen(false)
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحفظ" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredPayments = payments?.filter((p: any) => 
    p.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.receiptNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-headline text-slate-900">التحصيل المالي</h2>
          <p className="text-slate-500 mt-1">إدارة سندات القبض والتدفقات النقدية.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl h-12 shadow-lg">
              <Plus className="size-5" />
              سند قبض جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl text-right">إصدار سند قبض</DialogTitle>
              <DialogDescription className="text-right">اختر المستأجر لتسجيل دفعة مالية جديدة.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNewReceipt} className="grid grid-cols-2 gap-4 py-4 text-right">
              <div className="col-span-2 space-y-2">
                <Label>المستأجر</Label>
                <Select name="tenantId" required>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="اختر المستأجر..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants?.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name} - {t.propertyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المبلغ</Label>
                <Input name="amount" type="number" required placeholder="0.00" className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select name="method" defaultValue="bank_transfer">
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="mada">بطاقة مدى</SelectItem>
                    <SelectItem value="cash">نقدي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select name="status" defaultValue="paid">
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">مدفوع</SelectItem>
                    <SelectItem value="pending">معلق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="col-span-2 pt-4 flex gap-2">
                <Button type="submit" className="flex-1 h-12 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  حفظ السند
                </Button>
                <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-muted/20 p-6">
          <CardTitle className="text-lg font-headline">سجل العمليات</CardTitle>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="بحث..." 
              className="h-10 rounded-xl border bg-background pr-10 pl-4 text-sm w-full md:w-64 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-right py-4">رقم السند</TableHead>
                <TableHead className="text-right py-4">المستأجر</TableHead>
                <TableHead className="text-right py-4">العقار</TableHead>
                <TableHead className="text-right py-4">المبلغ</TableHead>
                <TableHead className="text-right py-4">التاريخ</TableHead>
                <TableHead className="text-right py-4">طريقة الدفع</TableHead>
                <TableHead className="text-right py-4">الحالة</TableHead>
                <TableHead className="text-center py-4">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : filteredPayments?.length ? filteredPayments.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.receiptNo}</TableCell>
                  <TableCell className="font-bold">{p.tenantName}</TableCell>
                  <TableCell>{p.propertyName}</TableCell>
                  <TableCell className="font-black text-primary">{Number(p.amount).toLocaleString()} ر.س</TableCell>
                  <TableCell>{p.date}</TableCell>
                  <TableCell>{p.method === 'bank_transfer' ? 'تحويل بنكي' : p.method === 'mada' ? 'مدى' : 'نقدي'}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'paid' ? 'default' : 'outline'} className={p.status === 'paid' ? 'bg-green-100 text-green-700' : ''}>
                      {p.status === 'paid' ? 'مدفوع' : 'معلق'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleWhatsApp(p)}><MessageSquare className="size-4 text-green-600" /></Button>
                      <Button variant="ghost" size="icon"><Printer className="size-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={8} className="text-center py-10">لا توجد بيانات</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

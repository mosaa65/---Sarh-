
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Search, 
  MessageSquare, 
  MoreVertical,
  Printer,
  Loader2,
  FileDown
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCollection, useFirestore, errorEmitter, FirestorePermissionError, useUser } from '@/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, where, doc, updateDoc, increment } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

export function PaymentTracker() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // جلب المستأجرين التابعين للمستخدم لربطهم بالسند
  const { data: tenants } = useCollection(
    user ? query(collection(db, 'tenants'), where('ownerId', '==', user.uid)) : null
  )

  // جلب المدفوعات التابعة للمستخدم
  const { data: payments, loading } = useCollection(
    user ? query(collection(db, 'payments'), where('ownerId', '==', user.uid), orderBy('date', 'desc')) : null
  )

  const handleWhatsApp = (payment: any) => {
    const message = payment.status === 'paid' 
      ? `مرحباً أستاذ ${payment.tenantName}، نؤكد استلامنا لمبلغ ${Number(payment.amount).toLocaleString()} ر.س مقابل إيجار ${payment.propertyName}. رقم السند: ${payment.receiptNo}. شكراً لكم.`
      : `مرحباً أستاذ ${payment.tenantName}، نود تذكيركم بسداد المستحق لـ ${payment.propertyName} وقدره ${Number(payment.amount).toLocaleString()} ر.س. يرجى السداد في أقرب وقت لضمان استمرار الخدمات.`;
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
      toast({ variant: "destructive", title: "خطأ", description: "يرجى اختيار مستأجر صالح." });
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

    const paymentsRef = collection(db, 'payments')
    try {
      await addDoc(paymentsRef, newPayment);
      
      // تحديث مديونية المستأجر (خصم المبلغ من المتراكمات إذا كان مدفوعاً)
      if (newPayment.status === 'paid') {
        const tenantRef = doc(db, 'tenants', tenantId);
        await updateDoc(tenantRef, {
          accumulatedDebt: increment(-amount)
        });
      }

      toast({ title: "تم تسجيل السند", description: `تم إصدار السند رقم ${receiptNo} وتحديث حساب المستأجر.` })
      setIsDialogOpen(false)
    } catch (error) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: paymentsRef.path,
        operation: 'create',
        requestResourceData: newPayment,
      }));
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
          <h2 className="text-3xl font-black font-headline text-slate-900 tracking-tight">التحصيل المالي</h2>
          <p className="text-slate-500 mt-1">تتبع إيرادات عقاراتك وسندات القبض الصادرة.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl h-12 shadow-lg shadow-primary/20 px-6">
              <Plus className="size-5" />
              إصدار سند قبض
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl text-right">إصدار سند قبض مالي</DialogTitle>
              <DialogDescription className="text-right">اختر المستأجر لتسجيل دفعة مالية جديدة في حسابه.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNewReceipt} className="grid grid-cols-2 gap-4 py-4 text-right">
              <div className="col-span-2 space-y-2">
                <Label>اختيار المستأجر (من القائمة)</Label>
                <Select name="tenantId" required>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="اختر المستأجر..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants?.length ? tenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name} - {t.propertyName}</SelectItem>
                    )) : (
                      <div className="p-2 text-center text-sm text-muted-foreground">لا يوجد مستأجرين مضافين</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المبلغ (ر.س)</Label>
                <Input name="amount" type="number" required placeholder="0.00" className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select name="method" defaultValue="mada">
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
                    <SelectItem value="paid">مدفوع ومؤكد</SelectItem>
                    <SelectItem value="pending">تحت التحصيل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="col-span-2 pt-4 flex gap-2">
                <Button type="submit" className="flex-1 h-12 rounded-xl font-bold" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  حفظ السند وتحديث الرصيد
                </Button>
                <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-muted/20 p-6">
          <CardTitle className="text-lg font-headline">سجل العمليات المالية</CardTitle>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="بحث برقم السند أو الاسم..." 
              className="h-10 rounded-xl border bg-background pr-10 pl-4 text-sm w-full md:w-64 focus:ring-2 focus:ring-primary outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-right font-bold py-4">رقم السند</TableHead>
                  <TableHead className="text-right font-bold py-4">المستأجر</TableHead>
                  <TableHead className="text-right font-bold py-4">العقار</TableHead>
                  <TableHead className="text-right font-bold py-4">المبلغ</TableHead>
                  <TableHead className="text-right font-bold py-4">التاريخ</TableHead>
                  <TableHead className="text-right font-bold py-4">الحالة</TableHead>
                  <TableHead className="text-center font-bold py-4">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-20"><Loader2 className="size-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : filteredPayments?.length ? filteredPayments.map((payment: any) => (
                  <TableRow key={payment.id} className="group hover:bg-slate-50 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-slate-500">{payment.receiptNo}</TableCell>
                    <TableCell className="font-black text-slate-900">{payment.tenantName}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{payment.propertyName}</TableCell>
                    <TableCell className="font-extrabold text-primary text-base">
                      {Number(payment.amount).toLocaleString()} <span className="text-[10px] font-normal">ر.س</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{payment.date}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-md font-bold px-3 py-1 ${payment.status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                        {payment.status === 'paid' ? 'مدفوع' : 'معلق'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-9 rounded-xl text-green-600 hover:bg-green-50 hover:text-green-700 transition-all" 
                          onClick={() => handleWhatsApp(payment)}
                          title="إرسال عبر واتساب"
                        >
                          <MessageSquare className="size-5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-9 rounded-xl"><MoreVertical className="size-5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-right">
                            <DropdownMenuItem className="gap-2 justify-end cursor-pointer" onClick={() => window.print()}>
                              طباعة السند <Printer className="size-4" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 justify-end cursor-pointer text-primary">
                              تحميل PDF <FileDown className="size-4" />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                      لا توجد سجلات مالية مطابقة حالياً.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

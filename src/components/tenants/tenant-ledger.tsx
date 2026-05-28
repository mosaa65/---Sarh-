
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal, 
  Phone, 
  Mail, 
  FileText, 
  Plus, 
  Search, 
  Loader2, 
  UserPlus, 
  MessageCircle, 
  Send,
  Eye,
  Wallet,
  Zap,
  Droplets,
  CalendarCheck,
  ArrowUpRight,
  TrendingDown,
  ShieldCheck
} from 'lucide-react'
import { useCollection, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TenantLedger() {
  const db = useFirestore();
  const { data: tenants, loading } = useCollection(db ? query(collection(db, 'tenants'), orderBy('createdAt', 'desc')) : null);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const defaultAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl || 'https://picsum.photos/seed/mada4/100/100';

  const handleAddTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const newTenant = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      unitId: formData.get('unitId') as string,
      status: 'active',
      balance: 0,
      accumulatedDebt: Number(formData.get('accumulatedDebt')) || 0,
      securityDeposit: Number(formData.get('securityDeposit')) || 0,
      rentalType: formData.get('rentalType') as string,
      waterBill: 0,
      electricityBill: 0,
      avatarUrl: defaultAvatar,
      createdAt: serverTimestamp(),
    };

    const tenantsRef = collection(db, 'tenants');
    addDoc(tenantsRef, newTenant)
      .then(() => {
        toast({ title: "تم تسجيل المستأجر", description: "تمت إضافة البيانات والقيود المالية بنجاح." });
        setIsDialogOpen(false);
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: tenantsRef.path,
          operation: 'create',
          requestResourceData: newTenant,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsSubmitting(false));
  };

  const filteredTenants = tenants?.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.unitId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-slate-900 tracking-tight">سجل المستأجرين والحسابات</h2>
          <p className="text-slate-500 mt-1">إدارة شاملة للعلاقة الإيجارية والذمم المالية.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl h-12 shadow-lg shadow-primary/20">
              <Plus className="size-5" />
              تسجيل مستأجر جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl text-right">تسجيل مستأجر وقيود مالية</DialogTitle>
              <DialogDescription className="text-right">قم بتعبئة البيانات لفتح سجل مالي جديد للمستأجر.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTenant} className="grid grid-cols-2 gap-4 py-4 text-right" dir="rtl">
              <div className="col-span-2 space-y-2">
                <Label>اسم المستأجر الكامل</Label>
                <Input name="name" required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>رقم الجوال</Label>
                <Input name="phone" required placeholder="05xxxxxxxx" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>رقم/اسم الوحدة</Label>
                <Input name="unitId" required placeholder="مثلاً: شقة 5" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>مبلغ التأمين (ر.س)</Label>
                <Input name="securityDeposit" type="number" defaultValue="0" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>متراكمات سابقة (إن وجدت)</Label>
                <Input name="accumulatedDebt" type="number" defaultValue="0" className="rounded-xl" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>نوع تحصيل الإيجار</Label>
                <Select name="rentalType" defaultValue="advance">
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advance">مقدم (بداية الفترة)</SelectItem>
                    <SelectItem value="arrears">مؤخر (نهاية الفترة)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="col-span-2 pt-4 flex gap-2">
                <Button type="submit" className="w-full h-12 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  تسجيل المستأجر وفتح الحساب
                </Button>
                <Button type="button" variant="outline" className="w-full h-12 rounded-xl" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="بحث عن مستأجر أو وحدة..." 
          className="pr-10 rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />)
        ) : filteredTenants?.map((tenant: any) => (
          <Card key={tenant.id} className="bento-card border-none shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
            <div className="h-2 bg-primary" />
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <Avatar className="size-14 ring-4 ring-primary/5 shadow-sm">
                  <AvatarImage src={tenant.avatarUrl || defaultAvatar} />
                  <AvatarFallback>{tenant.name?.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <Badge variant={tenant.status === 'active' ? 'default' : 'outline'} className="rounded-md">
                  {tenant.status === 'active' ? 'عقد نشط' : 'متأخر'}
                </Badge>
              </div>

              <div className="mb-6 text-right">
                <h3 className="text-xl font-bold font-headline mb-1 text-slate-900">{tenant.name}</h3>
                <p className="text-sm text-primary font-extrabold flex items-center justify-end gap-1">
                  {tenant.unitId}
                  <ArrowUpRight className="size-3" />
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-muted-foreground font-bold mb-1 uppercase tracking-tight">إجمالي المديونية</p>
                  <p className="font-extrabold text-sm text-destructive">{(tenant.balance + tenant.accumulatedDebt).toLocaleString()} ر.س</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-muted-foreground font-bold mb-1 uppercase tracking-tight">رصيد التأمين</p>
                  <p className="font-extrabold text-sm text-green-600">{(tenant.securityDeposit || 0).toLocaleString()} ر.س</p>
                </div>
              </div>

              <div className="mt-auto flex gap-2 pt-4 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 gap-2 rounded-xl h-11">
                      <Eye className="size-4" />
                      كشف حساب
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] text-right" dir="rtl">
                    <DialogHeader>
                      <DialogTitle className="font-headline text-xl text-right">الملف المالي للمستأجر</DialogTitle>
                      <DialogDescription className="text-right">نظرة شاملة على المستحقات، التأمينات، والخدمات لـ {tenant.name}.</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="overview" className="w-full mt-4">
                      <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="overview" className="rounded-lg">نظرة مالية</TabsTrigger>
                        <TabsTrigger value="bills" className="rounded-lg">الخدمات</TabsTrigger>
                        <TabsTrigger value="contract" className="rounded-lg">العقد</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-6 bg-primary/5 border-primary/10 rounded-2xl">
                            <Wallet className="size-6 text-primary mb-3" />
                            <p className="text-xs text-muted-foreground font-bold mb-1">الرصيد المتراكم</p>
                            <p className="text-2xl font-black text-slate-900">{(tenant.accumulatedDebt || 0).toLocaleString()} <span className="text-xs">ر.س</span></p>
                          </Card>
                          <Card className="p-6 bg-green-50 border-green-100 rounded-2xl">
                            <ShieldCheck className="size-6 text-green-600 mb-3" />
                            <p className="text-xs text-muted-foreground font-bold mb-1">مبلغ التأمين (أمانة)</p>
                            <p className="text-2xl font-black text-green-700">{(tenant.securityDeposit || 0).toLocaleString()} <span className="text-xs">ر.س</span></p>
                          </Card>
                        </div>
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                          <Droplets className="size-5 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            ملاحظة: مبلغ التأمين يبقى محفوظاً كأمانة ويسترد عند انتهاء العقد في حال تسليم الوحدة بحالتها الأصلية.
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent value="bills" className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between items-center p-4 bg-white border rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="bg-amber-100 p-2 rounded-lg"><Zap className="size-5 text-amber-600" /></div>
                              <span className="font-bold text-slate-800">فاتورة الكهرباء المستحقة</span>
                            </div>
                            <span className="text-destructive font-black">{(tenant.electricityBill || 0).toLocaleString()} ر.س</span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-white border rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded-lg"><Droplets className="size-5 text-blue-600" /></div>
                              <span className="font-bold text-slate-800">فاتورة المياه المستحقة</span>
                            </div>
                            <span className="text-destructive font-black">{(tenant.waterBill || 0).toLocaleString()} ر.س</span>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="contract">
                        <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-sm font-bold">طريقة الدفع:</span>
                            <Badge variant="secondary" className="font-bold">
                              {tenant.rentalType === 'advance' ? 'دفع مقدم (بداية الفترة)' : 'دفع مؤخر (نهاية الفترة)'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center border-t pt-4">
                            <span className="text-muted-foreground text-sm font-bold">تاريخ البدء:</span>
                            <span className="font-bold text-slate-800">1445/08/01 هـ</span>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <DialogFooter className="mt-8 border-t pt-4">
                       <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={() => window.print()}>
                          <Printer className="size-4" />
                          طباعة كشف الحساب
                       </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button className="flex-1 gap-2 rounded-xl bg-green-600 hover:bg-green-700 h-11" asChild>
                   <a href={`https://wa.me/${tenant.phone}`} target="_blank">
                      <MessageCircle className="size-4" />
                      واتساب
                   </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && filteredTenants?.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <UserPlus className="size-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-600">لم يتم العثور على مستأجرين</h3>
            <p className="text-sm text-slate-400">حاول البحث بكلمة أخرى أو سجل مستأجراً جديداً.</p>
          </div>
        )}
      </div>
    </div>
  )
}

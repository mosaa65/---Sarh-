
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
  CalendarCheck
} from 'lucide-react'
import { useCollection, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
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
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  const defaultAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl || 'https://picsum.photos/seed/mada4/100/100';

  const handleAddTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
              <DialogTitle className="font-headline text-xl">تسجيل مستأجر وقيود مالية</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTenant} className="grid grid-cols-2 gap-4 py-4 text-right">
              <div className="col-span-2 space-y-2">
                <Label>اسم المستأجر الكامل</Label>
                <Input name="name" required />
              </div>
              <div className="space-y-2">
                <Label>رقم الجوال</Label>
                <Input name="phone" required placeholder="05xxxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label>رقم/اسم الوحدة</Label>
                <Input name="unitId" required placeholder="مثلاً: شقة 5" />
              </div>
              <div className="space-y-2">
                <Label>مبلغ التأمين (ر.س)</Label>
                <Input name="securityDeposit" type="number" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label>متراكمات سابقة (إن وجدت)</Label>
                <Input name="accumulatedDebt" type="number" defaultValue="0" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>نوع تحصيل الإيجار</Label>
                <Select name="rentalType" defaultValue="advance">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advance">مقدم (بداية الفترة)</SelectItem>
                    <SelectItem value="arrears">مؤخر (نهاية الفترة)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="col-span-2 pt-4">
                <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  تسجيل المستأجر وفتح الحساب
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />)
        ) : tenants?.map((tenant: any) => (
          <Card key={tenant.id} className="bento-card border-none shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <Avatar className="size-14 ring-4 ring-primary/5">
                  <AvatarImage src={tenant.avatarUrl || defaultAvatar} />
                  <AvatarFallback>{tenant.name?.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <Badge variant={tenant.status === 'active' ? 'default' : 'outline'}>
                  {tenant.status === 'active' ? 'نشط' : 'متأخر'}
                </Badge>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold font-headline mb-1">{tenant.name}</h3>
                <p className="text-sm text-primary font-bold">{tenant.unitId}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl border">
                  <p className="text-[10px] text-muted-foreground font-bold mb-1">الرصيد المتبقي</p>
                  <p className="font-bold text-sm">{(tenant.balance + tenant.accumulatedDebt).toLocaleString()} ر.س</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border">
                  <p className="text-[10px] text-muted-foreground font-bold mb-1">مبلغ التأمين</p>
                  <p className="font-bold text-sm text-green-600">{(tenant.securityDeposit || 0).toLocaleString()} ر.س</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 gap-2 rounded-xl" onClick={() => setSelectedTenant(tenant)}>
                      <Eye className="size-4" />
                      كشف حساب
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] text-right">
                    <DialogHeader>
                      <DialogTitle className="font-headline text-xl">كشف حساب مستأجر: {tenant.name}</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="overview" dir="rtl" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="overview">نظرة مالية</TabsTrigger>
                        <TabsTrigger value="bills">الخدمات</TabsTrigger>
                        <TabsTrigger value="contract">شروط العقد</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-4 bg-primary/5 border-primary/20">
                            <Wallet className="size-5 text-primary mb-2" />
                            <p className="text-xs text-muted-foreground">الرصيد المتراكم</p>
                            <p className="text-xl font-bold">{(tenant.accumulatedDebt || 0).toLocaleString()} ر.س</p>
                          </Card>
                          <Card className="p-4 bg-green-50 border-green-200">
                            <CalendarCheck className="size-5 text-green-600 mb-2" />
                            <p className="text-xs text-muted-foreground">التأمين المسترد</p>
                            <p className="text-xl font-bold">{(tenant.securityDeposit || 0).toLocaleString()} ر.س</p>
                          </Card>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">* ملاحظة: مبلغ التأمين يبقى أمانة لدى المكتب ويسترد عند الخروج في حال سلامة الوحدة.</p>
                      </TabsContent>
                      <TabsContent value="bills" className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 border rounded-xl">
                            <div className="flex items-center gap-3">
                              <Zap className="size-5 text-amber-500" />
                              <span className="font-bold">فاتورة الكهرباء</span>
                            </div>
                            <span className="text-destructive font-bold">{(tenant.electricityBill || 0).toLocaleString()} ر.س</span>
                          </div>
                          <div className="flex justify-between items-center p-3 border rounded-xl">
                            <div className="flex items-center gap-3">
                              <Droplets className="size-5 text-blue-500" />
                              <span className="font-bold">فاتورة المياه</span>
                            </div>
                            <span className="text-destructive font-bold">{(tenant.waterBill || 0).toLocaleString()} ر.س</span>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="contract">
                        <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">طريقة دفع الإيجار:</span>
                            <span className="font-bold">{tenant.rentalType === 'advance' ? 'دفع مقدم (بداية الفترة)' : 'دفع مؤخر (نهاية الفترة)'}</span>
                          </div>
                          <div className="flex justify-between border-t pt-4">
                            <span className="text-muted-foreground text-sm">حالة الوحدة عند الاستلام:</span>
                            <span className="font-bold text-green-600">سليمة بالكامل</span>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                <Button className="flex-1 gap-2 rounded-xl bg-green-600 hover:bg-green-700" asChild>
                   <a href={`https://wa.me/${tenant.phone}`} target="_blank">
                      <MessageCircle className="size-4" />
                      تواصل
                   </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

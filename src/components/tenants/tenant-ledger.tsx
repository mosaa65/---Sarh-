
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
  ShieldCheck,
  Printer
} from 'lucide-react'
import { useCollection, useFirestore, errorEmitter, FirestorePermissionError, useUser } from '@/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TenantLedger() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // جلب العقارات التابعة للمستخدم فقط لاستخدامها في القائمة المنسدلة
  const { data: properties } = useCollection(
    user ? query(collection(db, 'properties'), where('ownerId', '==', user.uid)) : null
  );

  // جلب المستأجرين التابعين للمستخدم
  const { data: tenants, loading } = useCollection(
    user ? query(collection(db, 'tenants'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc')) : null
  );

  const defaultAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl || 'https://picsum.photos/seed/mada4/100/100';

  const handleAddTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !db) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const selectedPropertyId = formData.get('propertyId') as string;
    const propertyName = properties?.find(p => p.id === selectedPropertyId)?.name || 'غير محدد';
    
    const newTenant = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      propertyId: selectedPropertyId,
      propertyName: propertyName,
      unitId: formData.get('unitId') as string,
      status: 'active',
      balance: 0,
      accumulatedDebt: Number(formData.get('accumulatedDebt')) || 0,
      securityDeposit: Number(formData.get('securityDeposit')) || 0,
      rentalType: formData.get('rentalType') as string,
      waterBill: 0,
      electricityBill: 0,
      avatarUrl: defaultAvatar,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    };

    const tenantsRef = collection(db, 'tenants');
    addDoc(tenantsRef, newTenant)
      .then(() => {
        toast({ title: "تم تسجيل المستأجر", description: "تم ربط المستأجر بالعقار وفتح سجله المالي." });
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
    t.propertyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-slate-900 tracking-tight">سجل المستأجرين</h2>
          <p className="text-slate-500 mt-1">إدارة المستأجرين والحسابات المالية المرتبطة بعقاراتك.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl h-12 shadow-lg shadow-primary/20">
              <Plus className="size-5" />
              تسجيل مستأجر جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl text-right">تسجيل مستأجر جديد</DialogTitle>
              <DialogDescription className="text-right">اختر العقار وقم بتعبئة بيانات المستأجر لربطه بالنظام.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTenant} className="grid grid-cols-2 gap-4 py-4 text-right">
              <div className="col-span-2 space-y-2">
                <Label>اسم المستأجر الكامل</Label>
                <Input name="name" required className="rounded-xl" placeholder="الاسم كما في الهوية" />
              </div>
              <div className="space-y-2">
                <Label>رقم الجوال</Label>
                <Input name="phone" required placeholder="05xxxxxxxx" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني (اختياري)</Label>
                <Input name="email" type="email" placeholder="example@mail.com" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>اختيار العقار</Label>
                <Select name="propertyId" required>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="اختر العقار" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties?.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>رقم الوحدة</Label>
                <Input name="unitId" required placeholder="مثلاً: شقة 12" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>مبلغ التأمين (ر.س)</Label>
                <Input name="securityDeposit" type="number" defaultValue="0" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>متراكمات سابقة</Label>
                <Input name="accumulatedDebt" type="number" defaultValue="0" className="rounded-xl" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>دفع الإيجار</Label>
                <Select name="rentalType" defaultValue="advance">
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advance">مقدم (بداية كل فترة)</SelectItem>
                    <SelectItem value="arrears">مؤخر (نهاية كل فترة)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="col-span-2 pt-4 flex gap-2">
                <Button type="submit" className="w-full h-12 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  تسجيل وربط المستأجر
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
          placeholder="البحث عن مستأجر في قائمتك..." 
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
            <div className="h-1.5 bg-primary/20 group-hover:bg-primary transition-colors" />
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
                <p className="text-sm text-primary font-bold flex items-center justify-end gap-1">
                  {tenant.propertyName} - {tenant.unitId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">إجمالي المديونية</p>
                  <p className="font-extrabold text-sm text-destructive">{(tenant.balance + tenant.accumulatedDebt).toLocaleString()} ر.س</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">التأمين المحجوز</p>
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
                      <DialogTitle className="font-headline text-xl text-right">الملف المالي لـ {tenant.name}</DialogTitle>
                      <DialogDescription className="text-right">تفاصيل المديونية والتأمينات والخدمات.</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="overview" className="w-full mt-4">
                      <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="overview">الرصيد</TabsTrigger>
                        <TabsTrigger value="bills">الفواتير</TabsTrigger>
                        <TabsTrigger value="contract">العقد</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-6 bg-primary/5 border-primary/10 rounded-2xl">
                            <Wallet className="size-6 text-primary mb-3" />
                            <p className="text-xs text-muted-foreground font-bold">الرصيد المتراكم</p>
                            <p className="text-2xl font-black text-slate-900">{(tenant.accumulatedDebt || 0).toLocaleString()} ر.س</p>
                          </Card>
                          <Card className="p-6 bg-green-50 border-green-100 rounded-2xl">
                            <ShieldCheck className="size-6 text-green-600 mb-3" />
                            <p className="text-xs text-muted-foreground font-bold">مبلغ التأمين</p>
                            <p className="text-2xl font-black text-green-700">{(tenant.securityDeposit || 0).toLocaleString()} ر.س</p>
                          </Card>
                        </div>
                        <p className="text-xs text-amber-600 font-medium p-3 bg-amber-50 rounded-xl border border-amber-100">
                          * مبلغ التأمين محفوظ كأمانة ويسترد عند الإخلاء في حال سلامة الوحدة.
                        </p>
                      </TabsContent>
                      <TabsContent value="bills" className="space-y-4">
                        <div className="flex justify-between items-center p-4 border rounded-2xl">
                          <div className="flex items-center gap-3">
                            <Zap className="size-5 text-amber-500" />
                            <span className="font-bold">مستحقات الكهرباء</span>
                          </div>
                          <span className="text-destructive font-black">{(tenant.electricityBill || 0).toLocaleString()} ر.س</span>
                        </div>
                        <div className="flex justify-between items-center p-4 border rounded-2xl">
                          <div className="flex items-center gap-3">
                            <Droplets className="size-5 text-blue-500" />
                            <span className="font-bold">مستحقات المياه</span>
                          </div>
                          <span className="text-destructive font-black">{(tenant.waterBill || 0).toLocaleString()} ر.س</span>
                        </div>
                      </TabsContent>
                      <TabsContent value="contract">
                        <div className="p-6 bg-slate-50 rounded-2xl border text-sm space-y-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">نوع التحصيل:</span>
                            <span className="font-bold">{tenant.rentalType === 'advance' ? 'مقدم' : 'مؤخر'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">تاريخ التسجيل:</span>
                            <span className="font-bold">{new Date(tenant.createdAt?.seconds * 1000).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <DialogFooter className="mt-8">
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
      </div>
    </div>
  )
}

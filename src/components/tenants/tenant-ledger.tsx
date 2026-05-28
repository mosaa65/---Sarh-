
"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Phone, Mail, FileText, Plus, Search, Loader2, UserPlus, MessageCircle, Send } from 'lucide-react'
import { useCollection, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { PlaceHolderImages } from '@/lib/placeholder-images'

export function TenantLedger() {
  const db = useFirestore();
  const { data: tenants, loading } = useCollection(db ? collection(db, 'tenants') : null);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      avatarUrl: defaultAvatar,
      createdAt: serverTimestamp(),
    };

    const tenantsRef = collection(db, 'tenants');

    addDoc(tenantsRef, newTenant)
      .then(() => {
        toast({
          title: "تمت الإضافة",
          description: "تم تسجيل المستأجر الجديد بنجاح.",
        });
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
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = `مرحباً أستاذ ${name}، نود التواصل معكم بخصوص العقار الخاص بكم في مدى إنماء.`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-slate-900 tracking-tight">سجل المستأجرين الموحد</h2>
          <p className="text-slate-500 mt-1">دليل كامل لبيانات المستأجرين وتاريخ التواصل.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl h-12 shadow-lg shadow-primary/20">
              <Plus className="size-5" />
              إضافة مستأجر جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">تسجيل مستأجر جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTenant} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المستأجر</Label>
                <Input id="name" name="name" placeholder="الاسم الكامل..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <Input id="phone" name="phone" placeholder="05xxxxxxxx" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" name="email" type="email" placeholder="example@mail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitId">رقم/اسم الوحدة</Label>
                <Input id="unitId" name="unitId" placeholder="شقة 101، مكتب 5..." required />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  تسجيل المستأجر
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 p-2 bg-card border rounded-2xl max-w-md">
        <Search className="size-4 text-muted-foreground mr-2" />
        <input 
          type="text" 
          placeholder="البحث عن مستأجر..." 
          className="flex-1 bg-transparent border-none py-2 text-sm focus:ring-0 outline-none"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants?.map((tenant: any) => (
            <Card key={tenant.id} className="bento-card border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <Avatar className="size-16 ring-4 ring-primary/10">
                    <AvatarImage src={tenant.avatarUrl || defaultAvatar} />
                    <AvatarFallback>{tenant.name?.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={tenant.status === 'active' ? 'default' : tenant.status === 'warning' ? 'secondary' : 'outline'} className="rounded-lg px-3 py-1">
                      {tenant.status === 'active' ? 'نشط' : tenant.status === 'warning' ? 'متأخر' : 'منتهي'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <h3 className="text-xl font-bold font-headline">{tenant.name}</h3>
                  <p className="text-sm text-primary font-medium">{tenant.unitId || 'غير محدد'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-right">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">رقم الجوال</p>
                    <div className="flex items-center gap-2 text-sm font-medium justify-end">
                      {tenant.phone}
                      <Phone className="size-3 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">الرصيد</p>
                    <p className={`text-sm font-bold ${tenant.balance < 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {tenant.balance === 0 ? '0.00' : `${Math.abs(tenant.balance).toLocaleString()}`} ر.س
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button className="gap-2 rounded-xl bg-green-600 hover:bg-green-700" onClick={() => handleWhatsApp(tenant.phone, tenant.name)}>
                    <MessageCircle className="size-4" />
                    واتساب
                  </Button>
                  <Button className="gap-2 rounded-xl" variant="outline" asChild>
                    <a href={`tel:${tenant.phone}`}>
                      <Phone className="size-4" />
                      اتصال
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {tenants?.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed">
              <UserPlus className="size-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-600">لا يوجد مستأجرين مسجلين</h3>
              <p className="text-sm text-slate-400">سجل أول مستأجر لك للبدء في إدارة عقودك.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

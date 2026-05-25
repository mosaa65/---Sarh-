
"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, Plus, Search, Filter, Home, Store, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useCollection, useFirestore } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export function PropertyList() {
  const db = useFirestore();
  const { data: properties, loading } = useCollection(collection(db, 'properties'));
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const newProperty = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      type: formData.get('type') as string,
      units: Number(formData.get('units')),
      occupiedUnits: 0,
      monthlyIncome: 0,
      imageUrl: `https://picsum.photos/seed/${Math.random()}/600/400`,
      createdAt: serverTimestamp(),
    };

    try {
      addDoc(collection(db, 'properties'), newProperty);
      toast({
        title: "تمت الإضافة",
        description: "تمت إضافة العقار بنجاح إلى السجل.",
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العقار.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-slate-900 tracking-tight">سجل العقارات الرقمي</h2>
          <p className="text-slate-500 mt-1">إدارة المباني والوحدات السكنية والتجارية.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl px-6 h-12 shadow-lg shadow-primary/20">
              <Plus className="size-5" />
              إضافة عقار جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">إضافة عقار جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProperty} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم العقار</Label>
                <Input id="name" name="name" placeholder="مثلاً: عمارة الوفاء" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">الموقع / العنوان</Label>
                <Input id="address" name="address" placeholder="المدينة، الحي..." required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">نوع العقار</Label>
                  <Select name="type" defaultValue="residential">
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">سكني</SelectItem>
                      <SelectItem value="commercial">تجاري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="units">عدد الوحدات</Label>
                  <Input id="units" name="units" type="number" defaultValue="1" min="1" required />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  حفظ العقار
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 p-2 bg-card border rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="البحث عن اسم العقار أو الموقع..." 
            className="w-full bg-transparent border-none pr-10 pl-4 py-2 text-sm focus:ring-0 outline-none"
          />
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <Filter className="size-4" />
          تصفية
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties?.map((prop: any) => (
            <Card key={prop.id} className="overflow-hidden group bento-card border-none shadow-md hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <Image 
                  src={prop.imageUrl || 'https://picsum.photos/seed/prop/600/400'} 
                  alt={prop.name} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  data-ai-hint="residential building"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 right-4 left-4 flex justify-between items-end">
                  <div>
                    <Badge className="mb-2 bg-white/20 backdrop-blur-md border-none text-white hover:bg-white/30">
                      {prop.type === 'residential' ? 'سكني' : 'تجاري'}
                    </Badge>
                    <h3 className="text-xl font-bold font-headline text-white">{prop.name}</h3>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="size-4 shrink-0" />
                  <span className="text-xs">{prop.address}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">الوحدات</p>
                    <div className="flex items-center gap-2">
                      {prop.type === 'residential' ? <Home className="size-4 text-primary" /> : <Store className="size-4 text-primary" />}
                      <span className="font-bold text-sm">{prop.occupiedUnits || 0} / {prop.units}</span>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">الدخل الشهري</p>
                    <p className="font-bold text-sm text-primary">{prop.monthlyIncome?.toLocaleString() || 0} ر.س</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2 space-x-reverse">
                    {[1, 2].map(i => (
                      <div key={i} className="size-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                        U{i}
                      </div>
                    ))}
                    {prop.units > 2 && (
                      <div className="size-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-muted-foreground">
                        +{prop.units - 2}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    إدارة الوحدات
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {properties?.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed">
              <Building2 className="size-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-600">لا يوجد عقارات حالياً</h3>
              <p className="text-sm text-slate-400">ابدأ بإضافة أول عقار لك في المحفظة.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

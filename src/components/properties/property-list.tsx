"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, MoreVertical, Plus, Search, Filter, Home, Store } from 'lucide-react'
import Image from 'next/image'

const properties = [
  {
    id: 1,
    name: 'عمارة السلام',
    address: 'الرياض، حي الملقا',
    type: 'residential',
    units: 12,
    occupied: 10,
    income: '45,000 ر.س',
    image: 'https://picsum.photos/seed/prop1/600/400'
  },
  {
    id: 2,
    name: 'مركز النخيل التجاري',
    address: 'جدة، طريق الملك',
    type: 'commercial',
    units: 8,
    occupied: 6,
    income: '82,000 ر.س',
    image: 'https://picsum.photos/seed/prop2/600/400'
  },
  {
    id: 3,
    name: 'فيلا المرجان',
    address: 'الدمام، حي الشاطئ',
    type: 'residential',
    units: 1,
    occupied: 1,
    income: '12,000 ر.س',
    image: 'https://picsum.photos/seed/prop3/600/400'
  },
  {
    id: 4,
    name: 'مجمع واحة سدير',
    address: 'المجمعة، حي الجامعة',
    type: 'residential',
    units: 20,
    occupied: 18,
    income: '38,000 ر.س',
    image: 'https://picsum.photos/seed/prop4/600/400'
  }
]

export function PropertyList() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-slate-900 tracking-tight">سجل العقارات الرقمي</h2>
          <p className="text-slate-500 mt-1">إدارة المباني والوحدات السكنية والتجارية.</p>
        </div>
        <Button className="gap-2 rounded-xl px-6 h-12 shadow-lg shadow-primary/20">
          <Plus className="size-5" />
          إضافة عقار جديد
        </Button>
      </div>

      <div className="flex items-center gap-2 p-2 bg-card border rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="البحث عن اسم العقار أو الموقع..." 
            className="w-full bg-transparent border-none pr-10 pl-4 py-2 text-sm focus:ring-0"
          />
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <Filter className="size-4" />
          تصفية
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <Card key={prop.id} className="overflow-hidden group bento-card border-none shadow-md hover:shadow-xl transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <Image 
                src={prop.image} 
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
                <div className="bg-white/90 backdrop-blur-md size-10 rounded-xl flex items-center justify-center text-primary shadow-lg cursor-pointer hover:bg-white transition-colors">
                  <Plus className="size-5" />
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
                    <span className="font-bold text-sm">{prop.occupied} / {prop.units}</span>
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">الدخل الشهري</p>
                  <p className="font-bold text-sm text-primary">{prop.income}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex -space-x-2 space-x-reverse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="size-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                      U{i}
                    </div>
                  ))}
                  <div className="size-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-muted-foreground">
                    +{prop.units - 3}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg">
                  إدارة الوحدات
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

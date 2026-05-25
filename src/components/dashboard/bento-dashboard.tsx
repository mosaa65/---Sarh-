"use client"

import React, { useMemo } from 'react'
import { StatCard } from './stat-card'
import { Building2, Users, FileWarning, TrendingUp, Calendar, ArrowUpRight, FileText, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useCollection, useFirestore } from '@/firebase'
import { collection, query, orderBy, limit } from 'firebase/firestore'
import { isAfter, addDays, parseISO } from 'date-fns'

export function BentoDashboard() {
  const db = useFirestore()
  
  // جلب البيانات من المجموعات المختلفة من Firestore
  const { data: properties, loading: propsLoading } = useCollection(db ? collection(db, 'properties') : null)
  const { data: tenants, loading: tenantsLoading } = useCollection(db ? collection(db, 'tenants') : null)
  const { data: contracts, loading: contractsLoading } = useCollection(
    db ? query(collection(db, 'contracts'), orderBy('endDate', 'asc'), limit(4)) : null
  )

  // حساب الإحصائيات من البيانات الحقيقية
  const stats = useMemo(() => {
    if (!properties || !tenants) return { 
      totalProps: 0, 
      totalUnits: 0, 
      activeTenants: 0, 
      monthlyIncome: 0,
      occupiedUnits: 0,
      occupancyRate: 0 
    }

    const totalProps = properties.length
    const totalUnits = properties.reduce((acc: number, p: any) => acc + (Number(p.units) || 0), 0)
    const occupiedUnits = properties.reduce((acc: number, p: any) => acc + (Number(p.occupiedUnits) || 0), 0)
    const activeTenants = tenants.filter((t: any) => t.status === 'active').length
    const monthlyIncome = properties.reduce((acc: number, p: any) => acc + (Number(p.monthlyIncome) || 0), 0)
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

    return { totalProps, totalUnits, activeTenants, monthlyIncome, occupiedUnits, occupancyRate }
  }, [properties, tenants])

  const isLoading = propsLoading || tenantsLoading

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold font-headline tracking-tight text-slate-900">أهلاً بك مجدداً 👋</h2>
        <p className="text-slate-500 mt-1">نظرة سريعة على أداء محفظتك العقارية الحقيقية.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="إجمالي العقارات" 
          value={isLoading ? '...' : stats.totalProps} 
          description={`${stats.totalUnits} وحدات إجمالية`} 
          icon={Building2} 
        />
        <StatCard 
          label="المستأجرين النشطين" 
          value={isLoading ? '...' : stats.activeTenants} 
          description={`بنسبة إشغال ${stats.occupancyRate}%`} 
          icon={Users} 
        />
        <StatCard 
          label="المستحقات المتأخرة" 
          value="0 ر.س" 
          description="لا توجد متأخرات مسجلة" 
          icon={FileWarning} 
          className="bg-destructive/5"
        />
        <StatCard 
          label="الدخل الشهري المتوقع" 
          value={isLoading ? '...' : `${stats.monthlyIncome.toLocaleString()} ر.س`} 
          description="بناءً على العقود النشطة" 
          icon={TrendingUp} 
          className="bg-primary text-primary-foreground"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bento-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-headline">العقود التي تنتهي قريباً</CardTitle>
              <CardDescription>
                {contractsLoading ? 'جاري جلب العقود...' : contracts.length > 0 ? `لديك ${contracts.length} عقود تنتهي قريباً.` : 'لا يوجد عقود تنتهي قريباً.'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/contracts">عرض الكل</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contractsLoading ? (
                [1, 2].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)
              ) : contracts.length > 0 ? (
                contracts.map((contract: any, i: number) => {
                  const isCritical = contract.endDate ? isAfter(addDays(new Date(), 15), parseISO(contract.endDate)) : false
                  return (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <Calendar className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">عقد رقم: {contract.id?.substring(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">قيمة الإيجار: {contract.rentAmount} ر.س</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{contract.endDate || 'غير محدد'}</p>
                        <Badge variant={isCritical ? 'destructive' : 'outline'} className="text-[10px] h-5">
                          {isCritical ? 'عاجل' : 'قريباً'}
                        </Badge>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-xl border-dashed">
                  لا توجد عقود مسجلة حالياً
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card">
          <CardHeader>
            <CardTitle className="font-headline">حالة الإشغال</CardTitle>
            <CardDescription>توزيع الوحدات حسب الحالة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center py-4">
              <div className="relative size-40">
                <svg className="size-full" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="3"></circle>
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    className="stroke-primary" 
                    strokeWidth="3" 
                    strokeDasharray={`${stats.occupancyRate}, 100`} 
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold font-headline">{stats.occupancyRate}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">مؤجر</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-primary rounded-full" />
                  <span>وحدات مؤجرة</span>
                </div>
                <span className="font-bold">{stats.occupiedUnits} وحدة</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-muted-foreground rounded-full" />
                  <span>وحدات شاغرة</span>
                </div>
                <span className="font-bold">{stats.totalUnits - stats.occupiedUnits} وحدات</span>
              </div>
            </div>
            <Button className="w-full gap-2 mt-2" variant="outline" asChild>
              <a href="/properties">
                عرض تفاصيل الوحدات <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bento-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-headline">التحصيل المالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">0%</span>
              <span className="text-xs text-muted-foreground">من الهدف الشهري</span>
            </div>
            <Progress value={0} className="h-2 mt-4" />
            <p className="text-xs text-muted-foreground mt-4">سجل المدفوعات لعرض التحصيل</p>
          </CardContent>
        </Card>
        
        <Card className="bento-card md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-headline">الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2 rounded-xl border-dashed" asChild>
              <a href="/properties">
                <Building2 className="size-6 text-primary" />
                <span className="text-xs font-bold">إضافة عقار</span>
              </a>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 rounded-xl border-dashed" asChild>
              <a href="/tenants">
                <Users className="size-6 text-primary" />
                <span className="text-xs font-bold">تسجيل مستأجر</span>
              </a>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 rounded-xl border-dashed" asChild>
              <a href="/contracts">
                <FileText className="size-6 text-primary" />
                <span className="text-xs font-bold">إنشاء عقد</span>
              </a>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 rounded-xl border-dashed" asChild>
              <a href="/payments">
                <CreditCard className="size-6 text-primary" />
                <span className="text-xs font-bold">سند قبض</span>
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

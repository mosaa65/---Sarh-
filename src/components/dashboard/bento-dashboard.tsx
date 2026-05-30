
"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { StatCard } from './stat-card'
import { Building2, Users, FileWarning, TrendingUp, Calendar, ArrowUpRight, FileText, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useCollection, useFirestore, useUser } from '@/firebase'
import { collection, query, orderBy, limit, where } from 'firebase/firestore'
import { isAfter, addDays, parseISO } from 'date-fns'

export function BentoDashboard() {
  const db = useFirestore()
  const { user } = useUser()
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentDate(new Date())
  }, [])
  
  const { data: properties, loading: propsLoading } = useCollection(
    user ? query(collection(db, 'properties'), where('ownerId', '==', user.uid)) : null
  )
  const { data: tenants, loading: tenantsLoading } = useCollection(
    user ? query(collection(db, 'tenants'), where('ownerId', '==', user.uid)) : null
  )
  const { data: payments, loading: paymentsLoading } = useCollection(
    user ? query(collection(db, 'payments'), where('ownerId', '==', user.uid)) : null
  )
  const { data: allContracts, loading: contractsLoading } = useCollection(
    user ? query(collection(db, 'contracts'), where('ownerId', '==', user.uid)) : null
  )

  const contracts = useMemo(() => {
    if (!allContracts) return []
    return [...allContracts]
      .sort((a: any, b: any) => {
        if (!a.endDate) return 1
        if (!b.endDate) return -1
        return a.endDate.localeCompare(b.endDate)
      })
      .slice(0, 4)
  }, [allContracts])

  const stats = useMemo(() => {
    if (!properties || !tenants) return { 
      totalProps: 0, 
      totalUnits: 0, 
      activeTenants: 0, 
      monthlyIncome: 0,
      occupiedUnits: 0,
      occupancyRate: 0,
      totalArrears: 0
    }

    const totalProps = properties.length
    const totalUnits = properties.reduce((acc: number, p: any) => acc + (Number(p.units) || 0), 0)
    const occupiedUnits = properties.reduce((acc: number, p: any) => acc + (Number(p.occupiedUnits) || 0), 0)
    const activeTenants = tenants.filter((t: any) => t.status === 'active').length
    const monthlyIncome = properties.reduce((acc: number, p: any) => acc + (Number(p.monthlyIncome) || 0), 0)
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0
    const totalArrears = tenants.reduce((acc: number, t: any) => acc + (Number(t.accumulatedDebt || 0) + Number(t.balance || 0)), 0)

    return { totalProps, totalUnits, activeTenants, monthlyIncome, occupiedUnits, occupancyRate, totalArrears }
  }, [properties, tenants])

  const currentMonthPaidAmount = useMemo(() => {
    if (!payments || !currentDate) return 0
    const currentYearMonth = currentDate.toISOString().substring(0, 7) // "YYYY-MM"
    return payments
      .filter((p: any) => p.status === 'paid' && p.date && p.date.startsWith(currentYearMonth))
      .reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0)
  }, [payments, currentDate])

  const collectionRate = useMemo(() => {
    if (stats.monthlyIncome === 0) return 0
    return Math.round((currentMonthPaidAmount / stats.monthlyIncome) * 100)
  }, [currentMonthPaidAmount, stats.monthlyIncome])

  const isLoading = propsLoading || tenantsLoading || !user

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
          value={isLoading ? '...' : `${stats.totalArrears.toLocaleString()} ر.س`} 
          description={stats.totalArrears > 0 ? 'مستحقة للدفع فوراً' : 'لا توجد متأخرات مسجلة'} 
          icon={FileWarning} 
          className="bg-destructive/5 text-destructive"
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
                  const isCritical = currentDate && contract.endDate ? isAfter(addDays(currentDate, 15), parseISO(contract.endDate)) : false
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
              <span className="text-2xl font-bold">{isLoading || paymentsLoading ? '...' : `${collectionRate}%`}</span>
              <span className="text-xs text-muted-foreground">من الهدف الشهري ({stats.monthlyIncome.toLocaleString()} ر.س)</span>
            </div>
            <Progress value={isLoading || paymentsLoading ? 0 : Math.min(100, collectionRate)} className="h-2 mt-4" />
            <p className="text-xs text-muted-foreground mt-4">
              {currentMonthPaidAmount > 0 
                ? `تم تحصيل ${currentMonthPaidAmount.toLocaleString()} ر.س هذا الشهر` 
                : 'سجل المدفوعات لعرض التحصيل المالي لهذا الشهر'}
            </p>
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

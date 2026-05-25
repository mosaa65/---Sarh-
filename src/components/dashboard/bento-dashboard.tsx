"use client"

import React from 'react'
import { StatCard } from './stat-card'
import { Building2, Users, FileWarning, TrendingUp, Calendar, ArrowUpRight, FileText, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export function BentoDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold font-headline tracking-tight text-slate-900">أهلاً بك مجدداً، أحمد 👋</h2>
        <p className="text-slate-500 mt-1">نظرة سريعة على أداء محفظتك العقارية لهذا اليوم.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="إجمالي العقارات" 
          value="42" 
          description="8 مباني، 34 وحدات" 
          icon={Building2} 
          trend={{ value: 4, isPositive: true }}
        />
        <StatCard 
          label="المستأجرين النشطين" 
          value="31" 
          description="بنسبة إشغال 91%" 
          icon={Users} 
        />
        <StatCard 
          label="الإيجارات المتأخرة" 
          value="12,400 ر.س" 
          description="5 مستأجرين متأخرين" 
          icon={FileWarning} 
          className="bg-destructive/5"
        />
        <StatCard 
          label="الدخل الشهري" 
          value="158,000 ر.س" 
          description="زيادة 12% عن الشهر الماضي" 
          icon={TrendingUp} 
          trend={{ value: 12, isPositive: true }}
          className="bg-primary text-primary-foreground"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bento-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-headline">العقود التي تنتهي قريباً</CardTitle>
              <CardDescription>لديك 4 عقود ستنتهي خلال الـ 30 يوماً القادمة.</CardDescription>
            </div>
            <Button variant="outline" size="sm">عرض الكل</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'محمد العتيبي', property: 'عمارة السلام - شقة 102', date: '15 مارس 2024', status: 'critical' },
                { name: 'شركة التقنية المحدودة', property: 'برج النخيل - مكتب 401', date: '28 مارس 2024', status: 'warning' },
                { name: 'سارة القحطاني', property: 'فيلا المرجان', date: '5 أبريل 2024', status: 'normal' },
                { name: 'عبدالله محمد', property: 'عمارة السلام - محل 3', date: '12 أبريل 2024', status: 'normal' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Calendar className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.property}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.date}</p>
                    <Badge variant={item.status === 'critical' ? 'destructive' : item.status === 'warning' ? 'secondary' : 'outline'} className="text-[10px] h-5">
                      {item.status === 'critical' ? 'عاجل' : item.status === 'warning' ? 'تذكير' : 'قريباً'}
                    </Badge>
                  </div>
                </div>
              ))}
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
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray="91, 100" strokeLinecap="round"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold font-headline">91%</span>
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
                <span className="font-bold">31 وحدة</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-muted-foreground rounded-full" />
                  <span>وحدات شاغرة</span>
                </div>
                <span className="font-bold">3 وحدات</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-accent rounded-full" />
                  <span>تحت الصيانة</span>
                </div>
                <span className="font-bold">2 وحدة</span>
              </div>
            </div>
            <Button className="w-full gap-2 mt-2">
              عرض تفاصيل الوحدات <ArrowUpRight className="size-4" />
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
              <span className="text-2xl font-bold">84%</span>
              <span className="text-xs text-muted-foreground">من الهدف الشهري</span>
            </div>
            <Progress value={84} className="h-2 mt-4" />
            <p className="text-xs text-muted-foreground mt-4">تم تحصيل 132,720 ر.س من أصل 158,000 ر.س</p>
          </CardContent>
        </Card>
        
        <Card className="bento-card md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-headline">الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2 rounded-xl border-dashed">
              <Building2 className="size-6 text-primary" />
              <span className="text-xs font-bold">إضافة عقار</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 rounded-xl border-dashed">
              <Users className="size-6 text-primary" />
              <span className="text-xs font-bold">تسجيل مستأجر</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 rounded-xl border-dashed">
              <FileText className="size-6 text-primary" />
              <span className="text-xs font-bold">إنشاء عقد</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 rounded-xl border-dashed">
              <CreditCard className="size-6 text-primary" />
              <span className="text-xs font-bold">سند قبض</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, FileText, Send, CheckCircle2, Loader2, Download } from 'lucide-react'
import { generateAIPoweredLease, AIPoweredLeaseGenerationInput } from '@/ai/flows/ai-powered-lease-generation'
import { useToast } from '@/hooks/use-toast'

export function AILeaseAdvisor() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const input: AIPoweredLeaseGenerationInput = {
      propertyAddress: formData.get('propertyAddress') as string,
      propertyType: formData.get('propertyType') as string,
      landlordName: formData.get('landlordName') as string,
      tenantName: formData.get('tenantName') as string,
      tenantContact: formData.get('tenantContact') as string,
      rentalAmount: Number(formData.get('rentalAmount')),
      currency: 'SAR',
      paymentFrequency: formData.get('paymentFrequency') as string,
      leaseStartDate: formData.get('leaseStartDate') as string,
      leaseEndDate: formData.get('leaseEndDate') as string,
      securityDepositAmount: Number(formData.get('securityDepositAmount')),
      securityDepositCurrency: 'SAR',
      petPolicy: formData.get('petPolicy') as string,
      maintenanceResponsibilities: formData.get('maintenanceResponsibilities') as string,
      additionalTerms: formData.get('additionalTerms') as string,
    }

    try {
      const output = await generateAIPoweredLease(input)
      setResult(output.leaseAgreementText)
      toast({
        title: "تم إنشاء المسودة",
        description: "تم توليد عقد الإيجار المقترح بنجاح بواسطة الذكاء الاصطناعي.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل إنشاء العقد. يرجى المحاولة مرة أخرى.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold font-headline text-slate-900 tracking-tight flex items-center gap-3">
          مستشار العقود الذكي
          <Sparkles className="size-6 text-primary fill-primary/20" />
        </h2>
        <p className="text-slate-500 mt-1">توليد مسودات عقود إيجار احترافية مدعومة بالذكاء الاصطناعي.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              تفاصيل العقد الجديد
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyAddress">عنوان العقار</Label>
                  <Input id="propertyAddress" name="propertyAddress" placeholder="الرياض، حي النخيل..." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyType">نوع العقار</Label>
                  <Input id="propertyType" name="propertyType" placeholder="شقة، محل، مكتب..." required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="landlordName">اسم المالك</Label>
                  <Input id="landlordName" name="landlordName" required defaultValue="أحمد المالك" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenantName">اسم المستأجر</Label>
                  <Input id="tenantName" name="tenantName" required placeholder="الاسم الكامل للمستأجر" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rentalAmount">قيمة الإيجار</Label>
                  <Input id="rentalAmount" name="rentalAmount" type="number" required placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentFrequency">دورية الدفع</Label>
                  <Input id="paymentFrequency" name="paymentFrequency" defaultValue="شهري" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityDepositAmount">مبلغ التأمين</Label>
                  <Input id="securityDepositAmount" name="securityDepositAmount" type="number" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaseStartDate">تاريخ البداية</Label>
                  <Input id="leaseStartDate" name="leaseStartDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaseEndDate">تاريخ النهاية</Label>
                  <Input id="leaseEndDate" name="leaseEndDate" type="date" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceResponsibilities">مسؤوليات الصيانة</Label>
                <Textarea id="maintenanceResponsibilities" name="maintenanceResponsibilities" placeholder="حدد من المسؤول عن الإصلاحات الرئيسية والثانوية..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalTerms">شروط إضافية (اختياري)</Label>
                <Textarea id="additionalTerms" name="additionalTerms" placeholder="أي بنود أخرى ترغب في تضمينها..." />
              </div>

              <Button type="submit" className="w-full gap-2 py-6 rounded-xl shadow-lg" disabled={loading}>
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
                توليد مسودة العقد بالذكاء الاصطناعي
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg rounded-2xl overflow-hidden min-h-[500px] flex flex-col">
          <CardHeader className="bg-slate-900 text-white border-b border-white/10">
            <CardTitle className="text-lg font-headline flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                المسودة المقترحة
              </div>
              {result && (
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Download className="size-5" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden relative">
            {result ? (
              <div className="h-full overflow-y-auto p-8 prose prose-slate max-w-none text-right whitespace-pre-wrap leading-relaxed font-body">
                {result}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/20">
                <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border">
                  <Sparkles className="size-12 text-primary/40" />
                </div>
                <h4 className="font-bold text-slate-800 mb-2">في انتظار البيانات</h4>
                <p className="text-sm max-w-[250px]">قم بتعبئة النموذج لإنشاء مسودة العقد فوراً باستخدام الذكاء الاصطناعي.</p>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="size-10 text-primary animate-spin" />
                  <p className="font-bold text-slate-800">جاري التحليل وتوليد البنود...</p>
                </div>
              </div>
            )}
          </CardContent>
          {result && (
            <div className="p-4 bg-slate-50 border-t flex gap-3">
              <Button className="flex-1 rounded-xl">اعتماد كمسودة نهائية</Button>
              <Button variant="outline" className="flex-1 rounded-xl">تحرير النص</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

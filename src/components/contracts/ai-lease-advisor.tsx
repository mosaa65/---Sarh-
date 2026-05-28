
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, FileText, Send, CheckCircle2, Loader2, Download, Printer } from 'lucide-react'
import { generateAIPoweredLease, AIPoweredLeaseGenerationInput } from '@/ai/flows/ai-powered-lease-generation'
import { useToast } from '@/hooks/use-toast'

export function AILeaseAdvisor() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [currency, setCurrency] = useState('SAR')
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
      currency: currency,
      paymentFrequency: formData.get('paymentFrequency') as string,
      leaseStartDate: formData.get('leaseStartDate') as string,
      leaseEndDate: formData.get('leaseEndDate') as string,
      securityDepositAmount: Number(formData.get('securityDepositAmount')),
      securityDepositCurrency: currency,
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow && result) {
      printWindow.document.write(`<html><head><title>عقد إيجار - مدى إنماء</title><style>body{font-family: 'Cairo', sans-serif; direction: rtl; padding: 40px; line-height: 1.8;}</style></head><body>${result.replace(/\n/g, '<br/>')}</body></html>`)
      printWindow.document.close()
      printWindow.print()
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
                  <Input id="propertyAddress" name="propertyAddress" placeholder="الرياض، حي النخيل..." required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyType">نوع العقار</Label>
                  <Input id="propertyType" name="propertyType" placeholder="شقة، محل، مكتب..." required className="rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="landlordName">اسم المالك</Label>
                  <Input id="landlordName" name="landlordName" required defaultValue="أحمد المالك" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenantName">اسم المستأجر</Label>
                  <Input id="tenantName" name="tenantName" required placeholder="الاسم الكامل للمستأجر" className="rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label>العملة</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="ر.س" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ر.س</SelectItem>
                      <SelectItem value="USD">$ دولار</SelectItem>
                      <SelectItem value="KWD">د.ك</SelectItem>
                      <SelectItem value="AED">د.إ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="rentalAmount">القيمة</Label>
                  <Input id="rentalAmount" name="rentalAmount" type="number" required placeholder="0.00" className="rounded-xl" />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="paymentFrequency">الدورية</Label>
                  <Input id="paymentFrequency" name="paymentFrequency" defaultValue="شهري" className="rounded-xl" />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="securityDepositAmount">التأمين</Label>
                  <Input id="securityDepositAmount" name="securityDepositAmount" type="number" placeholder="0.00" className="rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaseStartDate">تاريخ البداية</Label>
                  <Input id="leaseStartDate" name="leaseStartDate" type="date" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaseEndDate">تاريخ النهاية</Label>
                  <Input id="leaseEndDate" name="leaseEndDate" type="date" required className="rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceResponsibilities">مسؤوليات الصيانة</Label>
                <Textarea id="maintenanceResponsibilities" name="maintenanceResponsibilities" placeholder="حدد من المسؤول عن الإصلاحات الرئيسية والثانوية..." className="rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalTerms">شروط إضافية (اختياري)</Label>
                <Textarea id="additionalTerms" name="additionalTerms" placeholder="أي بنود أخرى ترغب في تضمينها..." className="rounded-xl" />
              </div>

              <Button type="submit" className="w-full gap-2 py-6 rounded-xl shadow-lg font-bold text-lg" disabled={loading}>
                {loading ? <Loader2 className="size-6 animate-spin" /> : <Sparkles className="size-6" />}
                توليد المسودة بالذكاء الاصطناعي
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
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={handlePrint}>
                    <Printer className="size-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Download className="size-5" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden relative bg-white">
            {result ? (
              <div className="h-full overflow-y-auto p-8 prose prose-slate max-w-none text-right whitespace-pre-wrap leading-loose font-body text-slate-700">
                {result}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/5">
                <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border">
                  <Sparkles className="size-12 text-primary/40" />
                </div>
                <h4 className="font-bold text-slate-800 mb-2 font-headline">في انتظار البيانات</h4>
                <p className="text-sm max-w-[250px]">قم بتعبئة النموذج لإنشاء مسودة العقد فوراً باستخدام الذكاء الاصطناعي.</p>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative size-16">
                    <Loader2 className="size-full text-primary animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-6 text-primary" />
                  </div>
                  <p className="font-bold text-slate-900 text-lg">جاري صياغة البنود القانونية...</p>
                </div>
              </div>
            )}
          </CardContent>
          {result && (
            <div className="p-4 bg-slate-50 border-t flex gap-3">
              <Button className="flex-1 rounded-xl h-12 font-bold">اعتماد المسودة</Button>
              <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold">تعديل النص</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

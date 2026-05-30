
"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, FileText, CheckCircle2, Loader2, Printer, Building2, User } from 'lucide-react'
import { generateAIPoweredLease, AIPoweredLeaseGenerationInput } from '@/ai/flows/ai-powered-lease-generation'
import { useToast } from '@/hooks/use-toast'
import { useCollection, useFirestore, useUser } from '@/firebase'
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp, query, where } from 'firebase/firestore'

export function AILeaseAdvisor() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  // فلترة العقارات والمستأجرين حسب المالك
  const { data: properties } = useCollection(
    user ? query(collection(db, 'properties'), where('ownerId', '==', user.uid)) : null
  )
  const { data: tenants } = useCollection(
    user ? query(collection(db, 'tenants'), where('ownerId', '==', user.uid)) : null
  )

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [currency, setCurrency] = useState('SAR')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [selectedTenantId, setSelectedTenantId] = useState<string>('')
  
  const [currentContractData, setCurrentContractData] = useState<any>(null)

  const selectedProperty = useMemo(() => 
    properties?.find(p => p.id === selectedPropertyId), 
    [properties, selectedPropertyId]
  )
  
  const selectedTenant = useMemo(() => 
    tenants?.find(t => t.id === selectedTenantId), 
    [tenants, selectedTenantId]
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedProperty || !selectedTenant) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى اختيار العقار والمستأجر من القوائم الجاهزة." })
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const input: AIPoweredLeaseGenerationInput = {
      propertyAddress: selectedProperty.address,
      propertyType: selectedProperty.type,
      landlordName: formData.get('landlordName') as string,
      tenantName: selectedTenant.name,
      tenantContact: selectedTenant.phone,
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

    setCurrentContractData(input)

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
        title: "خطأ في التوليد",
        description: "فشل إنشاء العقد. يرجى مراجعة الاتصال والمحاولة مرة أخرى.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveContract = async () => {
    if (!currentContractData || !selectedPropertyId || !selectedTenantId || !db || !user) return
    
    setSaving(true)
    try {
      // 1. Save Contract to Firestore
      const contractRef = collection(db, 'contracts')
      const newContract = {
        ...currentContractData,
        propertyId: selectedPropertyId,
        tenantId: selectedTenantId,
        status: 'active',
        content: result,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      }
      
      await addDoc(contractRef, newContract)

      // 2. Update Tenant Balance and stats
      const tenantRef = doc(db, 'tenants', selectedTenantId)
      await updateDoc(tenantRef, {
        accumulatedDebt: increment(currentContractData.rentalAmount),
        securityDeposit: currentContractData.securityDepositAmount,
        status: 'active'
      })

      // 3. Update Property Stats
      const propertyRef = doc(db, 'properties', selectedPropertyId)
      await updateDoc(propertyRef, {
        occupiedUnits: increment(1),
        monthlyIncome: increment(currentContractData.rentalAmount)
      })

      toast({
        title: "تم اعتماد العقد بنجاح",
        description: "تم حفظ العقد في الأرشيف وتحديث الأرصدة المالية والمستندات.",
      })
      setResult(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في الاعتماد",
        description: "حدث خطأ أثناء تحديث البيانات المالية. يرجى المحاولة لاحقاً.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 print:space-y-0" dir="rtl">
      <div className="print:hidden">
        <h2 className="text-3xl font-black font-headline text-slate-900 tracking-tight flex items-center gap-3">
          مستشار العقود الذكي
          <Sparkles className="size-6 text-primary fill-primary/20" />
        </h2>
        <p className="text-slate-500 mt-1">توليد مسودات احترافية مدعومة بالذكاء الاصطناعي مع ربط محاسبي تلقائي.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:w-full">
        <Card className="border-none shadow-lg rounded-2xl overflow-hidden print:hidden">
          <CardHeader className="bg-slate-50 border-b p-6">
            <CardTitle className="text-lg font-headline flex items-center gap-2 font-black text-slate-800">
              <FileText className="size-5 text-primary" />
              تفاصيل العقد والربط العقاري
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">اختيار العقار من القائمة</Label>
                  <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId} required>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="اختر العقار المعني" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties?.length ? properties.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      )) : (
                        <div className="p-2 text-center text-sm">أضف عقاراتك أولاً</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">اختيار المستأجر من القائمة</Label>
                  <Select value={selectedTenantId} onValueChange={setSelectedTenantId} required>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="اختر المستأجر" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants?.length ? tenants.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      )) : (
                        <div className="p-2 text-center text-sm">أضف مستأجرين أولاً</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">اسم المالك (المؤجر)</Label>
                  <Input name="landlordName" required defaultValue="مكتب صرح العقاري" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">دورية الدفع</Label>
                  <Select name="paymentFrequency" defaultValue="شهري">
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="شهري">شهري</SelectItem>
                      <SelectItem value="ربع سنوي">ربع سنوي</SelectItem>
                      <SelectItem value="نصف سنوي">نصف سنوي</SelectItem>
                      <SelectItem value="سنوي">سنوي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">العملة</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ر.س (ريال سعودي)</SelectItem>
                      <SelectItem value="KWD">د.ك (دينار كويتي)</SelectItem>
                      <SelectItem value="AED">د.إ (درهم إماراتي)</SelectItem>
                      <SelectItem value="USD">$ (دولار أمريكي)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">قيمة الإيجار</Label>
                  <Input name="rentalAmount" type="number" required placeholder="0.00" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">مبلغ التأمين</Label>
                  <Input name="securityDepositAmount" type="number" placeholder="0.00" className="rounded-xl h-12" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">تاريخ البداية</Label>
                  <Input name="leaseStartDate" type="date" required className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">تاريخ النهاية</Label>
                  <Input name="leaseEndDate" type="date" required className="rounded-xl h-12" />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2 py-6 rounded-xl shadow-lg font-black text-lg" disabled={loading}>
                {loading ? <Loader2 className="size-6 animate-spin" /> : <Sparkles className="size-6" />}
                توليد المسودة بالذكاء الاصطناعي
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg rounded-2xl overflow-hidden min-h-[600px] flex flex-col print:shadow-none print:border-none print:bg-white print:min-h-0 print:w-full">
          <CardHeader className="bg-slate-900 text-white border-b border-white/10 p-6 print:hidden">
            <CardTitle className="text-lg font-headline flex items-center justify-between font-black">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                المسودة القانونية المقترحة
              </div>
              {result && (
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => window.print()}>
                  <Printer className="size-5" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden relative bg-white print:overflow-visible">
            {result ? (
              <div className="h-full overflow-y-auto p-10 print:p-0 prose prose-slate max-w-none text-right whitespace-pre-wrap leading-loose font-body text-slate-700 print:text-black print:overflow-visible">
                {result}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-slate-50/50">
                <div className="bg-white p-8 rounded-3xl shadow-sm mb-6 border-2 border-dashed border-slate-200">
                  <Sparkles className="size-14 text-primary/30" />
                </div>
                <h4 className="font-black text-slate-800 mb-2 font-headline text-xl">في انتظار البيانات</h4>
                <p className="max-w-[300px] leading-relaxed">اختر العقار والمستأجر وعبئ البيانات لتوليد عقد احترافي وربطه بالمنظومة المحاسبية.</p>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative size-20">
                    <Loader2 className="size-full text-primary animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-primary" />
                  </div>
                  <p className="font-black text-slate-900 text-xl font-headline">جاري صياغة البنود القانونية...</p>
                </div>
              </div>
            )}
          </CardContent>
          {result && (
            <div className="p-6 bg-slate-50 border-t flex gap-4 print:hidden">
              <Button 
                className="flex-1 rounded-xl h-14 font-black text-lg" 
                onClick={handleApproveContract}
                disabled={saving}
              >
                {saving ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="ml-2 h-5 w-5" />}
                اعتماد العقد وتنشيط المستأجر
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl h-14 font-bold" onClick={() => setResult(null)}>إلغاء</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

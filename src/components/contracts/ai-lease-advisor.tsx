
"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, FileText, Send, CheckCircle2, Loader2, Download, Printer, Building2, User } from 'lucide-react'
import { generateAIPoweredLease, AIPoweredLeaseGenerationInput } from '@/ai/flows/ai-powered-lease-generation'
import { useToast } from '@/hooks/use-toast'
import { useCollection, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase'
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'

export function AILeaseAdvisor() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: properties } = useCollection(db ? collection(db, 'properties') : null)
  const { data: tenants } = useCollection(db ? collection(db, 'tenants') : null)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [currency, setCurrency] = useState('SAR')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [selectedTenantId, setSelectedTenantId] = useState<string>('')
  
  // Current form data state to use during "Approve"
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
      toast({ variant: "destructive", title: "خطأ", description: "يرجى اختيار العقار والمستأجر أولاً." })
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
        title: "خطأ",
        description: "فشل إنشاء العقد. يرجى المحاولة مرة أخرى.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveContract = async () => {
    if (!currentContractData || !selectedPropertyId || !selectedTenantId) return
    
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
        createdAt: serverTimestamp(),
      }
      
      await addDoc(contractRef, newContract)

      // 2. Update Tenant Balance (Add accumulated debt if any, or set balance)
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
        title: "تم اعتماد العقد",
        description: "تم حفظ العقد وتحديث أرصدة المستأجر وإحصائيات العقار بنجاح.",
      })
      setResult(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في الاعتماد",
        description: "حدث خطأ أثناء تحديث البيانات المالية.",
      })
    } finally {
      setSaving(false)
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
        <p className="text-slate-500 mt-1">توليد مسودات عقود إيجار احترافية مدعومة بالذكاء الاصطناعي مع ربط مالي تلقائي.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              تفاصيل العقد والربط المالي
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اختيار العقار</Label>
                  <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId} required>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="اختر العقار المعني" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties?.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>اختيار المستأجر</Label>
                  <Select value={selectedTenantId} onValueChange={setSelectedTenantId} required>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="اختر المستأجر" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants?.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="landlordName">اسم المالك (المؤجر)</Label>
                  <Input id="landlordName" name="landlordName" required defaultValue="مكتب مدى إنماء للعقارات" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentFrequency">دورية الدفع</Label>
                  <Select name="paymentFrequency" defaultValue="شهري">
                    <SelectTrigger className="rounded-xl">
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
                  <Label>العملة</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ر.س</SelectItem>
                      <SelectItem value="KWD">د.ك</SelectItem>
                      <SelectItem value="AED">د.إ</SelectItem>
                      <SelectItem value="USD">$</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rentalAmount">قيمة الإيجار</Label>
                  <Input id="rentalAmount" name="rentalAmount" type="number" required placeholder="0.00" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityDepositAmount">مبلغ التأمين</Label>
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
                <Textarea id="maintenanceResponsibilities" name="maintenanceResponsibilities" placeholder="حدد من المسؤول عن الإصلاحات..." className="rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalTerms">شروط إضافية</Label>
                <Textarea id="additionalTerms" name="additionalTerms" placeholder="أي بنود أخرى..." className="rounded-xl" />
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
                <p className="text-sm max-w-[250px]">اختر العقار والمستأجر وعبئ البيانات لتوليد العقد وربطه مالياً.</p>
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
              <Button 
                className="flex-1 rounded-xl h-12 font-bold" 
                onClick={handleApproveContract}
                disabled={saving}
              >
                {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="ml-2 h-4 w-4" />}
                اعتماد العقد وربط المستأجر
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setResult(null)}>إلغاء</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

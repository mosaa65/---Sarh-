"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { aiFinancialReportSummary, AIFinancialReportSummaryOutput } from '@/ai/flows/ai-financial-report-summary'
import { FileSearch, Loader2, BarChart3, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function FinancialSummaryTool() {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<AIFinancialReportSummaryOutput | null>(null)
  const [text, setText] = useState('')

  const handleAnalyze = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const summary = await aiFinancialReportSummary({
        financialReportText: text,
        portfolioContext: "عقارات سكنية وتجارية في الرياض وجدة."
      })
      setReport(summary)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold font-headline text-slate-900 tracking-tight">التقارير المالية الذكية</h2>
        <p className="text-slate-500 mt-1">حلل تقاريرك المالية بضغطة زر باستخدام الذكاء الاصطناعي.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-headline">إدخال البيانات</CardTitle>
            <CardDescription>الصق نص التقرير المالي هنا لتحليله.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>نص التقرير المالي</Label>
              <Textarea 
                placeholder="أدخل نص التقرير الشهري أو الميزانية..." 
                className="min-h-[400px] bg-slate-50"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <Button className="w-full h-12 gap-2" disabled={loading || !text} onClick={handleAnalyze}>
              {loading ? <Loader2 className="size-5 animate-spin" /> : <FileSearch className="size-5" />}
              تحليل التقرير فوراً
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {report ? (
            <div className="space-y-6 animate-in slide-in-from-left duration-500">
              <Card className="border-none shadow-md rounded-2xl bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <CheckCircle2 className="size-5" />
                    ملخص التقرير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed font-medium">
                    {report.summary}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {report.keyPerformanceIndicators.map((kpi, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-xl">
                    <CardContent className="p-4">
                      <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mb-1">{kpi.name}</p>
                      <h4 className="text-xl font-bold font-headline">{kpi.value}</h4>
                      {kpi.description && <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-headline flex items-center gap-2">
                      <TrendingUp className="size-4 text-green-500" />
                      اتجاهات ملحوظة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {report.notableTrends.map((trend, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm bg-green-50/50 p-3 rounded-xl border border-green-100/50">
                          <Badge variant="outline" className="mt-0.5 size-5 flex items-center justify-center rounded-full p-0 shrink-0 text-[10px]">{i+1}</Badge>
                          <span>{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-headline flex items-center gap-2">
                      <AlertCircle className="size-4 text-destructive" />
                      تنبيهات ومخاطر
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {report.potentialIssues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm bg-destructive/5 p-3 rounded-xl border border-destructive/10">
                          <Badge variant="destructive" className="mt-0.5 size-5 flex items-center justify-center rounded-full p-0 shrink-0 text-[10px]">{i+1}</Badge>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="bg-white p-8 rounded-full shadow-sm mb-6 border">
                <BarChart3 className="size-16 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 font-headline">جاهز للتحليل المالي</h3>
              <p className="text-slate-500 max-w-sm">الذكاء الاصطناعي سيقوم باستخراج المؤشرات والاتجاهات والمخاطر من تقريرك المالي تلقائياً.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

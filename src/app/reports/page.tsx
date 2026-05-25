import { MainLayout } from '@/components/layout/main-layout';
import { FinancialSummaryTool } from '@/components/reports/financial-summary-tool';

export default function ReportsPage() {
  return (
    <MainLayout>
      <FinancialSummaryTool />
    </MainLayout>
  );
}

import { MainLayout } from '@/components/layout/main-layout';
import { TenantLedger } from '@/components/tenants/tenant-ledger';

export default function TenantsPage() {
  return (
    <MainLayout>
      <TenantLedger />
    </MainLayout>
  );
}

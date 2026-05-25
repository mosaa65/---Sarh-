import { MainLayout } from '@/components/layout/main-layout';
import { BentoDashboard } from '@/components/dashboard/bento-dashboard';

export default function Home() {
  return (
    <MainLayout>
      <BentoDashboard />
    </MainLayout>
  );
}

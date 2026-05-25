import { MainLayout } from '@/components/layout/main-layout';
import { PaymentTracker } from '@/components/payments/payment-tracker';

export default function PaymentsPage() {
  return (
    <MainLayout>
      <PaymentTracker />
    </MainLayout>
  );
}

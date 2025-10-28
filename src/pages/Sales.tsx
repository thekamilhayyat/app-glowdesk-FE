import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { POSCheckout } from '@/components/pos/POSCheckout';
import { SalesHistory } from '@/components/pos/SalesHistory';
import { TransactionDetail } from '@/components/pos/TransactionDetail';
import { useCalendarStore } from '@/stores/calendarStore';
import { useSalesStore } from '@/stores/salesStore';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { Sale } from '@/types/checkout';
import { notify } from '@/lib/notification';
import { ShoppingCart, History } from 'lucide-react';

export default function Sales() {
  const { clients, services, staff } = useCalendarStore();
  const { addSale } = useSalesStore();
  const { updateAppointment } = useCalendarStore();
  
  const [activeTab, setActiveTab] = useState<'new-sale' | 'history'>('new-sale');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleCompleteSale = (saleData: {
    clientId: string;
    items: any[];
    paymentMethods: any[];
    tip: number;
  }) => {
    // Find client name
    const client = clients.find((c) => c.id === saleData.clientId);
    if (!client) {
      notify.error({
        title: 'Error',
        message: 'Client not found',
      });
      return;
    }

    // Calculate totals
    const subtotal = saleData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalDiscount = saleData.items.reduce((sum, item) => {
      if (!item.discount) return sum;
      const itemTotal = item.price * item.quantity;
      const discountAmount =
        item.discount.type === 'percentage'
          ? itemTotal * (item.discount.value / 100)
          : item.discount.value;
      return sum + discountAmount;
    }, 0);

    const taxableAmount = subtotal - totalDiscount;
    const tax = taxableAmount * 0.0825; // 8.25% tax rate
    const total = taxableAmount + tax + saleData.tip;

    // Create transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create sale record
    const sale: Sale = {
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId,
      clientId: saleData.clientId,
      clientName: client.name || `${client.firstName} ${client.lastName}`,
      items: saleData.items,
      subtotal,
      totalDiscount,
      tax,
      tip: saleData.tip,
      total,
      paymentMethods: saleData.paymentMethods,
      status: 'completed',
      completedAt: new Date(),
      createdAt: new Date(),
    };

    // Add to store
    addSale(sale);

    // Show success notification
    notify.success({
      title: 'Sale Completed',
      message: `Transaction ${transactionId} completed successfully`,
    });

    // Switch to history tab
    setActiveTab('history');
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailOpen(true);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground mt-2">
            Process sales and view transaction history
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'new-sale' | 'history')}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="new-sale" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              New Sale
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Sales History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-sale" className="mt-0">
            <POSCheckout
              clients={clients}
              services={services}
              staff={staff}
              onComplete={handleCompleteSale}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <SalesHistory onViewDetails={handleViewDetails} />
          </TabsContent>
        </Tabs>

        {/* Transaction Detail Drawer */}
        <TransactionDetail
          sale={selectedSale}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedSale(null);
          }}
        />
      </div>
    </AppLayout>
  );
}


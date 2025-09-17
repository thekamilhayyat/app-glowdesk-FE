import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { CheckoutItems } from './CheckoutItems';
import { CheckoutPayment } from './CheckoutPayment';
import { CheckoutConfirmation } from './CheckoutConfirmation';

export function CheckoutDialog() {
  const { isOpen, currentStep, closeCheckout } = useCheckoutStore();

  const renderStep = () => {
    switch (currentStep) {
      case 'items':
        return <CheckoutItems />;
      case 'payment':
        return <CheckoutPayment />;
      case 'confirmation':
        return <CheckoutConfirmation />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'items':
        return 'Review Services & Add Items';
      case 'payment':
        return 'Payment & Tip';
      case 'confirmation':
        return 'Payment Confirmation';
      default:
        return 'Checkout';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeCheckout}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="checkout-dialog-title">
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4" data-testid="checkout-dialog-content">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
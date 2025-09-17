import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Printer, Mail, Download } from 'lucide-react';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { format } from 'date-fns';

export function CheckoutConfirmation() {
  const {
    currentSession,
    closeCheckout,
    reset,
  } = useCheckoutStore();

  if (!currentSession) return null;

  const handlePrintReceipt = () => {
    // TODO: Implement receipt printing
    console.log('Print receipt');
  };

  const handleEmailReceipt = () => {
    // TODO: Implement email receipt
    console.log('Email receipt');
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    console.log('Download receipt');
  };

  const handleFinish = () => {
    reset();
    closeCheckout();
  };

  return (
    <div className="space-y-6" data-testid="checkout-confirmation">
      {/* Success Header */}
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-green-700">Payment Successful!</h2>
        <p className="text-gray-600 mt-2">
          Transaction completed on {format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}
        </p>
      </div>

      {/* Receipt Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Receipt #{currentSession.id.slice(-8).toUpperCase()}
            <Badge variant="outline" className="text-green-700 border-green-700">
              PAID
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items */}
          <div className="space-y-2">
            <h4 className="font-medium">Services & Products:</h4>
            {currentSession.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <span>{item.name}</span>
                  {item.quantity > 1 && (
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  )}
                  {item.discount && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {item.discount.value}{item.discount.type === 'percentage' ? '%' : '$'} off
                    </Badge>
                  )}
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${currentSession.subtotal.toFixed(2)}</span>
            </div>
            
            {currentSession.totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Total Discount:</span>
                <span>-${currentSession.totalDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${currentSession.tax.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Tip:</span>
              <span>${currentSession.tip.toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Paid:</span>
              <span data-testid="total-paid">${currentSession.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Payment Methods */}
          <div className="space-y-2">
            <h4 className="font-medium">Payment Methods:</h4>
            {currentSession.paymentMethods.map((payment, index) => (
              <div key={index} className="flex justify-between">
                <span className="capitalize">{payment.type.replace('-', ' ')}</span>
                <span>${payment.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Receipt Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Receipt Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={handlePrintReceipt}
              data-testid="button-print-receipt"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            
            <Button
              variant="outline"
              onClick={handleEmailReceipt}
              data-testid="button-email-receipt"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Receipt
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDownloadReceipt}
              data-testid="button-download-receipt"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Finish Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleFinish}
          size="lg"
          className="px-8"
          data-testid="button-finish-checkout"
        >
          Complete Checkout
        </Button>
      </div>
    </div>
  );
}
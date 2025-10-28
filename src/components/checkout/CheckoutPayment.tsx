import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, DollarSign, Gift, Check, Smartphone } from 'lucide-react';
import { useCheckoutStore } from '@/stores/checkoutStore';

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: DollarSign },
  { id: 'credit-card', label: 'Credit Card', icon: CreditCard },
  { id: 'gift-card', label: 'Gift Card', icon: Gift },
  { id: 'check', label: 'Check', icon: Check },
  { id: 'online', label: 'Online Payment', icon: Smartphone },
];

const tipPresets = [15, 18, 20, 25];

export function CheckoutPayment() {
  const {
    currentSession,
    selectedPaymentMethods,
    tipAmount,
    tipPercentage,
    isProcessing,
    error,
    setCurrentStep,
    setTip,
    addPaymentMethod,
    removePaymentMethod,
    calculateSubtotal,
    calculateTotalDiscount,
    calculateTax,
    calculateTotal,
    getRemainingBalance,
    processPayment,
    completeCheckout,
  } = useCheckoutStore();

  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [customTip, setCustomTip] = useState<string>('');

  if (!currentSession) return null;

  const subtotal = calculateSubtotal();
  const totalDiscount = calculateTotalDiscount();
  const tax = calculateTax();
  const baseTotal = subtotal - totalDiscount + tax;
  const finalTotal = calculateTotal();
  const remainingBalance = getRemainingBalance();

  const handleTipSelect = (percentage: number) => {
    const tipAmount = baseTotal * (percentage / 100);
    setTip(tipAmount, percentage);
    setCustomTip('');
  };

  const handleCustomTip = (value: string) => {
    setCustomTip(value);
    const amount = parseFloat(value) || 0;
    setTip(amount, null);
  };

  const handleAddPayment = () => {
    if (!selectedMethod || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    addPaymentMethod({
      type: selectedMethod as any,
      amount: Math.min(amount, remainingBalance),
    });

    setSelectedMethod('');
    setPaymentAmount('');
  };

  const handleProcessPayment = async () => {
    const success = await processPayment();
    if (success) {
      completeCheckout();
    }
  };

  return (
    <div className="space-y-6" data-testid="checkout-payment">
      {/* Tip Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Add Tip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {tipPresets.map((percentage) => (
              <Button
                key={percentage}
                variant={tipPercentage === percentage ? 'default' : 'outline'}
                onClick={() => handleTipSelect(percentage)}
                data-testid={`tip-preset-${percentage}`}
              >
                {percentage}%
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="custom-tip">Custom Tip:</Label>
            <Input
              id="custom-tip"
              type="number"
              placeholder="0.00"
              value={customTip}
              onChange={(e) => handleCustomTip(e.target.value)}
              className="w-24"
              data-testid="input-custom-tip"
            />
            <span className="text-sm text-muted-foreground">
              Current tip: ${tipAmount.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          {totalDiscount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount:</span>
              <span>-${totalDiscount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Tip:</span>
            <span data-testid="tip-amount">${tipAmount.toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span data-testid="final-total">${finalTotal.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Applied payments */}
          {selectedPaymentMethods.length > 0 && (
            <div className="space-y-2">
              <Label>Applied Payments:</Label>
              {selectedPaymentMethods.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="capitalize">{payment.type.replace('-', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span>${payment.amount.toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePaymentMethod(payment.id)}
                      data-testid={`remove-payment-${payment.id}`}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Remaining balance */}
          {remainingBalance > 0 && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Remaining Balance:</span>
                <span className="font-semibold text-lg" data-testid="remaining-balance">
                  ${remainingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Add payment method */}
          {remainingBalance > 0 && (
            <div className="space-y-3">
              <Label>Add Payment Method:</Label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Button
                      key={method.id}
                      variant={selectedMethod === method.id ? 'default' : 'outline'}
                      className="h-12"
                      onClick={() => setSelectedMethod(method.id)}
                      data-testid={`payment-method-${method.id}`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {method.label}
                    </Button>
                  );
                })}
              </div>

              {selectedMethod && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="flex-1"
                    max={remainingBalance}
                    data-testid="payment-amount-input"
                  />
                  <Button
                    onClick={handleAddPayment}
                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                    data-testid="button-add-payment"
                  >
                    Add Payment
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('items')}
          disabled={isProcessing}
        >
          Back to Items
        </Button>
        
        <Button
          onClick={handleProcessPayment}
          disabled={remainingBalance > 0.01 || isProcessing}
          data-testid="button-process-payment"
        >
          {isProcessing ? 'Processing...' : 'Process Payment'}
        </Button>
      </div>
    </div>
  );
}
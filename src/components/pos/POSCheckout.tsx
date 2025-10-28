import { useState, useEffect } from 'react';
import { BaseCard } from '@/components/base/BaseCard';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseSelect, BaseSelectItem } from '@/components/base/BaseSelect';
import { BaseLabel } from '@/components/base/BaseLabel';
import { BaseInput } from '@/components/base/BaseInput';
import { Plus, Trash2, Percent, DollarSign, ShoppingCart, X } from 'lucide-react';
import { CheckoutItem, PaymentMethod } from '@/types/checkout';
import { Client } from '@/types/client';
import { Service } from '@/types/service';
import { StaffMember } from '@/types/staff';
import { notify } from '@/lib/notification';

interface POSCheckoutProps {
  clients: Client[];
  services: Service[];
  staff: StaffMember[];
  onComplete: (saleData: {
    clientId: string;
    items: CheckoutItem[];
    paymentMethods: PaymentMethod[];
    tip: number;
  }) => void;
}

export function POSCheckout({ clients, services, staff, onComplete }: POSCheckoutProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [tip, setTip] = useState(0);
  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currentPaymentType, setCurrentPaymentType] = useState<PaymentMethod['type']>('cash');
  const [currentPaymentAmount, setCurrentPaymentAmount] = useState('');
  const [currentPaymentRef, setCurrentPaymentRef] = useState('');
  const [activeDiscountItem, setActiveDiscountItem] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');

  const taxRate = 0.0825; // 8.25%

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const totalDiscount = items.reduce((sum, item) => {
    if (!item.discount) return sum;
    const itemTotal = item.price * item.quantity;
    const discountAmount =
      item.discount.type === 'percentage'
        ? itemTotal * (item.discount.value / 100)
        : item.discount.value;
    return sum + discountAmount;
  }, 0);
  
  const taxableAmount = subtotal - totalDiscount;
  const tax = taxableAmount * taxRate;
  const total = taxableAmount + tax + tip;
  
  const totalPaid = paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
  const remainingBalance = Math.max(0, total - totalPaid);

  // Add item to cart
  const handleAddItem = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    const newItem: CheckoutItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'service',
      name: service.name,
      price: service.price,
      quantity: 1,
      serviceId: service.id,
    };

    setItems([...items, newItem]);
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Update item quantity
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Update item staff
  const handleUpdateStaff = (itemId: string, staffId: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, staffId } : item
      )
    );
  };

  // Apply discount to item
  const handleApplyDiscount = (itemId: string, type: 'percentage' | 'fixed', value: number) => {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, discount: { type, value } }
          : item
      )
    );
  };

  // Remove discount from item
  const handleRemoveDiscount = (itemId: string) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const { discount, ...rest } = item;
          return rest;
        }
        return item;
      })
    );
  };

  // Show discount input for specific item
  const handleShowDiscountInput = (itemId: string, type: 'percentage' | 'fixed') => {
    setActiveDiscountItem(itemId);
    setDiscountType(type);
    setDiscountValue('');
  };

  // Apply the discount from the input field
  const handleSubmitDiscount = () => {
    if (activeDiscountItem && discountValue) {
      const value = parseFloat(discountValue);
      if (!isNaN(value) && value > 0) {
        if (discountType === 'percentage' && value <= 100) {
          handleApplyDiscount(activeDiscountItem, discountType, value);
          setActiveDiscountItem(null);
          setDiscountValue('');
        } else if (discountType === 'fixed') {
          handleApplyDiscount(activeDiscountItem, discountType, value);
          setActiveDiscountItem(null);
          setDiscountValue('');
        }
      }
    }
  };

  // Cancel discount input
  const handleCancelDiscount = () => {
    setActiveDiscountItem(null);
    setDiscountValue('');
  };

  // Handle tip quick buttons
  const handleTipQuick = (percentage: number) => {
    const tipAmount = (subtotal - totalDiscount) * (percentage / 100);
    setTip(tipAmount);
    setTipPercentage(percentage);
  };

  // Handle custom tip
  const handleCustomTip = (value: string) => {
    const amount = parseFloat(value) || 0;
    setTip(amount);
    setTipPercentage(null);
  };

  // Add payment method
  const handleAddPayment = () => {
    const amount = parseFloat(currentPaymentAmount);
    
    if (!amount || amount <= 0) {
      notify.error({
        title: 'Invalid Amount',
        message: 'Please enter a valid payment amount',
      });
      return;
    }

    if (amount > remainingBalance) {
      notify.error({
        title: 'Amount Too Large',
        message: `Payment amount cannot exceed remaining balance of $${remainingBalance.toFixed(2)}`,
      });
      return;
    }

    const newPayment: PaymentMethod = {
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: currentPaymentType,
      amount,
      reference: currentPaymentRef || undefined,
    };

    setPaymentMethods([...paymentMethods, newPayment]);
    setCurrentPaymentAmount('');
    setCurrentPaymentRef('');
  };

  // Remove payment method
  const handleRemovePayment = (paymentId: string) => {
    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== paymentId));
  };

  // Complete sale
  const handleCompleteSale = () => {
    if (!selectedClientId) {
      notify.error({
        title: 'Client Required',
        message: 'Please select a client',
      });
      return;
    }

    if (items.length === 0) {
      notify.error({
        title: 'No Items',
        message: 'Please add at least one item to the sale',
      });
      return;
    }

    if (remainingBalance > 0.01) {
      notify.error({
        title: 'Payment Incomplete',
        message: `Remaining balance of $${remainingBalance.toFixed(2)} must be paid`,
      });
      return;
    }

    if (paymentMethods.length === 0) {
      notify.error({
        title: 'Payment Required',
        message: 'Please add at least one payment method',
      });
      return;
    }

    onComplete({
      clientId: selectedClientId,
      items,
      paymentMethods,
      tip,
    });

    // Reset form
    setSelectedClientId('');
    setItems([]);
    setTip(0);
    setTipPercentage(null);
    setPaymentMethods([]);
    setCurrentPaymentAmount('');
    setCurrentPaymentRef('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Items & Client */}
      <div className="space-y-6">
        {/* Client Selection */}
        <BaseCard>
          <BaseLabel>Select Client *</BaseLabel>
          <BaseSelect
            value={selectedClientId}
            onValueChange={setSelectedClientId}
            placeholder="Choose a client"
          >
            {clients.map((client) => (
              <BaseSelectItem key={client.id} value={client.id}>
                {client.name || `${client.firstName} ${client.lastName}`}
              </BaseSelectItem>
            ))}
          </BaseSelect>
        </BaseCard>

        {/* Add Services */}
        <BaseCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Services/Products</h3>
            </div>
            
            <div className="flex gap-2">
              <BaseSelect
                value=""
                onValueChange={handleAddItem}
                placeholder="Select a service to add"
              >
                {services.map((service) => (
                  <BaseSelectItem key={service.id} value={service.id}>
                    {service.name} - ${service.price.toFixed(2)}
                  </BaseSelectItem>
                ))}
              </BaseSelect>
              <BaseButton variant="gradient" size="icon">
                <Plus className="h-4 w-4" />
              </BaseButton>
            </div>
          </div>
        </BaseCard>

        {/* Items List */}
        <BaseCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({items.length} items)
            </h3>
            
            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No items added yet. Select services above to add them.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-md p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <BaseButton
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </BaseButton>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <BaseLabel>Quantity</BaseLabel>
                        <BaseInput
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(item.id, parseInt(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <BaseLabel>Staff</BaseLabel>
                        <BaseSelect
                          value={item.staffId || ''}
                          onValueChange={(value) =>
                            handleUpdateStaff(item.id, value)
                          }
                          placeholder="Select staff"
                        >
                          {staff.map((s) => (
                            <BaseSelectItem key={s.id} value={s.id}>
                              {s.firstName} {s.lastName}
                            </BaseSelectItem>
                          ))}
                        </BaseSelect>
                      </div>
                    </div>

                    {item.discount ? (
                      <div className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm">
                          Discount: {item.discount.type === 'percentage' ? `${item.discount.value}%` : `$${item.discount.value}`}
                        </span>
                        <BaseButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDiscount(item.id)}
                        >
                          Remove
                        </BaseButton>
                      </div>
                    ) : activeDiscountItem === item.id ? (
                      <div className="relative flex items-center gap-2 bg-muted/50 p-2 rounded w-full">
                        <BaseLabel className="text-sm whitespace-nowrap">
                          {discountType === 'percentage' ? 'Discount %:' : 'Discount $:'}
                        </BaseLabel>
                        <BaseInput
                          type="number"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder={discountType === 'percentage' ? '0-100' : 'Amount'}
                          className="flex-1"
                          min="0"
                          max={discountType === 'percentage' ? 100 : undefined}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSubmitDiscount();
                            } else if (e.key === 'Escape') {
                              handleCancelDiscount();
                            }
                          }}
                        />
                        <BaseButton
                          size="sm"
                          onClick={handleSubmitDiscount}
                          disabled={!discountValue}
                        >
                          Apply
                        </BaseButton>
                        <BaseButton
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelDiscount}
                          className="absolute -right-1.5 -top-1.5 h-[18px] w-[18px] bg-primary/80 hover:bg-primary/90 p-0 min-w-0 flex items-center justify-center cursor-pointer"
                          style={{ borderRadius: '50%' }}
                        >
                          <X className="text-white" style={{ width: '12px', height: '12px' }} strokeWidth={2.5} />
                        </BaseButton>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <BaseButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowDiscountInput(item.id, 'percentage')}
                        >
                          <Percent className="h-3 w-3 mr-1" />
                          % Off
                        </BaseButton>
                        <BaseButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowDiscountInput(item.id, 'fixed')}
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          $ Off
                        </BaseButton>
                      </div>
                    )}

                    <div className="pt-2 border-t flex justify-between font-medium">
                      <span>Item Total:</span>
                      <span>
                        ${((item.price * item.quantity) - (item.discount ? (item.discount.type === 'percentage' ? (item.price * item.quantity * item.discount.value / 100) : item.discount.value) : 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </BaseCard>
      </div>

      {/* Right Column: Payment & Summary */}
      <div className="space-y-6">
        {/* Summary */}
        <BaseCard>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${totalDiscount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Tax ({(taxRate * 100).toFixed(2)}%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Tip:</span>
                <span>${tip.toFixed(2)}</span>
              </div>
              
              <div className="pt-2 border-t flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </BaseCard>

        {/* Tip */}
        <BaseCard>
          <div className="space-y-4">
            <BaseLabel>Add Tip</BaseLabel>
            
            <div className="grid grid-cols-4 gap-2">
              {[15, 18, 20, 25].map((percent) => (
                <BaseButton
                  key={percent}
                  variant={tipPercentage === percent ? 'default' : 'outline'}
                  onClick={() => handleTipQuick(percent)}
                >
                  {percent}%
                </BaseButton>
              ))}
            </div>
            
            <div>
              <BaseLabel>Custom Tip Amount</BaseLabel>
              <BaseInput
                type="number"
                step="0.01"
                placeholder="0.00"
                value={tipPercentage === null ? tip : ''}
                onChange={(e) => handleCustomTip(e.target.value)}
              />
            </div>
          </div>
        </BaseCard>

        {/* Payment Methods */}
        <BaseCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment</h3>
            
            <div className="space-y-3">
              <div>
                <BaseLabel>Payment Type</BaseLabel>
                <BaseSelect
                  value={currentPaymentType}
                  onValueChange={(value) => setCurrentPaymentType(value as PaymentMethod['type'])}
                >
                  <BaseSelectItem value="cash">Cash</BaseSelectItem>
                  <BaseSelectItem value="credit-card">Credit Card</BaseSelectItem>
                  <BaseSelectItem value="gift-card">Gift Card</BaseSelectItem>
                  <BaseSelectItem value="check">Check</BaseSelectItem>
                  <BaseSelectItem value="online">Online</BaseSelectItem>
                </BaseSelect>
              </div>
              
              <div>
                <BaseLabel>Amount</BaseLabel>
                <BaseInput
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={currentPaymentAmount}
                  onChange={(e) => setCurrentPaymentAmount(e.target.value)}
                />
              </div>
              
              {currentPaymentType !== 'cash' && (
                <div>
                  <BaseLabel>Reference (Last 4, Check #, etc.)</BaseLabel>
                  <BaseInput
                    placeholder="Optional"
                    value={currentPaymentRef}
                    onChange={(e) => setCurrentPaymentRef(e.target.value)}
                  />
                </div>
              )}
              
              <BaseButton
                variant="outline"
                className="w-full"
                onClick={handleAddPayment}
                disabled={!currentPaymentAmount || parseFloat(currentPaymentAmount) <= 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </BaseButton>
            </div>

            {/* Payment Methods List */}
            {paymentMethods.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium text-sm">Payments Added:</h4>
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="flex items-center justify-between bg-muted p-2 rounded"
                  >
                    <div>
                      <span className="font-medium capitalize">
                        {pm.type.replace('-', ' ')}
                      </span>
                      {pm.reference && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({pm.reference})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${pm.amount.toFixed(2)}</span>
                      <BaseButton
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePayment(pm.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </BaseButton>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Remaining Balance */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Paid:</span>
                <span className="font-bold">${totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Remaining Balance:</span>
                <span className={`font-bold ${remainingBalance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  ${remainingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </BaseCard>

        {/* Complete Sale Button */}
        <BaseButton
          variant="gradient"
          className="w-full h-12 text-lg"
          onClick={handleCompleteSale}
          disabled={items.length === 0 || !selectedClientId || remainingBalance > 0.01}
        >
          Complete Sale
        </BaseButton>
      </div>
    </div>
  );
}


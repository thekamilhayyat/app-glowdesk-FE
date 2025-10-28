import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, Tag } from 'lucide-react';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { CheckoutItem } from '@/types/calendar';

export function CheckoutItems() {
  const {
    currentSession,
    setCurrentStep,
    addItem,
    updateItem,
    removeItem,
    applyDiscount,
    calculateSubtotal,
    calculateTotalDiscount,
    calculateTax,
  } = useCheckoutStore();

  if (!currentSession) return null;

  const subtotal = calculateSubtotal();
  const totalDiscount = calculateTotalDiscount();
  const tax = calculateTax();
  const total = subtotal - totalDiscount + tax;

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      updateItem(itemId, { quantity });
    }
  };

  const handleAddService = () => {
    // TODO: Open service selection dialog
    addItem({
      type: 'service',
      name: 'Additional Service',
      price: 50,
      quantity: 1,
    });
  };

  const handleAddProduct = () => {
    // TODO: Open product selection dialog
    addItem({
      type: 'product',
      name: 'Hair Product',
      price: 25,
      quantity: 1,
    });
  };

  const handleApplyDiscount = (itemId?: string) => {
    // TODO: Open discount dialog
    const discountPercent = prompt('Enter discount percentage (0-100):');
    if (discountPercent && !isNaN(Number(discountPercent))) {
      applyDiscount(itemId || null, {
        type: 'percentage',
        value: Number(discountPercent),
      });
    }
  };

  return (
    <div className="space-y-6" data-testid="checkout-items">
      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Services & Products
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddService}
                data-testid="button-add-service"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Service
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddProduct}
                data-testid="button-add-product"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentSession.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items added yet. Add services or products to get started.
            </div>
          ) : (
            currentSession.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.name}</h4>
                    <Badge variant="outline">
                      {item.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Label>Qty:</Label>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                          className="w-16 text-center"
                          min="1"
                          data-testid={`input-quantity-${item.id}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApplyDiscount(item.id)}
                      data-testid={`button-discount-${item.id}`}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {item.discount ? `${item.discount.value}% off` : 'Discount'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`button-remove-${item.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                  {item.discount && (
                    <div className="text-sm text-green-600">
                      -{item.discount.type === 'percentage' 
                        ? `${item.discount.value}%` 
                        : `$${item.discount.value}`}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span data-testid="subtotal">${subtotal.toFixed(2)}</span>
          </div>
          
          {totalDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Total Discount:</span>
              <span data-testid="total-discount">-${totalDiscount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>Tax:</span>
            <span data-testid="tax">${tax.toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span data-testid="total">${total.toFixed(2)}</span>
          </div>

          <div className="pt-4">
            <Button
              variant="ghost"
              onClick={() => handleApplyDiscount()}
              className="w-full"
              data-testid="button-apply-discount-all"
            >
              <Tag className="h-4 w-4 mr-2" />
              Apply Discount to Entire Order
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('items')}
          disabled
        >
          Back
        </Button>
        
        <Button
          onClick={() => setCurrentStep('payment')}
          disabled={currentSession.items.length === 0}
          data-testid="button-proceed-payment"
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseBadge } from '@/components/base/BaseBadge';
import { Separator } from '@/components/ui/separator';
import { Sale } from '@/types/checkout';
import { format } from 'date-fns';
import { Printer, Mail, Download, Receipt, User, Calendar, CreditCard } from 'lucide-react';

interface TransactionDetailProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetail({ sale, isOpen, onClose }: TransactionDetailProps) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    // TODO: Implement email functionality
    console.log('Email receipt for sale:', sale.id);
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log('Download receipt for sale:', sale.id);
  };

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-wrap gap-2">
          <BaseButton variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </BaseButton>
          <BaseButton variant="outline" size="sm" onClick={handleEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </BaseButton>
          <BaseButton variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </BaseButton>
        </div>

        {/* Receipt Container */}
        <div className="bg-card rounded-md border border-border p-8 print:border-0 print:shadow-none">
          {/* Business Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full mb-4">
              <Receipt className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Glowdesk</h2>
            <p className="text-sm text-muted-foreground">Salon Management System</p>
          </div>

          <Separator className="my-6" />

          {/* Transaction Info */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Transaction ID:</span>
              <span className="font-mono font-medium">{sale.transactionId}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Date & Time:</span>
              <span className="font-medium">
                {format(new Date(sale.completedAt), 'MMM dd, yyyy • h:mm a')}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status:</span>
              <BaseBadge variant={sale.status === 'completed' ? 'success' : 'default'}>
                {sale.status}
              </BaseBadge>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Client Information */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Client Information</h3>
            </div>
            <div className="bg-muted rounded-md p-4">
              <p className="font-medium text-lg">{sale.clientName}</p>
              {sale.notes && (
                <p className="text-sm text-muted-foreground mt-1">{sale.notes}</p>
              )}
            </div>
          </div>

          {sale.completedByName && (
            <>
              <Separator className="my-6" />
              
              {/* Completed By */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Processed By</h3>
                </div>
                <p className="text-muted-foreground">{sale.completedByName}</p>
              </div>
            </>
          )}

          <Separator className="my-6" />

          {/* Items */}
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Items</h3>
            <div className="space-y-4">
              {sale.items.map((item, index) => (
                <div key={item.id || index} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>Qty: {item.quantity}</span>
                        <span>•</span>
                        <span>${item.price.toFixed(2)} each</span>
                        {item.staffId && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{item.type}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.discount && (
                        <p className="text-sm text-green-600">
                          -{item.discount.type === 'percentage'
                            ? `${item.discount.value}%`
                            : `$${item.discount.value.toFixed(2)}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {item.discount && (
                    <div className="flex justify-between text-sm text-muted-foreground pl-4">
                      <span>After discount:</span>
                      <span>
                        ${(
                          item.price * item.quantity -
                          (item.discount.type === 'percentage'
                            ? (item.price * item.quantity * item.discount.value) / 100
                            : item.discount.value)
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Summary */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${sale.subtotal.toFixed(2)}</span>
            </div>

            {sale.totalDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Total Discount:</span>
                <span>-${sale.totalDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax:</span>
              <span>${sale.tax.toFixed(2)}</span>
            </div>

            {sale.tip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tip:</span>
                <span>${sale.tip.toFixed(2)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${sale.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Payment Methods */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Payment Methods</h3>
            </div>
            <div className="space-y-3">
              {sale.paymentMethods.map((pm, index) => (
                <div
                  key={pm.id || index}
                  className="flex justify-between items-center bg-muted rounded-md p-3"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {pm.type.replace('-', ' ')}
                    </p>
                    {pm.reference && (
                      <p className="text-sm text-muted-foreground">
                        {pm.type === 'credit-card'
                          ? `Card ending in ${pm.reference}`
                          : pm.reference}
                      </p>
                    )}
                  </div>
                  <p className="font-bold">${pm.amount.toFixed(2)}</p>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">Total Paid:</span>
                <span className="font-bold text-green-600">
                  ${sale.paymentMethods.reduce((sum, pm) => sum + pm.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Thank you for your business!
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This is a computer-generated receipt
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 print:hidden">
          <BaseButton variant="outline" className="flex-1" onClick={onClose}>
            Close
          </BaseButton>
          {sale.status === 'completed' && (
            <BaseButton variant="destructive" className="flex-1" disabled>
              Refund (Coming Soon)
            </BaseButton>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:border-0,
          .print\\:border-0 * {
            visibility: visible;
          }
          .print\\:border-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </BaseDrawer>
  );
}


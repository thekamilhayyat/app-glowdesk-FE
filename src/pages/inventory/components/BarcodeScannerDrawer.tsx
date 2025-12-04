import React, { useState, useCallback, useEffect } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseBadge } from '@/components/base/BaseBadge';
import { useInventoryStore } from '@/stores/inventoryStore';
import { InventoryItem } from '@/types/inventory';
import { toast } from 'sonner';
import { 
  Camera, 
  Package, 
  Search,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  XCircle,
  ScanLine,
  Flashlight,
  FlashlightOff,
  RotateCcw
} from 'lucide-react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

interface BarcodeScannerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductFound?: (item: InventoryItem) => void;
  onAdjustStock?: (item: InventoryItem, type: 'add' | 'remove') => void;
}

type ScanMode = 'lookup' | 'adjust-add' | 'adjust-remove';

export const BarcodeScannerDrawer: React.FC<BarcodeScannerDrawerProps> = ({
  open,
  onOpenChange,
  onProductFound,
  onAdjustStock,
}) => {
  const { items, adjustStock } = useInventoryStore();
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('lookup');
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [foundItem, setFoundItem] = useState<InventoryItem | null>(null);
  const [scanHistory, setScanHistory] = useState<{ code: string; item: InventoryItem | null; timestamp: Date }[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIsScanning(true);
      setFoundItem(null);
      setLastScannedCode(null);
      setCameraError(null);
    }
  }, [open]);

  useEffect(() => {
    if (foundItem) {
      const updatedItem = items.find(i => i.id === foundItem.id);
      if (updatedItem && updatedItem.currentStock !== foundItem.currentStock) {
        setFoundItem(updatedItem);
      }
    }
  }, [items, foundItem]);

  const findProductByBarcode = useCallback((barcode: string): InventoryItem | null => {
    return items.find(item => 
      item.barcode === barcode || 
      item.sku.toLowerCase() === barcode.toLowerCase()
    ) || null;
  }, [items]);

  const handleScan = useCallback((err: unknown, result: { getText: () => string } | null | undefined) => {
    if (err) {
      return;
    }
    
    if (result) {
      const code = result.getText();
      
      if (code === lastScannedCode) {
        return;
      }
      
      setLastScannedCode(code);
      const item = findProductByBarcode(code);
      setFoundItem(item);
      
      setScanHistory(prev => [
        { code, item, timestamp: new Date() },
        ...prev.slice(0, 9)
      ]);
      
      if (item) {
        toast.success(`Found: ${item.name}`);
        
        if (scanMode === 'adjust-add') {
          adjustStock(item.id, 1, 'received', 'Added via barcode scan');
          toast.success(`Added 1 unit of ${item.name}`);
        } else if (scanMode === 'adjust-remove') {
          if (item.currentStock > 0) {
            adjustStock(item.id, -1, 'used_in_service', 'Removed via barcode scan');
            toast.success(`Removed 1 unit of ${item.name}`);
          } else {
            toast.error(`${item.name} is out of stock`);
          }
        }
        
        onProductFound?.(item);
      } else {
        toast.error(`No product found for barcode: ${code}`);
      }
      
      setTimeout(() => {
        setLastScannedCode(null);
      }, 2000);
    }
  }, [lastScannedCode, findProductByBarcode, scanMode, adjustStock, onProductFound]);

  const handleCameraError = useCallback((error: string | DOMException) => {
    console.error('Camera error:', error);
    const errorName = typeof error === 'string' ? error : error.name;
    if (errorName === 'NotAllowedError') {
      setCameraError('Camera permission denied. Please allow camera access to scan barcodes.');
    } else if (errorName === 'NotFoundError') {
      setCameraError('No camera found. Please ensure your device has a camera.');
    } else {
      setCameraError('Unable to access camera. Please check your browser settings.');
    }
    setIsScanning(false);
  }, []);

  const handleReset = () => {
    setFoundItem(null);
    setLastScannedCode(null);
    setIsScanning(true);
    setCameraError(null);
  };

  const handleStockAdjust = (type: 'add' | 'remove') => {
    if (!foundItem) return;
    
    if (type === 'add') {
      adjustStock(foundItem.id, 1, 'received', 'Added via barcode scanner');
      toast.success(`Added 1 unit of ${foundItem.name}`);
    } else {
      if (foundItem.currentStock > 0) {
        adjustStock(foundItem.id, -1, 'used_in_service', 'Removed via barcode scanner');
        toast.success(`Removed 1 unit of ${foundItem.name}`);
      } else {
        toast.error(`${foundItem.name} is out of stock`);
      }
    }
    
    onAdjustStock?.(foundItem, type);
  };

  const getStockStatusBadge = (item: InventoryItem) => {
    if (item.currentStock <= 0) {
      return <BaseBadge variant="destructive">Out of Stock</BaseBadge>;
    }
    if (item.currentStock <= item.lowStockThreshold) {
      return <BaseBadge variant="secondary">Low Stock</BaseBadge>;
    }
    return <BaseBadge variant="outline">In Stock</BaseBadge>;
  };

  const getModeLabel = (mode: ScanMode) => {
    switch (mode) {
      case 'lookup': return 'Lookup';
      case 'adjust-add': return 'Quick Add (+1)';
      case 'adjust-remove': return 'Quick Remove (-1)';
    }
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Barcode Scanner"
      width={600}
    >
      <div className="flex flex-col h-full">
        <div className="flex gap-2 mb-4">
          {(['lookup', 'adjust-add', 'adjust-remove'] as ScanMode[]).map(mode => (
            <BaseButton
              key={mode}
              variant={scanMode === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScanMode(mode)}
            >
              {mode === 'lookup' && <Search className="h-4 w-4 mr-1" />}
              {mode === 'adjust-add' && <Plus className="h-4 w-4 mr-1" />}
              {mode === 'adjust-remove' && <Minus className="h-4 w-4 mr-1" />}
              {getModeLabel(mode)}
            </BaseButton>
          ))}
        </div>

        <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ minHeight: '300px' }}>
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-center mb-4">{cameraError}</p>
              <BaseButton onClick={handleReset} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </BaseButton>
            </div>
          ) : isScanning ? (
            <>
              <BarcodeScannerComponent
                width="100%"
                height={300}
                onUpdate={handleScan}
                onError={handleCameraError}
                facingMode="environment"
                torch={torchOn}
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-32 border-2 border-primary rounded-lg">
                  <div className="absolute -top-1 left-4 right-4 h-0.5 bg-primary animate-pulse" />
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <BaseButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setTorchOn(!torchOn)}
                  className="bg-black/50 hover:bg-black/70"
                >
                  {torchOn ? (
                    <FlashlightOff className="h-4 w-4" />
                  ) : (
                    <Flashlight className="h-4 w-4" />
                  )}
                </BaseButton>
              </div>
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm flex items-center gap-2">
                <ScanLine className="h-4 w-4 animate-pulse" />
                Mode: {getModeLabel(scanMode)}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
              <Camera className="h-12 w-12 mb-4 opacity-50" />
              <p className="mb-4">Camera paused</p>
              <BaseButton onClick={() => setIsScanning(true)}>
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </BaseButton>
            </div>
          )}
        </div>

        {foundItem && (
          <div className="p-4 bg-muted rounded-lg mb-4">
            <div className="flex items-start gap-4">
              {foundItem.imageUrl ? (
                <img 
                  src={foundItem.imageUrl} 
                  alt={foundItem.name}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{foundItem.name}</h3>
                  {getStockStatusBadge(foundItem)}
                </div>
                <p className="text-sm text-muted-foreground">SKU: {foundItem.sku}</p>
                {foundItem.barcode && (
                  <p className="text-sm text-muted-foreground">Barcode: {foundItem.barcode}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm">
                    Stock: <strong>{foundItem.currentStock}</strong>{foundItem.maxStock ? ` / ${foundItem.maxStock}` : ''}
                  </span>
                  <span className="text-sm">
                    Price: <strong>${foundItem.retailPrice?.toFixed(2) ?? 'N/A'}</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <BaseButton 
                variant="outline" 
                size="sm"
                onClick={() => handleStockAdjust('add')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Stock
              </BaseButton>
              <BaseButton 
                variant="outline" 
                size="sm"
                onClick={() => handleStockAdjust('remove')}
                disabled={foundItem.currentStock <= 0}
              >
                <Minus className="h-4 w-4 mr-1" />
                Remove Stock
              </BaseButton>
              <BaseButton
                variant="ghost"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Scan Another
              </BaseButton>
            </div>
          </div>
        )}

        {lastScannedCode && !foundItem && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>Product not found</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Scanned code: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{lastScannedCode}</code>
            </p>
            <BaseButton
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Try Again
            </BaseButton>
          </div>
        )}

        {scanHistory.length > 0 && (
          <div className="flex-1 overflow-auto">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <ScanLine className="h-4 w-4" />
              Scan History
            </h4>
            <div className="space-y-2">
              {scanHistory.map((entry, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    {entry.item ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-mono">{entry.code}</span>
                    {entry.item && (
                      <span className="text-muted-foreground">- {entry.item.name}</span>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseDrawer>
  );
};

export default BarcodeScannerDrawer;

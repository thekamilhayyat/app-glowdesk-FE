import React, { useState, useRef } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseCard, CardContent, CardHeader, CardTitle } from '@/components/base/BaseCard';
import { toast } from 'sonner';
import { useInventoryStore } from '@/stores/inventoryStore';
import { InventoryItem } from '@/types/inventory';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ImportExportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export const ImportExportDrawer: React.FC<ImportExportDrawerProps> = ({
  open,
  onOpenChange,
}) => {
  const { items, types, manufacturers, addItem, addType, addManufacturer } = useInventoryStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  const generateCSV = () => {
    const headers = [
      'Name',
      'SKU',
      'Barcode',
      'Type',
      'Manufacturer',
      'Cost Price',
      'Retail Price',
      'Current Stock',
      'Low Stock Threshold',
      'Reorder Point',
      'Reorder Quantity',
      'Unit of Measure',
      'Is Retail',
      'Is Back Bar',
      'Track Stock',
      'Taxable',
      'Expiration Date',
      'Image URL',
      'Notes',
      'Status'
    ];

    const rows = items.map(item => [
      item.name,
      item.sku,
      item.barcode || '',
      item.type,
      item.manufacturer,
      item.costPrice,
      item.retailPrice || '',
      item.currentStock,
      item.lowStockThreshold,
      item.reorderPoint,
      item.reorderQuantity,
      item.unitOfMeasure,
      item.isRetail ? 'Yes' : 'No',
      item.isBackBar ? 'Yes' : 'No',
      item.trackStock ? 'Yes' : 'No',
      item.taxable ? 'Yes' : 'No',
      item.expirationDate || '',
      item.imageUrl || '',
      item.notes || '',
      item.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${items.length} products to CSV`);
  };

  const downloadTemplate = () => {
    const headers = [
      'Name',
      'SKU',
      'Barcode',
      'Type',
      'Manufacturer',
      'Cost Price',
      'Retail Price',
      'Current Stock',
      'Low Stock Threshold',
      'Reorder Point',
      'Reorder Quantity',
      'Unit of Measure',
      'Is Retail',
      'Is Back Bar',
      'Track Stock',
      'Taxable',
      'Expiration Date',
      'Image URL',
      'Notes'
    ];

    const exampleRow = [
      'Sample Shampoo',
      'SHMP-001',
      '1234567890123',
      'Hair Care',
      'Acme Beauty',
      '15.99',
      '29.99',
      '50',
      '10',
      '15',
      '25',
      'bottle',
      'Yes',
      'No',
      'Yes',
      'Yes',
      '2025-12-31',
      'https://example.com/image.jpg',
      'Professional use'
    ];

    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Template downloaded');
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    setImportProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file must have at least a header row and one data row');
        }

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
        const dataRows = lines.slice(1);

        const result: ImportResult = { success: 0, failed: 0, errors: [] };
        const existingTypes = new Set(types.map(t => t.name.toLowerCase()));
        const existingManufacturers = new Set(manufacturers.map(m => m.name.toLowerCase()));
        const existingSkus = new Set(items.map(i => i.sku.toLowerCase()));

        for (let i = 0; i < dataRows.length; i++) {
          setImportProgress(Math.round(((i + 1) / dataRows.length) * 100));
          
          try {
            const values = parseCSVLine(dataRows[i]);
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });

            if (!row.name || !row.sku || !row.cost_price) {
              throw new Error(`Row ${i + 2}: Missing required fields (name, sku, cost_price)`);
            }

            if (existingSkus.has(row.sku.toLowerCase())) {
              throw new Error(`Row ${i + 2}: SKU "${row.sku}" already exists`);
            }

            const typeName = row.type || 'Uncategorized';
            if (!existingTypes.has(typeName.toLowerCase())) {
              addType({ type_id: `type_${Date.now()}_${i}`, name: typeName, order: types.length + 1 });
              existingTypes.add(typeName.toLowerCase());
            }

            const manufacturerName = row.manufacturer || 'Unknown';
            if (!existingManufacturers.has(manufacturerName.toLowerCase())) {
              addManufacturer({ manufacturer_id: `man_${Date.now()}_${i}`, name: manufacturerName, order: manufacturers.length + 1 });
              existingManufacturers.add(manufacturerName.toLowerCase());
            }

            const newItem: InventoryItem = {
              id: `inv_${Date.now()}_${i}`,
              name: row.name,
              sku: row.sku,
              barcode: row.barcode || undefined,
              type: typeName,
              manufacturer: manufacturerName,
              costPrice: parseFloat(row.cost_price) || 0,
              retailPrice: row.retail_price ? parseFloat(row.retail_price) : null,
              currentStock: parseInt(row.current_stock) || 0,
              lowStockThreshold: parseInt(row.low_stock_threshold) || 5,
              reorderPoint: parseInt(row.reorder_point) || 5,
              reorderQuantity: parseInt(row.reorder_quantity) || 10,
              unitOfMeasure: row.unit_of_measure || 'unit',
              isRetail: row.is_retail?.toLowerCase() !== 'no',
              isBackBar: row.is_back_bar?.toLowerCase() === 'yes',
              trackStock: row.track_stock?.toLowerCase() !== 'no',
              allowNegativeStock: false,
              taxable: row.taxable?.toLowerCase() !== 'no',
              expirationDate: row.expiration_date || undefined,
              imageUrl: row.image_url || undefined,
              notes: row.notes || undefined,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            addItem(newItem);
            existingSkus.add(row.sku.toLowerCase());
            result.success++;
          } catch (err) {
            result.failed++;
            result.errors.push(err instanceof Error ? err.message : `Row ${i + 2}: Unknown error`);
          }
        }

        setImportResult(result);
        if (result.success > 0) {
          toast.success(`Successfully imported ${result.success} products`);
        }
        if (result.failed > 0) {
          toast.error(`Failed to import ${result.failed} products`);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to parse CSV file');
      } finally {
        setImporting(false);
        setImportProgress(100);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
      setImporting(false);
    };

    reader.readAsText(file);
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Import / Export Products"
      width={500}
    >
      <div className="space-y-6">
        <BaseCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5" />
              Export Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download all your inventory products as a CSV file. You can use this for backup or to import into other systems.
            </p>
            <BaseButton
              variant="outline"
              onClick={generateCSV}
              className="w-full"
              disabled={items.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export {items.length} Products to CSV
            </BaseButton>
          </CardContent>
        </BaseCard>

        <BaseCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              Import Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a CSV file to import products in bulk. Download the template first to see the required format.
            </p>
            
            <BaseButton
              variant="ghost"
              onClick={downloadTemplate}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download CSV Template
            </BaseButton>

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            <BaseButton
              variant="gradient"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={importing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? 'Importing...' : 'Upload CSV File'}
            </BaseButton>

            {importing && (
              <div className="space-y-2">
                <Progress value={importProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Processing... {importProgress}%
                </p>
              </div>
            )}

            {importResult && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-4">
                  {importResult.success > 0 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">{importResult.success} imported</span>
                    </div>
                  )}
                  {importResult.failed > 0 && (
                    <div className="flex items-center gap-2 text-red-600">
                      <X className="h-4 w-4" />
                      <span className="text-sm">{importResult.failed} failed</span>
                    </div>
                  )}
                </div>

                {importResult.errors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Import Errors</span>
                    </div>
                    <ul className="text-xs text-red-600 space-y-1">
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {importResult.errors.length > 10 && (
                        <li>... and {importResult.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </BaseCard>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Import Notes
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Required fields: Name, SKU, Cost Price</li>
            <li>• SKU must be unique</li>
            <li>• New types and manufacturers are created automatically</li>
            <li>• Use Yes/No for boolean fields</li>
            <li>• Date format: YYYY-MM-DD</li>
          </ul>
        </div>
      </div>
    </BaseDrawer>
  );
};

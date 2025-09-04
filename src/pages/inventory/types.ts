export interface InventoryType {
  type_id: string;
  name: string;
  order: number;
}

export interface Manufacturer {
  manufacturer_id: string;
  name: string;
  order: number;
}

export interface InventoryItem {
  item_id: string;
  name: string;
  type: string;
  manufacturer: string;
  manufacturer_id: string;
  sku: string;
  cost_price: number;
  retail_price: number | null;
  serial_number: string;
  notes?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
} 
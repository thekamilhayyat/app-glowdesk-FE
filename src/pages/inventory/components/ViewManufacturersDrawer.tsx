import React, { useState } from 'react';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseCard } from '../../../components/base/BaseCard';
import { BaseDrawer } from '../../../components/base/BaseDrawer';
import { BaseTooltip } from '../../../components/base/BaseTooltip';

interface Manufacturer {
  manufacturer_id: string;
  name: string;
  order: number;
}

interface ViewManufacturersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manufacturers: Manufacturer[];
  onAddManufacturer: () => void;
  onManufacturerReorder: (manufacturers: Manufacturer[]) => void;
  onCreateInventoryWithManufacturer: (manufacturer: Manufacturer) => void;
}

export const ViewManufacturersDrawer: React.FC<ViewManufacturersDrawerProps> = ({
  open,
  onOpenChange,
  manufacturers,
  onAddManufacturer,
  onManufacturerReorder,
  onCreateInventoryWithManufacturer
}) => {
  const [draggedManufacturerId, setDraggedManufacturerId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, manufacturerId: string) => {
    setDraggedManufacturerId(manufacturerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetManufacturerId: string) => {
    e.preventDefault();
    if (!draggedManufacturerId || draggedManufacturerId === targetManufacturerId) return;

    const draggedManufacturer = manufacturers.find(m => m.manufacturer_id === draggedManufacturerId);
    const targetManufacturer = manufacturers.find(m => m.manufacturer_id === targetManufacturerId);
    if (!draggedManufacturer || !targetManufacturer) return;

    const newOrder = targetManufacturer.order;
    const updatedManufacturers = manufacturers.map(m => {
      if (m.manufacturer_id === draggedManufacturerId) {
        return { ...m, order: newOrder };
      }
      if (m.order >= newOrder && m.manufacturer_id !== draggedManufacturerId) {
        return { ...m, order: m.order + 1 };
      }
      return m;
    });

    onManufacturerReorder(updatedManufacturers.sort((a, b) => a.order - b.order));
  };

  const handleDragEnd = () => {
    setDraggedManufacturerId(null);
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="View Manufacturers"
      footer={
        <BaseButton
          variant="gradient"
          onClick={onAddManufacturer}
          className="w-full"
        >
          Add Manufacturer
        </BaseButton>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          {manufacturers.map((manufacturer) => (
            <BaseCard
              key={manufacturer.manufacturer_id}
              className={`p-4 cursor-move ${
                draggedManufacturerId === manufacturer.manufacturer_id ? 'opacity-50' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, manufacturer.manufacturer_id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, manufacturer.manufacturer_id)}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{manufacturer.name}</span>
                <BaseTooltip content="Create new inventory with this manufacturer">
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onCreateInventoryWithManufacturer(manufacturer)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </BaseButton>
                </BaseTooltip>
              </div>
            </BaseCard>
          ))}
        </div>
      </div>
    </BaseDrawer>
  );
}; 
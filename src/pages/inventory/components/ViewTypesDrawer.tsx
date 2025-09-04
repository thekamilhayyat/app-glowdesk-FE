import React, { useState } from 'react';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseCard } from '../../../components/base/BaseCard';
import { BaseDrawer } from '../../../components/base/BaseDrawer';
import { BaseTooltip } from '../../../components/base/BaseTooltip';

interface InventoryType {
  type_id: string;
  name: string;
  order: number;
}

interface ViewTypesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  types: InventoryType[];
  onAddType: () => void;
  onTypeReorder: (types: InventoryType[]) => void;
  onCreateInventoryWithType: (type: InventoryType) => void;
}

export const ViewTypesDrawer: React.FC<ViewTypesDrawerProps> = ({
  open,
  onOpenChange,
  types,
  onAddType,
  onTypeReorder,
  onCreateInventoryWithType
}) => {
  const [draggedTypeId, setDraggedTypeId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, typeId: string) => {
    setDraggedTypeId(typeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTypeId: string) => {
    e.preventDefault();
    if (!draggedTypeId || draggedTypeId === targetTypeId) return;

    const draggedType = types.find(t => t.type_id === draggedTypeId);
    const targetType = types.find(t => t.type_id === targetTypeId);
    if (!draggedType || !targetType) return;

    const newOrder = targetType.order;
    const updatedTypes = types.map(t => {
      if (t.type_id === draggedTypeId) {
        return { ...t, order: newOrder };
      }
      if (t.order >= newOrder && t.type_id !== draggedTypeId) {
        return { ...t, order: t.order + 1 };
      }
      return t;
    });

    onTypeReorder(updatedTypes.sort((a, b) => a.order - b.order));
  };

  const handleDragEnd = () => {
    setDraggedTypeId(null);
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="View Types"
    >
      <div className="space-y-4">
        <BaseButton
          variant="gradient"
          onClick={onAddType}
          className="w-full"
        >
          Add Type
        </BaseButton>

        <div className="space-y-2">
          {types.map((type) => (
            <BaseCard
              key={type.type_id}
              className={`p-4 cursor-move ${
                draggedTypeId === type.type_id ? 'opacity-50' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, type.type_id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, type.type_id)}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{type.name}</span>
                <BaseTooltip content="Create new inventory with this type">
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onCreateInventoryWithType(type)}
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
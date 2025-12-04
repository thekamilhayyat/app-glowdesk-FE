import React, { useState } from 'react';
import { BaseDrawer } from '@/components/base/BaseDrawer';
import { BaseButton } from '@/components/base/BaseButton';
import { BaseInput } from '@/components/base/BaseInput';
import { BaseBadge } from '@/components/base/BaseBadge';
import { toast } from '@/components/ui/sonner';
import { useServicesStore } from '@/stores/servicesStore';
import { Resource, ResourceType } from '@/types/service';
import { Search, Edit2, Trash2, Box, Users, Plus } from 'lucide-react';

interface ResourcesListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (resource: Resource) => void;
  onCreate?: () => void;
}

export function ResourcesListDrawer({ open, onOpenChange, onEdit, onCreate }: ResourcesListDrawerProps) {
  const { resources, deleteResource, resourceBookings } = useServicesStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (resource: Resource) => {
    const activeBookings = resourceBookings.filter(
      rb => rb.resourceId === resource.id
    ).length;

    if (activeBookings > 0) {
      toast.error(`Cannot delete: ${activeBookings} active booking(s)`);
      return;
    }

    if (confirm(`Are you sure you want to delete "${resource.name}"?`)) {
      deleteResource(resource.id);
      toast.success('Resource deleted successfully');
    }
  };

  const resourceTypeLabels: Record<ResourceType, string> = {
    room: 'Room',
    equipment: 'Equipment',
    bed: 'Bed/Chair',
    station: 'Station',
    other: 'Other',
  };

  const getActiveBookings = (resourceId: string) => {
    const now = new Date().toISOString();
    return resourceBookings.filter(
      rb => rb.resourceId === resourceId && rb.endTime > now
    ).length;
  };

  return (
    <BaseDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="All Resources"
      width={500}
      footer={
        <BaseButton
          variant="gradient"
          className="w-full"
          onClick={() => {
            onOpenChange(false);
            onCreate?.();
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Resource
        </BaseButton>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <BaseInput
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredResources.length === 0 ? (
            <div className="text-center py-8">
              <Box className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No resources found' : 'No resources created yet'}
              </p>
            </div>
          ) : (
            filteredResources.map((resource) => {
              const activeBookings = getActiveBookings(resource.id);
              return (
                <div
                  key={resource.id}
                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: resource.color ? `${resource.color}20` : '#6366f120' }}
                      >
                        <Box 
                          className="h-5 w-5" 
                          style={{ color: resource.color || '#6366f1' }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{resource.name}</h3>
                          {!resource.isActive && (
                            <BaseBadge variant="outline" size="sm">Inactive</BaseBadge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <BaseBadge variant="outline" size="sm">
                            {resourceTypeLabels[resource.type]}
                          </BaseBadge>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            Capacity: {resource.capacity}
                          </span>
                        </div>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground">
                            {resource.description}
                          </p>
                        )}
                        {activeBookings > 0 && (
                          <p className="text-xs text-primary mt-1">
                            {activeBookings} active booking(s)
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onOpenChange(false);
                          onEdit?.(resource);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </BaseButton>
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(resource)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </BaseButton>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center">
            {resources.length} total resource(s)
          </p>
        </div>
      </div>
    </BaseDrawer>
  );
}

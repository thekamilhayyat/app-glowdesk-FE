import { useState, useMemo, useRef } from "react";
import React from "react";
import { FormProvider } from "react-hook-form";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/ui/Container";
import { BaseCard, CardHeader, CardContent } from "@/components/base/BaseCard";
import { BaseButton } from "@/components/base/BaseButton";
import { BaseInput } from "@/components/base/BaseInput";
import { BaseLabel } from "@/components/base/BaseLabel";
import { BaseBadge } from "@/components/base/BaseBadge";
import { BaseDrawer } from "@/components/base/BaseDrawer";
import { BaseSelect, BaseSelectItem } from "@/components/base/BaseSelect";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Edit2, Trash2, Clock, DollarSign, Search, Eye, ChevronLeft, ChevronRight, GripVertical, Package, Crown, Box, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseTooltip } from "@/components/base/BaseTooltip";
import { BaseFormField, BaseFormSelectField, BaseFormSelectItem } from "@/components/base/BaseFormField";
import { useFormValidation } from "@/hooks/useFormValidation";
import { BaseTable, createSortableColumn, createColumn } from "@/components/base/BaseTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServicesStore } from "@/stores/servicesStore";
import {
  ServiceAddOnDrawer,
  ServicePackageDrawer,
  MembershipDrawer,
  ResourceDrawer,
  DynamicPricingDrawer,
  AddOnsListDrawer,
  PackagesListDrawer,
  MembershipsListDrawer,
  ResourcesListDrawer,
  ServiceProductConsumptionDrawer,
} from "@/pages/services/components";
import { 
  categoryFormSchema, 
  serviceFormInputSchema, 
  firstTimeServiceFormSchema,
  type CategoryFormData,
  type ServiceFormInputData,
  type FirstTimeServiceFormData
} from "@/lib/validations";

interface Category {
  category_id: string;
  name: string;
  order: number;
}

interface Service {
  service_id: string;
  name: string;
  category_id: string;
  description: string;
  duration_min: number;
  price: number;
  currency: string;
  active: boolean;
  bookable_online: boolean;
  staff_assignments: {
    assigned_staff_ids: string[];
    allow_any_staff: boolean;
  };
  order: number;
  sku: string;
  updated_at: string;
  // Additional fields for display
  clients_served?: number;
  total_revenue?: number;
}

interface ServicesData {
  data: {
    categories: Category[];
    services: Service[];
  };
  meta: {
    total_services: number;
    currency_default: string;
  };
}

// Mock data based on your JSON structure
const mockData: ServicesData = {
  data: {
    categories: [
      { category_id: "cat_hair", name: "Hair", order: 1 },
      { category_id: "cat_nails", name: "Nails", order: 2 }
    ],
    services: [
      {
        service_id: "SRV001",
        name: "Haircut",
        category_id: "cat_hair",
        description: "Standard haircut and finish.",
        duration_min: 45,
        price: 50,
        currency: "USD",
        active: true,
        bookable_online: true,
        staff_assignments: {
          assigned_staff_ids: ["EMP001"],
          allow_any_staff: false
        },
        order: 1,
        sku: "HAIR-HC-001",
        updated_at: "2025-09-02T12:00:00Z",
        clients_served: 25,
        total_revenue: 1250
      },
      {
        service_id: "SRV002",
        name: "Color",
        category_id: "cat_hair",
        description: "Single-process color with processing time.",
        duration_min: 90,
        price: 120,
        currency: "USD",
        active: true,
        bookable_online: true,
        staff_assignments: {
          assigned_staff_ids: ["EMP001", "EMP002"],
          allow_any_staff: false
        },
        order: 2,
        sku: "HAIR-CLR-001",
        updated_at: "2025-09-02T12:00:00Z",
        clients_served: 15,
        total_revenue: 1800
      },
      {
        service_id: "SRV003",
        name: "Manicure",
        category_id: "cat_nails",
        description: "Basic manicure.",
        duration_min: 30,
        price: 30,
        currency: "USD",
        active: false,
        bookable_online: false,
        staff_assignments: {
          assigned_staff_ids: [],
          allow_any_staff: false
        },
        order: 3,
        sku: "NAIL-MAN-001",
        updated_at: "2025-09-02T12:00:00Z",
        clients_served: 8,
        total_revenue: 240
      }
    ]
  },
  meta: {
    total_services: 3,
    currency_default: "USD"
  }
};

const durationOptions = [10, 15, 20, 30, 40, 45, 50, 60, 75, 90, 105, 120];

export function Services() {
  const [data, setData] = useState<ServicesData>(mockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Service>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Drawer states
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [isViewCategoriesOpen, setIsViewCategoriesOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isFirstTimeCreate, setIsFirstTimeCreate] = useState(false);
  const [selectedCategoryForService, setSelectedCategoryForService] = useState<string | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [isEditingService, setIsEditingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const serviceFormRef = useRef<HTMLFormElement>(null);
  const categoryFormRef = useRef<HTMLFormElement>(null);
  const firstTimeFormRef = useRef<HTMLFormElement>(null);
  
  // Form states using react-hook-form
  const categoryForm = useFormValidation(categoryFormSchema);
  const serviceForm = useFormValidation(serviceFormInputSchema);
  const firstTimeForm = useFormValidation(firstTimeServiceFormSchema);

  // Tab state
  const [activeTab, setActiveTab] = useState("services");
  
  // Enterprise feature drawer states
  const [addOnDrawerOpen, setAddOnDrawerOpen] = useState(false);
  const [packageDrawerOpen, setPackageDrawerOpen] = useState(false);
  const [membershipDrawerOpen, setMembershipDrawerOpen] = useState(false);
  const [resourceDrawerOpen, setResourceDrawerOpen] = useState(false);
  const [pricingRuleDrawerOpen, setPricingRuleDrawerOpen] = useState(false);
  const [addOnsListOpen, setAddOnsListOpen] = useState(false);
  const [packagesListOpen, setPackagesListOpen] = useState(false);
  const [membershipsListOpen, setMembershipsListOpen] = useState(false);
  const [resourcesListOpen, setResourcesListOpen] = useState(false);
  const [productConsumptionDrawerOpen, setProductConsumptionDrawerOpen] = useState(false);
  const [selectedServiceForConsumption, setSelectedServiceForConsumption] = useState<any>(null);
  
  // Editing states for enterprise features
  const [editingAddOn, setEditingAddOn] = useState<any>(undefined);
  const [editingPackage, setEditingPackage] = useState<any>(undefined);
  const [editingMembership, setEditingMembership] = useState<any>(undefined);
  const [editingResource, setEditingResource] = useState<any>(undefined);
  const [editingPricingRule, setEditingPricingRule] = useState<any>(undefined);

  // Store data for enterprise features
  const { 
    addOns, 
    packages, 
    memberships, 
    resources, 
    pricingRules,
    services: storeServices,
    clientMemberships 
  } = useServicesStore();

  // Set default values for service form
  React.useEffect(() => {
    serviceForm.reset({
      name: "",
      category_id: "",
      description: "",
      duration_min: "30",
      price: 0,
      currency: "USD"
    });
  }, []);

  // Set default values for category form
  React.useEffect(() => {
    categoryForm.reset({
      name: ""
    });
  }, []);

  // Reset forms when drawers open/close
  React.useEffect(() => {
    if (isCreateServiceOpen && !isEditingService) {
      serviceForm.reset({
        name: "",
        category_id: selectedCategoryForService || "",
        description: "",
        duration_min: "30",
        price: 0,
        currency: "USD"
      });
    }
  }, [isCreateServiceOpen, selectedCategoryForService, isEditingService]);

  React.useEffect(() => {
    if (isCreateCategoryOpen) {
      categoryForm.reset({
        name: ""
      });
    }
  }, [isCreateCategoryOpen]);

  // Filtered and sorted services
  const filteredServices = useMemo(() => {
    let filtered = data.data.services;
    
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(service.category_id).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === "category_id") {
        aValue = getCategoryName(a.category_id);
        bValue = getCategoryName(b.category_id);
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [data.data.services, searchTerm, sortField, sortDirection]);

  const getCategoryName = (categoryId: string) => {
    const category = data.data.categories.find(cat => cat.category_id === categoryId);
    return category ? category.name : "Unknown";
  };

  // Table columns configuration
  const tableColumns = [
    createSortableColumn<Service>("category_id", "Category Name", {
      render: (value, service) => <BaseBadge variant="outline">{getCategoryName(service.category_id)}</BaseBadge>
    }),
    createSortableColumn<Service>("name", "Service Name", {
      render: (value) => <span className="font-medium">{value}</span>
    }),
    createSortableColumn<Service>("price", "Service Price", {
      render: (value) => (
        <span className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          {value}
        </span>
      )
    }),
    createSortableColumn<Service>("duration_min", "Duration", {
      render: (value) => (
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {value} min
        </span>
      )
    }),
    createSortableColumn<Service>("clients_served", "No. of Clients Served", {
      render: (value) => value || 0
    }),
    createSortableColumn<Service>("total_revenue", "Total Revenue", {
      render: (value) => (
        <span className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          {value || 0}
        </span>
      )
    }),
    createColumn<Service & { actions?: never }>("actions", "Actions", {
      render: (value, service) => (
        <div className="flex gap-2">
          <BaseTooltip content="Product Consumption">
            <BaseButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const storeService = storeServices.find(s => s.id === service.service_id);
                setSelectedServiceForConsumption(storeService || {
                  id: service.service_id,
                  name: service.name,
                  categoryId: service.category_id,
                  description: service.description,
                  duration: service.duration_min,
                  price: service.price,
                  pricingType: 'fixed',
                  taxable: true,
                  isActive: service.active,
                  bookableOnline: service.bookable_online,
                  requiresDeposit: false,
                  staffAssignments: service.staff_assignments ? {
                    assignedStaffIds: service.staff_assignments.assigned_staff_ids,
                    allowAnyStaff: service.staff_assignments.allow_any_staff
                  } : { assignedStaffIds: [], allowAnyStaff: true },
                  order: service.order,
                  sku: service.sku,
                  createdAt: new Date().toISOString(),
                  updatedAt: service.updated_at
                });
                setProductConsumptionDrawerOpen(true);
              }}
            >
              <Package className="h-4 w-4" />
            </BaseButton>
          </BaseTooltip>
          <BaseTooltip content="Edit service">
            <BaseButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditService(service);
              }}
            >
              <Edit2 className="h-4 w-4" />
            </BaseButton>
          </BaseTooltip>
          <BaseTooltip content="Delete service">
            <BaseButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteService(service.service_id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </BaseButton>
          </BaseTooltip>
        </div>
      )
    })
  ];

  const handleSort = (field: keyof Service) => {
    console.log("Sorting by field:", field);
    console.log("Current sort field:", sortField);
    console.log("Current sort direction:", sortDirection);
    
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleNextToServiceForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("First-time category form submission triggered");
    
    const isValid = await categoryForm.trigger();
    console.log("Category validation result:", isValid);
    console.log("Category form errors:", categoryForm.formState.errors);
    
    if (!isValid) {
      toast.error("Please enter a valid category name");
      return;
    }
    
    // Get the category name and set up the service form
    const categoryData = categoryForm.getValues();
    console.log("Category data:", categoryData);
    
    if (!categoryData.name || categoryData.name.trim().length === 0) {
      toast.error("Please enter a category name");
      return;
    }
    
    const categoryId = `cat_${categoryData.name.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Reset service form with the new category_id
    serviceForm.reset({
      name: "",
      category_id: categoryId,
      description: "",
      duration_min: "30",
      price: 0,
      currency: "USD"
    });
    
    console.log("Moving to service form with category_id:", categoryId);
    setIsFirstTimeCreate(true);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Service form submission triggered");
    console.log("Is editing:", isEditingService);
    console.log("Editing service ID:", editingServiceId);
    
    const isValid = await serviceForm.trigger();
    console.log("Service validation result:", isValid);
    console.log("Service form errors:", serviceForm.formState.errors);
    
    if (!isValid) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const formData = serviceForm.getValues();
    console.log("Service form data:", formData);

    // Convert string values to numbers for validation
    const processedData = {
      ...formData,
      duration_min: Number(formData.duration_min),
      price: Number(formData.price)
    };

    // Additional validation check
    if (!processedData.name || !processedData.category_id || processedData.price <= 0) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    if (isEditingService && editingServiceId) {
      // Update existing service
      setData(prev => ({
        ...prev,
        data: {
          ...prev.data,
          services: prev.data.services.map(service => 
            service.service_id === editingServiceId 
              ? {
                  ...service,
                  name: processedData.name.trim(),
                  category_id: processedData.category_id,
                  description: processedData.description?.trim() || "",
                  duration_min: processedData.duration_min,
                  price: processedData.price,
                  currency: processedData.currency,
                  updated_at: new Date().toISOString()
                }
              : service
          )
        }
      }));

      serviceForm.reset();
      setIsCreateServiceOpen(false);
      setIsEditingService(false);
      setEditingServiceId(null);
      console.log("Service updated successfully");
      toast.success("Service updated successfully!");
      return;
    }

    // If this is the first time creating a service, create the category first
    if (isFirstTimeCreate && categoryForm.getValues().name) {
      const categoryData = categoryForm.getValues();
      console.log("Creating category from first-time flow:", categoryData);
      
      const newCategory: Category = {
        category_id: `cat_${categoryData.name.toLowerCase().replace(/\s+/g, '_')}`,
        name: categoryData.name.trim(),
        order: data.data.categories.length + 1
      };

      setData(prev => ({
        ...prev,
        data: {
          ...prev.data,
          categories: [...prev.data.categories, newCategory]
        }
      }));

      // Set the category_id for the service
      processedData.category_id = newCategory.category_id;
      categoryForm.reset();
      console.log("Category created:", newCategory);
    }

    const newService: Service = {
      service_id: `SRV${(data.data.services.length + 1).toString().padStart(3, '0')}`,
      name: processedData.name.trim(),
      category_id: processedData.category_id,
      description: processedData.description?.trim() || "",
      duration_min: processedData.duration_min,
      price: processedData.price,
      currency: processedData.currency,
      active: true,
      bookable_online: true,
      staff_assignments: {
        assigned_staff_ids: [],
        allow_any_staff: false
      },
      order: data.data.services.length + 1,
      sku: `${processedData.name.toUpperCase().replace(/\s+/g, '-')}-${Date.now()}`,
      updated_at: new Date().toISOString(),
      clients_served: 0,
      total_revenue: 0
    };

    setData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        services: [...prev.data.services, newService]
      },
      meta: {
        ...prev.meta,
        total_services: prev.meta.total_services + 1
      }
    }));

    serviceForm.reset();
    
    setIsCreateServiceOpen(false);
    setSelectedCategoryForService(null);
    if (isFirstTimeCreate) {
      setIsFirstTimeCreate(false);
    }
    console.log("Service created successfully:", newService);
    toast.success("Service created successfully!");
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Category form submission triggered");
    
    const isValid = await categoryForm.trigger();
    console.log("Category validation result:", isValid);
    console.log("Category form errors:", categoryForm.formState.errors);
    
    if (!isValid) {
      toast.error("Please enter a valid category name");
      return;
    }

    const formData = categoryForm.getValues();
    console.log("Category form data:", formData);

    // Additional validation check
    if (!formData.name || formData.name.trim().length === 0) {
      toast.error("Please enter a category name");
      return;
    }

    // Check if category already exists
    if (data.data.categories.some(cat => cat.name.toLowerCase() === formData.name.trim().toLowerCase())) {
      toast.error("A category with this name already exists");
      return;
    }

    const newCategory: Category = {
      category_id: `cat_${formData.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: formData.name.trim(),
      order: 1
    };

    setData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        categories: [newCategory, ...prev.data.categories.map(cat => ({
          ...cat,
          order: cat.order + 1
        }))]
      }
    }));

    categoryForm.reset();
    setIsCreateCategoryOpen(false);
    console.log("Category created successfully:", newCategory);
    toast.success("Category created successfully!");
  };

  const handleDeleteService = (serviceId: string) => {
    setData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        services: prev.data.services.filter(service => service.service_id !== serviceId)
      },
      meta: {
        ...prev.meta,
        total_services: prev.meta.total_services - 1
      }
    }));
    toast.success("Service deleted successfully!");
  };

  const handleEditService = (service: Service) => {
    console.log("Editing service:", service);
    
    setEditingServiceId(service.service_id);
    setIsEditingService(true);
    setSelectedCategoryForService(null); // Clear any pre-selected category
    
    serviceForm.reset({
      name: service.name,
      category_id: service.category_id,
      description: service.description,
      duration_min: service.duration_min.toString(),
      price: service.price,
      currency: service.currency
    });
    
    setIsCreateServiceOpen(true);
  };

  const handleAddServiceFromCategory = (categoryId: string) => {
    console.log("Adding service from category:", categoryId);
    
    setSelectedCategoryForService(categoryId);
    
    serviceForm.reset({
      name: "",
      category_id: categoryId,
      description: "",
      duration_min: "30",
      price: 0,
      currency: "USD"
    });
    
    setIsCreateServiceOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategoryId(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    
    if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
      setDraggedCategoryId(null);
      return;
    }

    const draggedCategory = data.data.categories.find(cat => cat.category_id === draggedCategoryId);
    const targetCategory = data.data.categories.find(cat => cat.category_id === targetCategoryId);
    
    if (!draggedCategory || !targetCategory) {
      setDraggedCategoryId(null);
      return;
    }

    // Reorder categories
    const reorderedCategories = data.data.categories.map(cat => {
      if (cat.category_id === draggedCategoryId) {
        return { ...cat, order: targetCategory.order };
      } else if (cat.category_id === targetCategoryId) {
        return { ...cat, order: draggedCategory.order };
      }
      return cat;
    }).sort((a, b) => a.order - b.order);

    setData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        categories: reorderedCategories
      }
    }));

    setDraggedCategoryId(null);
  };

  const handleDragEnd = () => {
    setDraggedCategoryId(null);
  };

  // Enterprise tab render functions
  const renderAddOnsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold">Service Add-Ons</h2>
          <p className="text-muted-foreground">Create additional services that can be added to appointments</p>
        </div>
        <div className="flex gap-2">
          <BaseButton variant="outline" onClick={() => setAddOnsListOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            View All
          </BaseButton>
          <BaseButton variant="gradient" onClick={() => {
            setEditingAddOn(undefined);
            setAddOnDrawerOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Add-On
          </BaseButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BaseCard className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <Sparkles className="h-8 w-8 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{addOns.length}</p>
          <p className="text-sm text-muted-foreground">Total Add-Ons</p>
        </BaseCard>
        <BaseCard className="p-4">
          <DollarSign className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold">
            ${addOns.reduce((sum, a) => sum + a.price, 0).toFixed(0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Value</p>
        </BaseCard>
        <BaseCard className="p-4">
          <Clock className="h-8 w-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">
            {addOns.filter(a => a.isActive).length}
          </p>
          <p className="text-sm text-muted-foreground">Active Add-Ons</p>
        </BaseCard>
      </div>

      <BaseCard>
        <CardHeader>
          <h3 className="text-lg font-heading font-semibold">Recent Add-Ons</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {addOns.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No add-ons created yet. Create your first add-on to get started.
              </p>
            ) : (
              addOns.slice(0, 5).map((addOn) => (
                <div key={addOn.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{addOn.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${addOn.price} • {addOn.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!addOn.isActive && <BaseBadge variant="outline">Inactive</BaseBadge>}
                    <BaseButton 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingAddOn(addOn);
                        setAddOnDrawerOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </BaseButton>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </BaseCard>
    </div>
  );

  const renderPackagesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold">Service Packages</h2>
          <p className="text-muted-foreground">Bundle services together with special pricing</p>
        </div>
        <div className="flex gap-2">
          <BaseButton variant="outline" onClick={() => setPackagesListOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            View All
          </BaseButton>
          <BaseButton variant="gradient" onClick={() => {
            setEditingPackage(undefined);
            setPackageDrawerOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Package
          </BaseButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BaseCard className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <Package className="h-8 w-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{packages.length}</p>
          <p className="text-sm text-muted-foreground">Total Packages</p>
        </BaseCard>
        <BaseCard className="p-4">
          <DollarSign className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold">
            {packages.reduce((sum, p) => sum + p.usageCount, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Sold</p>
        </BaseCard>
        <BaseCard className="p-4">
          <TrendingUp className="h-8 w-8 text-orange-500 mb-2" />
          <p className="text-2xl font-bold">
            {packages.filter(p => p.isActive).length}
          </p>
          <p className="text-sm text-muted-foreground">Active Packages</p>
        </BaseCard>
      </div>

      <BaseCard>
        <CardHeader>
          <h3 className="text-lg font-heading font-semibold">All Packages</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {packages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No packages created yet. Bundle services to offer great value.
              </p>
            ) : (
              packages.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{pkg.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pkg.serviceIds.length} services • {pkg.totalDuration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ${pkg.calculatedPrice || pkg.fixedPrice || 0}
                      </p>
                      {pkg.pricingType === 'percentage_discount' && (
                        <p className="text-xs text-muted-foreground">{pkg.discountPercentage}% off</p>
                      )}
                    </div>
                    <BaseButton 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingPackage(pkg);
                        setPackageDrawerOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </BaseButton>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </BaseCard>
    </div>
  );

  const renderMembershipsTab = () => {
    const activeMemberCount = clientMemberships.filter(cm => cm.status === 'active').length;
    const monthlyRevenue = memberships.reduce((sum, m) => {
      const memberCount = clientMemberships.filter(
        cm => cm.membershipId === m.id && cm.status === 'active'
      ).length;
      return sum + (m.price * memberCount);
    }, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold">Memberships</h2>
            <p className="text-muted-foreground">Create recurring membership plans with credits and discounts</p>
          </div>
          <div className="flex gap-2">
            <BaseButton variant="outline" onClick={() => setMembershipsListOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              View All
            </BaseButton>
            <BaseButton variant="gradient" onClick={() => {
              setEditingMembership(undefined);
              setMembershipDrawerOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Membership
            </BaseButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <BaseCard className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
            <Crown className="h-8 w-8 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{memberships.length}</p>
            <p className="text-sm text-muted-foreground">Membership Plans</p>
          </BaseCard>
          <BaseCard className="p-4">
            <p className="text-2xl font-bold">{activeMemberCount}</p>
            <p className="text-sm text-muted-foreground">Active Members</p>
          </BaseCard>
          <BaseCard className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <DollarSign className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
          </BaseCard>
          <BaseCard className="p-4">
            <p className="text-2xl font-bold">
              {memberships.filter(m => m.isActive).length}
            </p>
            <p className="text-sm text-muted-foreground">Active Plans</p>
          </BaseCard>
        </div>

        <BaseCard>
          <CardHeader>
            <h3 className="text-lg font-heading font-semibold">Membership Plans</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {memberships.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No memberships created yet. Start building recurring revenue.
                </p>
              ) : (
                memberships.map((membership) => {
                  const memberCount = clientMemberships.filter(
                    cm => cm.membershipId === membership.id && cm.status === 'active'
                  ).length;
                  return (
                    <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/10 flex items-center justify-center">
                          <Crown className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-medium">{membership.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {membership.type.replace('_', ' ')} • {membership.billingInterval}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-green-600">${membership.price}/mo</p>
                          <p className="text-xs text-muted-foreground">{memberCount} member(s)</p>
                        </div>
                        <BaseButton 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingMembership(membership);
                            setMembershipDrawerOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </BaseButton>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </BaseCard>
      </div>
    );
  };

  const renderResourcesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold">Resources</h2>
          <p className="text-muted-foreground">Manage rooms, equipment, and stations for booking</p>
        </div>
        <div className="flex gap-2">
          <BaseButton variant="outline" onClick={() => setResourcesListOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            View All
          </BaseButton>
          <BaseButton variant="gradient" onClick={() => {
            setEditingResource(undefined);
            setResourceDrawerOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </BaseButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BaseCard className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
          <Box className="h-8 w-8 text-indigo-500 mb-2" />
          <p className="text-2xl font-bold">{resources.length}</p>
          <p className="text-sm text-muted-foreground">Total Resources</p>
        </BaseCard>
        <BaseCard className="p-4">
          <p className="text-2xl font-bold">
            {resources.filter(r => r.type === 'room').length}
          </p>
          <p className="text-sm text-muted-foreground">Rooms</p>
        </BaseCard>
        <BaseCard className="p-4">
          <p className="text-2xl font-bold">
            {resources.filter(r => r.isActive).length}
          </p>
          <p className="text-sm text-muted-foreground">Active Resources</p>
        </BaseCard>
      </div>

      <BaseCard>
        <CardHeader>
          <h3 className="text-lg font-heading font-semibold">All Resources</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-8">
                No resources created yet. Add rooms and equipment to manage availability.
              </p>
            ) : (
              resources.map((resource) => (
                <div 
                  key={resource.id} 
                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: resource.color ? `${resource.color}20` : '#6366f120' }}
                    >
                      <Box 
                        className="h-5 w-5" 
                        style={{ color: resource.color || '#6366f1' }}
                      />
                    </div>
                    <BaseButton 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingResource(resource);
                        setResourceDrawerOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </BaseButton>
                  </div>
                  <h4 className="font-medium mb-1">{resource.name}</h4>
                  <div className="flex items-center gap-2">
                    <BaseBadge variant="outline" size="sm">{resource.type}</BaseBadge>
                    <span className="text-xs text-muted-foreground">
                      Capacity: {resource.capacity}
                    </span>
                  </div>
                  {!resource.isActive && (
                    <BaseBadge variant="outline" size="sm" className="mt-2">Inactive</BaseBadge>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </BaseCard>
    </div>
  );

  // Initial empty state
  if (data.data.services.length === 0) {
    return (
      <AppLayout>
        <Container className="py-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <BaseDrawer
              open={isCreateServiceOpen}
              onOpenChange={setIsCreateServiceOpen}
              title={isFirstTimeCreate 
                ? (selectedCategoryForService 
                    ? `${getCategoryName(selectedCategoryForService)} - Create Your First Service`
                    : "Create Your First Service"
                  )
                : "Add New Service"
              }
              trigger={
                <div>
                  <EmptyState
                    title="No Services"
                    description="Get started by creating your first service"
                    actionLabel="Create Service"
                    icon={
                      <svg
                        className="w-24 h-24 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    }
                  />
                </div>
              }
              footer={
                <div className="flex gap-3 w-full">
                  <BaseButton 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateServiceOpen(false);
                      setIsFirstTimeCreate(false);
                      setSelectedCategoryForService(null);
                      setIsEditingService(false);
                      setEditingServiceId(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </BaseButton>
                  <BaseButton 
                    type="button" 
                    variant="gradient" 
                    className="flex-1"
                    onClick={() => {
                      if (isFirstTimeCreate) {
                        serviceFormRef.current?.requestSubmit();
                      } else {
                        firstTimeFormRef.current?.requestSubmit();
                      }
                    }}
                  >
                    {isFirstTimeCreate ? "Create Service" : "Next"}
                  </BaseButton>
                </div>
              }
            >
              {!isFirstTimeCreate ? (
                <form ref={firstTimeFormRef} onSubmit={handleNextToServiceForm} className="space-y-4">
                  <FormProvider {...categoryForm}>
                    <BaseFormField
                      name="name"
                      label="Category Name"
                      placeholder="Enter category name"
                      required
                    />
                  </FormProvider>
                </form>
              ) : (
                <form ref={serviceFormRef} onSubmit={handleCreateService} className="space-y-4">
                  <FormProvider {...serviceForm}>
                    <BaseFormField
                      name="name"
                      label="Service Name"
                      placeholder="Enter service name"
                      required
                    />

                    <BaseFormField
                      name="description"
                      label="Description"
                      placeholder="Enter service description"
                    />

                    <BaseFormSelectField
                      name="duration_min"
                      label="Duration (minutes)"
                      placeholder="Select duration"
                      required
                    >
                      {durationOptions.map((duration) => (
                        <BaseFormSelectItem key={duration} value={duration.toString()}>
                          {duration} minutes
                        </BaseFormSelectItem>
                      ))}
                    </BaseFormSelectField>

                    <div className="space-y-2">
                      <BaseLabel htmlFor="service_price" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                        Service Price
                      </BaseLabel>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <BaseInput
                          id="service_price"
                          type="number"
                          placeholder="0.00"
                          className="pl-8"
                          {...serviceForm.register("price")}
                        />
                      </div>
                      {serviceForm.formState.errors.price && (
                        <p className="text-sm text-destructive">
                          {serviceForm.formState.errors.price.message}
                        </p>
                      )}
                    </div>
                  </FormProvider>
                </form>
              )}
            </BaseDrawer>
          </div>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container className="py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-foreground">Services</h1>
            <p className="text-muted-foreground">Manage your services, add-ons, packages, and memberships</p>
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="services" className="gap-2">
              <Clock className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="addons" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Add-Ons
            </TabsTrigger>
            <TabsTrigger value="packages" className="gap-2">
              <Package className="h-4 w-4" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="memberships" className="gap-2">
              <Crown className="h-4 w-4" />
              Memberships
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <Box className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex gap-3 justify-end">
              <BaseButton 
                variant="outline" 
                onClick={() => setIsViewCategoriesOpen(true)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                View Categories
              </BaseButton>
            
            <BaseDrawer
              open={isCreateServiceOpen}
              onOpenChange={setIsCreateServiceOpen}
              title={isEditingService 
                ? "Edit Service"
                : selectedCategoryForService 
                  ? `${getCategoryName(selectedCategoryForService)} - Create New Service`
                  : "Add New Service"
              }
              trigger={
                <BaseButton 
                  variant="gradient" 
                  className="gap-2"
                  onClick={() => {
                    setSelectedCategoryForService(null);
                    setIsEditingService(false);
                    setEditingServiceId(null);
                    serviceForm.reset({
                      name: "",
                      category_id: "",
                      description: "",
                      duration_min: "30",
                      price: 0,
                      currency: "USD"
                    });
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Service
                </BaseButton>
              }
              footer={
                <div className="flex gap-3 w-full">
                  <BaseButton 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateServiceOpen(false);
                      setSelectedCategoryForService(null);
                      setIsEditingService(false);
                      setEditingServiceId(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </BaseButton>
                  <BaseButton 
                    type="button" 
                    variant="gradient" 
                    className="flex-1"
                    onClick={() => {
                      serviceFormRef.current?.requestSubmit();
                    }}
                  >
                    {isEditingService ? "Update Service" : "Create Service"}
                  </BaseButton>
                </div>
              }
            >
              <form ref={serviceFormRef} onSubmit={handleCreateService} className="space-y-4">
                <FormProvider {...serviceForm}>
                  <BaseFormSelectField
                    name="category_id"
                    label={selectedCategoryForService ? `Category (${getCategoryName(selectedCategoryForService)})` : "Category"}
                    placeholder="Select a category"
                    required
                    disabled={!!selectedCategoryForService}
                    onValueChange={(value) => {
                      if (value === "add_new") {
                        setIsCreateCategoryOpen(true);
                        serviceForm.setValue("category_id", "");
                      }
                    }}
                  >
                    {data.data.categories.map((category) => (
                      <BaseFormSelectItem key={category.category_id} value={category.category_id}>
                        {category.name}
                      </BaseFormSelectItem>
                    ))}
                    <BaseFormSelectItem value="add_new" disabled={!!selectedCategoryForService}>
                      + Create New Category
                    </BaseFormSelectItem>
                  </BaseFormSelectField>

                  <BaseFormField
                    name="name"
                    label="Service Name"
                    placeholder="Enter service name"
                    required
                  />

                  <BaseFormField
                    name="description"
                    label="Description"
                    placeholder="Enter service description"
                  />

                  <BaseFormSelectField
                    name="duration_min"
                    label="Duration (minutes)"
                    placeholder="Select duration"
                    required
                  >
                    {durationOptions.map((duration) => (
                      <BaseFormSelectItem key={duration} value={duration.toString()}>
                        {duration} minutes
                      </BaseFormSelectItem>
                    ))}
                  </BaseFormSelectField>

                  <div className="space-y-2">
                    <BaseLabel htmlFor="service_price" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                      Service Price
                    </BaseLabel>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <BaseInput
                        id="service_price"
                        type="number"
                        placeholder="0.00"
                        className="pl-8"
                        {...serviceForm.register("price")}
                      />
                    </div>
                    {serviceForm.formState.errors.price && (
                      <p className="text-sm text-destructive">
                        {serviceForm.formState.errors.price.message}
                      </p>
                    )}
                  </div>
                </FormProvider>
              </form>
            </BaseDrawer>
            </div>

            {/* Search Bar */}
            <BaseCard className="mb-6">
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <BaseInput
                    placeholder="Search services or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </BaseCard>

            {/* Services Table */}
            <BaseCard padding="none">
              <CardContent className="p-0">
                <BaseTable
                  data={filteredServices}
                  columns={tableColumns}
                  sortConfig={{
                    field: sortField,
                    direction: sortDirection
                  }}
                  onSort={handleSort}
                  pagination={{
                    currentPage,
                    itemsPerPage,
                    totalItems: filteredServices.length,
                    onPageChange: setCurrentPage,
                    onItemsPerPageChange: setItemsPerPage
                  }}
                  showPagination={true}
                  emptyMessage="No services found"
                />
              </CardContent>
            </BaseCard>
          </TabsContent>

          {/* Add-Ons Tab */}
          <TabsContent value="addons">
            {renderAddOnsTab()}
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages">
            {renderPackagesTab()}
          </TabsContent>

          {/* Memberships Tab */}
          <TabsContent value="memberships">
            {renderMembershipsTab()}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            {renderResourcesTab()}
          </TabsContent>
        </Tabs>

        {/* View Categories Drawer */}
        <BaseDrawer
          open={isViewCategoriesOpen}
          onOpenChange={setIsViewCategoriesOpen}
          title="View Categories"
          trigger={<></>}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Categories</h3>
              <BaseTooltip content="Add new category">
                              <BaseButton
                variant="outline"
                size="sm"
                onClick={() => {
                  categoryForm.reset({ name: "" });
                  setIsCreateCategoryOpen(true);
                }}
              >
                  Add Category
                </BaseButton>
              </BaseTooltip>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Drag and drop categories to reorder them. New categories appear at the top.
            </p>
            
            <div className="space-y-4">
              {data.data.categories
                .sort((a, b) => a.order - b.order)
                .map((category) => (
                <div 
                  key={category.category_id} 
                  className={`border rounded-md p-4 cursor-move transition-all duration-200 ${
                    draggedCategoryId === category.category_id 
                      ? 'opacity-50 bg-muted/50' 
                      : 'hover:bg-muted/30'
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, category.category_id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category.category_id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      <h4 className="font-medium">{category.name}</h4>
                    </div>
                    <BaseTooltip content="Create new service">
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddServiceFromCategory(category.category_id)}
                      >
                        <Plus className="h-4 w-4" />
                      </BaseButton>
                    </BaseTooltip>
                  </div>
                  
                  <div className="space-y-2">
                    {data.data.services
                      .filter(service => service.category_id === category.category_id)
                      .map(service => (
                        <div key={service.service_id} className="flex items-center justify-between text-sm">
                          <span>{service.name}</span>
                          <span className="text-muted-foreground">
                            ${service.price} • {service.duration_min}min
                          </span>
                        </div>
                      ))}
                    
                    {data.data.services.filter(service => service.category_id === category.category_id).length === 0 && (
                      <p className="text-sm text-muted-foreground">No services in this category</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BaseDrawer>

        {/* Create Category Drawer */}
        <BaseDrawer
          open={isCreateCategoryOpen}
          onOpenChange={setIsCreateCategoryOpen}
          title="Add New Category"
          trigger={<></>}
          footer={
            <div className="flex gap-3 w-full">
              <BaseButton 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateCategoryOpen(false)}
                className="flex-1"
              >
                Cancel
              </BaseButton>
              <BaseButton 
                type="button" 
                variant="gradient" 
                className="flex-1"
                onClick={() => {
                  categoryFormRef.current?.requestSubmit();
                }}
              >
                Create Category
              </BaseButton>
            </div>
          }
        >
          <form ref={categoryFormRef} onSubmit={handleCreateCategory} className="space-y-4">
            <FormProvider {...categoryForm}>
              <BaseFormField
                name="name"
                label="Category Name"
                placeholder="Enter category name"
                required
              />
            </FormProvider>
          </form>
        </BaseDrawer>

        {/* Enterprise Feature Drawers */}
        <ServiceAddOnDrawer
          open={addOnDrawerOpen}
          onOpenChange={setAddOnDrawerOpen}
          addOn={editingAddOn}
        />

        <ServicePackageDrawer
          open={packageDrawerOpen}
          onOpenChange={setPackageDrawerOpen}
          pkg={editingPackage}
        />

        <MembershipDrawer
          open={membershipDrawerOpen}
          onOpenChange={setMembershipDrawerOpen}
          membership={editingMembership}
        />

        <ResourceDrawer
          open={resourceDrawerOpen}
          onOpenChange={setResourceDrawerOpen}
          resource={editingResource}
        />

        <DynamicPricingDrawer
          open={pricingRuleDrawerOpen}
          onOpenChange={setPricingRuleDrawerOpen}
          rule={editingPricingRule}
        />

        {/* List Drawers */}
        <AddOnsListDrawer
          open={addOnsListOpen}
          onOpenChange={setAddOnsListOpen}
          onCreate={() => {
            setEditingAddOn(undefined);
            setAddOnDrawerOpen(true);
          }}
          onEdit={(addOn) => {
            setEditingAddOn(addOn);
            setAddOnDrawerOpen(true);
          }}
        />

        <PackagesListDrawer
          open={packagesListOpen}
          onOpenChange={setPackagesListOpen}
          onCreate={() => {
            setEditingPackage(undefined);
            setPackageDrawerOpen(true);
          }}
          onEdit={(pkg) => {
            setEditingPackage(pkg);
            setPackageDrawerOpen(true);
          }}
        />

        <MembershipsListDrawer
          open={membershipsListOpen}
          onOpenChange={setMembershipsListOpen}
          onCreate={() => {
            setEditingMembership(undefined);
            setMembershipDrawerOpen(true);
          }}
          onEdit={(membership) => {
            setEditingMembership(membership);
            setMembershipDrawerOpen(true);
          }}
        />

        <ResourcesListDrawer
          open={resourcesListOpen}
          onOpenChange={setResourcesListOpen}
          onCreate={() => {
            setEditingResource(undefined);
            setResourceDrawerOpen(true);
          }}
          onEdit={(resource) => {
            setEditingResource(resource);
            setResourceDrawerOpen(true);
          }}
        />

        <ServiceProductConsumptionDrawer
          open={productConsumptionDrawerOpen}
          onOpenChange={setProductConsumptionDrawerOpen}
          service={selectedServiceForConsumption}
        />
      </Container>
    </AppLayout>
  );
} 
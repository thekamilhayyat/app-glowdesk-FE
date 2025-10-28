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
import { Plus, Edit2, Trash2, Clock, DollarSign } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import staffData from '@/data/staff.json';
import servicesData from '@/data/services.json';
import { BaseFormField, BaseFormSelectField, BaseFormSelectItem } from "@/components/base/BaseFormField";
import { useFormValidation } from "@/hooks/useFormValidation";
import { staffFormSchema, type StaffFormData } from "@/lib/validations";

interface Role {
  role_id: string;
  role_name: string;
}

interface Contact {
  email: string;
  phone: string;
}

interface WorkHours {
  start: string;
  end: string;
}

interface TimeOff {
  day: string;
  start: string;
  end: string;
  title: string;
}

interface Service {
  service_id: string;
  name: string;
  category: string;
  duration_min: number;
  price: number;
  currency: string;
  active: boolean;
}

interface StaffMember {
  employee_id: string;
  display_name: string;
  role: Role;
  contact: Contact;
  work_hours: {
    mon: WorkHours;
    tue: WorkHours;
    wed: WorkHours;
    thu: WorkHours;
    fri: WorkHours;
    sat: WorkHours;
    sun: WorkHours;
  };
  time_off: TimeOff[];
  service_list: Service[];
}

const defaultRoles: Role[] = [
  { role_id: "1", role_name: "Hair Stylist" },
  { role_id: "2", role_name: "Colorist" },
  { role_id: "3", role_name: "Receptionist" },
  { role_id: "4", role_name: "Nail Technician" },
  { role_id: "5", role_name: "Esthetician" }
];

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const durationOptions = [10, 15, 20, 30, 40, 45, 50, 60, 75, 90, 105, 120];

const weekDays = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' }
];

export function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>(staffData.data || []);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [services, setServices] = useState(servicesData.services);
  const staffFormRef = useRef<HTMLFormElement>(null);
  
  // Form state using react-hook-form
  const staffForm = useFormValidation(staffFormSchema);

  // Set default values for staff form
  React.useEffect(() => {
    staffForm.reset({
      name: "",
      email: "",
      phone: "",
      role: ""
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Staff form submission triggered");
    
    const isValid = await staffForm.trigger();
    console.log("Staff validation result:", isValid);
    console.log("Staff form errors:", staffForm.formState.errors);
    
    if (!isValid) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const formData = staffForm.getValues();
    console.log("Staff form data:", formData);

    // Additional validation check
    if (!formData.name || !formData.email || !formData.phone || !formData.role) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    if (staff.some(member => member.contact.email === formData.email)) {
      toast.error("A staff member with this email already exists");
      return;
    }

    const selectedRole = roles.find(r => r.role_id === formData.role);
    if (!selectedRole) return;

    const newStaff: StaffMember = {
      employee_id: `EMP${(staff.length + 1).toString().padStart(3, '0')}`,
      display_name: formData.name,
      role: selectedRole,
      contact: {
        email: formData.email,
        phone: formData.phone
      },
      work_hours: {
        mon: { start: "09:00", end: "17:00" },
        tue: { start: "09:00", end: "17:00" },
        wed: { start: "09:00", end: "17:00" },
        thu: { start: "09:00", end: "17:00" },
        fri: { start: "09:00", end: "17:00" },
        sat: { start: "09:00", end: "17:00" },
        sun: { start: "09:00", end: "17:00" }
      },
      time_off: [],
      service_list: []
    };

    setStaff(prev => [...prev, newStaff]);
    setSelectedStaff(newStaff);
    staffForm.reset();
    setIsDialogOpen(false);
    toast.success("Staff member added successfully!");
  };

  const handleRoleSelect = (value: string) => {
    if (value === "add_new") {
      const newRoleName = prompt("Enter new role name:");
      if (newRoleName && newRoleName.trim()) {
        const newRole: Role = {
          role_id: (roles.length + 1).toString(),
          role_name: newRoleName.trim()
        };
        setRoles(prev => [...prev, newRole]);
        staffForm.setValue('role', newRole.role_id);
      }
    } else {
      staffForm.setValue('role', value);
    }
  };

  const updateStaffField = (field: string, value: any) => {
    if (!selectedStaff) return;
    
    const updatedStaff = { ...selectedStaff };
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updatedStaff as any)[parent][child] = value;
    } else {
      (updatedStaff as any)[field] = value;
    }
    
    setSelectedStaff(updatedStaff);
    setStaff(prev => prev.map(s => s.employee_id === updatedStaff.employee_id ? updatedStaff : s));
  };

  const updateWorkHours = (day: string, type: 'start' | 'end', value: string) => {
    if (!selectedStaff) return;
    
    const updatedStaff = { ...selectedStaff };
    updatedStaff.work_hours[day as keyof typeof updatedStaff.work_hours][type] = value;
    
    setSelectedStaff(updatedStaff);
    setStaff(prev => prev.map(s => s.employee_id === updatedStaff.employee_id ? updatedStaff : s));
  };

  const addTimeOff = () => {
    if (!selectedStaff) return;
    
    const newTimeOff: TimeOff = {
      day: "Monday",
      start: "12:00",
      end: "13:00",
      title: "Break"
    };
    
    const updatedStaff = { ...selectedStaff };
    updatedStaff.time_off = [...updatedStaff.time_off, newTimeOff];
    
    setSelectedStaff(updatedStaff);
    setStaff(prev => prev.map(s => s.employee_id === updatedStaff.employee_id ? updatedStaff : s));
  };

  const updateTimeOff = (index: number, field: keyof TimeOff, value: string) => {
    if (!selectedStaff) return;
    
    const updatedStaff = { ...selectedStaff };
    updatedStaff.time_off[index][field] = value;
    
    setSelectedStaff(updatedStaff);
    setStaff(prev => prev.map(s => s.employee_id === updatedStaff.employee_id ? updatedStaff : s));
  };

  const removeTimeOff = (index: number) => {
    if (!selectedStaff) return;
    
    const updatedStaff = { ...selectedStaff };
    updatedStaff.time_off = updatedStaff.time_off.filter((_, i) => i !== index);
    
    setSelectedStaff(updatedStaff);
    setStaff(prev => prev.map(s => s.employee_id === updatedStaff.employee_id ? updatedStaff : s));
  };

  const addService = () => {
    if (!selectedStaff) return;
    
    const firstService = services[0];
    const newService: Service = {
      service_id: firstService.id,
      name: firstService.name,
      category: firstService.category,
      duration_min: 30,
      price: 50,
      currency: "USD",
      active: true
    };
    
    const updatedStaff = { ...selectedStaff };
    updatedStaff.service_list = [...updatedStaff.service_list, newService];
    
    setSelectedStaff(updatedStaff);
    setStaff(prev => prev.map(s => s.employee_id === updatedStaff.employee_id ? updatedStaff : s));
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    if (!selectedStaff) return;
    
    const updatedStaff = { ...selectedStaff };
    if (field === 'service_id') {
      const service = services.find(s => s.id === value);
      if (service) {
        updatedStaff.service_list[index].service_id = service.id;
        updatedStaff.service_list[index].name = service.name;
        updatedStaff.service_list[index].category = service.category;
      }
    } else {
      (updatedStaff.service_list[index] as any)[field] = value;
    }
    
    setSelectedStaff(updatedStaff);
    setStaff(prev => prev.map(s => s.employee_id === updatedStaff.employee_id ? updatedStaff : s));
  };

  const removeService = (index: number) => {
    if (!selectedStaff) return;
    
    const updatedStaff = { ...selectedStaff };
    updatedStaff.service_list = updatedStaff.service_list.filter((_, i) => i !== index);
    
    setSelectedStaff(updatedStaff);
    setStaff(prev => prev.map(s => s.employee_id === updatedStaff.employee_id ? updatedStaff : s));
  };

  const handleUpdate = () => {
    toast.success("Staff information updated successfully!");
  };

  // Initial empty state
  if (staff.length === 0) {
    return (
      <AppLayout>
        <Container className="py-4">
          <div className="flex items-center justify-center min-h-[60vh]">
                        <BaseDrawer
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              title="Add New Staff Member"
              trigger={
                <div>
                  <EmptyState
                    title="No Staff Members"
                    description="Get started by adding your first staff member"
                    actionLabel="Add Staff"
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </BaseButton>
                  <BaseButton 
                    type="submit" 
                    variant="gradient" 
                    className="flex-1"
                    onClick={() => {
                      const form = document.querySelector('form[data-staff-form-empty]') as HTMLFormElement;
                      if (form) {
                        form.requestSubmit();
                      }
                    }}
                  >
                    Add Staff
                  </BaseButton>
                </div>
              }
            >
              <form onSubmit={handleSubmit} className="space-y-4" data-staff-form-empty>
                <FormProvider {...staffForm}>
                  <BaseFormField
                    name="name"
                    label="Name"
                    placeholder="Enter staff name"
                    required
                  />

                  <BaseFormField
                    name="email"
                    label="Email"
                    placeholder="Enter email address"
                    type="email"
                    required
                  />

                  <div className="space-y-2">
                    <BaseLabel htmlFor="phone" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                      Phone Number
                    </BaseLabel>
                    <PhoneInput
                      international
                      countryCallingCodeEditable={false}
                      defaultCountry="US"
                      value={staffForm.watch('phone')}
                      onChange={(value) => staffForm.setValue('phone', value || '')}
                      className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_input]:bg-transparent ${
                        staffForm.formState.errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''
                      }`}
                    />
                    {staffForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {staffForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <BaseFormSelectField
                    name="role"
                    label="Role"
                    placeholder="Select a role"
                    required
                    onValueChange={handleRoleSelect}
                  >
                    {roles.map((role) => (
                      <BaseFormSelectItem key={role.role_id} value={role.role_id}>
                        {role.role_name}
                      </BaseFormSelectItem>
                    ))}
                    <BaseFormSelectItem value="add_new">+ Add New Role</BaseFormSelectItem>
                  </BaseFormSelectField>
                </FormProvider>
              </form>
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
            <h1 className="text-3xl font-heading font-semibold text-foreground">Staff Management</h1>
            <p className="text-muted-foreground">Manage your team members and their schedules</p>
          </div>
          
          <BaseDrawer
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            title="Add New Staff Member"
            trigger={
              <BaseButton variant="gradient" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Staff
              </BaseButton>
            }
            footer={
              <div className="flex gap-3 w-full">
                <BaseButton 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </BaseButton>
                <BaseButton 
                  type="submit" 
                  variant="gradient" 
                  className="flex-1"
                  onClick={() => {
                    const form = document.querySelector('form[data-staff-form]') as HTMLFormElement;
                    if (form) {
                      form.requestSubmit();
                    }
                  }}
                >
                  Add Staff
                </BaseButton>
              </div>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-4" data-staff-form>
              <FormProvider {...staffForm}>
                <BaseFormField
                  name="name"
                  label="Name"
                  placeholder="Enter staff name"
                  required
                />

                <BaseFormField
                  name="email"
                  label="Email"
                  placeholder="Enter email address"
                  type="email"
                  required
                />

                <div className="space-y-2">
                  <BaseLabel htmlFor="phone" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                    Phone Number
                  </BaseLabel>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="US"
                    value={staffForm.watch('phone')}
                    onChange={(value) => staffForm.setValue('phone', value || '')}
                    className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_input]:bg-transparent ${
                      staffForm.formState.errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''
                    }`}
                  />
                  {staffForm.formState.errors.phone && (
                    <p className="text-sm text-destructive">
                      {staffForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <BaseFormSelectField
                  name="role"
                  label="Role"
                  placeholder="Select a role"
                  required
                  onValueChange={handleRoleSelect}
                >
                  {roles.map((role) => (
                    <BaseFormSelectItem key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </BaseFormSelectItem>
                  ))}
                  <BaseFormSelectItem value="add_new">+ Add New Role</BaseFormSelectItem>
                </BaseFormSelectField>
              </FormProvider>
            </form>
          </BaseDrawer>
        </div>

        {/* Two Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Staff List */}
          <div className="lg:col-span-1">
            <BaseCard>
              <CardHeader className="pb-4">
                <h2 className="text-xl font-heading font-semibold">Staff List</h2>
              </CardHeader>
              <CardContent className="p-0">{/* Staff list items have their own padding */}
                <div className="space-y-3">
                {staff.map((member) => (
                  <div
                    key={member.employee_id}
                    className={`p-4 rounded-md border cursor-pointer transition-all ${
                      selectedStaff?.employee_id === member.employee_id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedStaff(member)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{member.display_name}</h3>
                        <BaseBadge variant="outline" size="sm">
                          {member.employee_id}
                        </BaseBadge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.role.role_name}</p>
                      <p className="text-sm text-muted-foreground">{member.contact.email}</p>
                      <p className="text-sm text-muted-foreground">{member.contact.phone}</p>
                    </div>
                  </div>
                ))}
                </div>
              </CardContent>
            </BaseCard>
          </div>

          {/* Right Panel - Staff Details */}
          <div className="lg:col-span-2">
            {selectedStaff ? (
              <div className="space-y-6">
                {/* Contact Info */}
                <BaseCard>
                  <CardHeader>
                    <h3 className="text-lg font-heading font-semibold">Contact Info</h3>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <BaseLabel>Name</BaseLabel>
                        <BaseInput
                          value={selectedStaff.display_name}
                          onChange={(e) => updateStaffField('display_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <BaseLabel>Employee ID</BaseLabel>
                        <BaseInput value={selectedStaff.employee_id} disabled />
                      </div>
                      <div className="space-y-2">
                        <BaseLabel>Email</BaseLabel>
                        <BaseInput
                          value={selectedStaff.contact.email}
                          onChange={(e) => updateStaffField('contact.email', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <BaseLabel>Phone</BaseLabel>
                        <PhoneInput
                          international
                          countryCallingCodeEditable={false}
                          defaultCountry="US"
                          value={selectedStaff.contact.phone}
                          onChange={(value) => updateStaffField('contact.phone', value || '')}
                          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_input]:bg-transparent"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <BaseLabel>Role</BaseLabel>
                      <p className="text-sm font-medium">{selectedStaff.role.role_name}</p>
                    </div>
                  </CardContent>
                </BaseCard>

                {/* Working Hours */}
                <BaseCard>
                  <CardHeader>
                    <h3 className="text-lg font-heading font-semibold">Working Hours</h3>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    {weekDays.map((day) => (
                      <div key={day.key} className="grid grid-cols-3 gap-4 items-center">
                        <BaseLabel className="font-medium">{day.label}</BaseLabel>
                        <BaseSelect
                          value={selectedStaff.work_hours[day.key as keyof typeof selectedStaff.work_hours].start}
                          onValueChange={(value) => updateWorkHours(day.key, 'start', value)}
                        >
                          {timeOptions.map((time) => (
                            <BaseSelectItem key={time} value={time}>{time}</BaseSelectItem>
                          ))}
                        </BaseSelect>
                        <BaseSelect
                          value={selectedStaff.work_hours[day.key as keyof typeof selectedStaff.work_hours].end}
                          onValueChange={(value) => updateWorkHours(day.key, 'end', value)}
                        >
                          {timeOptions.map((time) => (
                            <BaseSelectItem key={time} value={time}>{time}</BaseSelectItem>
                          ))}
                        </BaseSelect>
                      </div>
                    ))}

                                          <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Time Off / Exceptions</h4>
                          <BaseButton variant="outline" size="sm" onClick={addTimeOff}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Time Off
                          </BaseButton>
                        </div>
                        
                        {/* Time Off Column Headers */}
                        <div className="grid grid-cols-5 gap-2 items-center mb-3 px-3">
                          <span className="text-sm font-medium text-muted-foreground">Day</span>
                          <span className="text-sm font-medium text-muted-foreground">Start Time</span>
                          <span className="text-sm font-medium text-muted-foreground">End Time</span>
                          <span className="text-sm font-medium text-muted-foreground">Title</span>
                          <span className="text-sm font-medium text-muted-foreground">Actions</span>
                        </div>
                        
                        {selectedStaff.time_off.map((timeOff, index) => (
                        <div key={index} className="grid grid-cols-5 gap-2 items-center mb-2">
                          <BaseSelect
                            value={timeOff.day}
                            onValueChange={(value) => updateTimeOff(index, 'day', value)}
                          >
                            {weekDays.map((day) => (
                              <BaseSelectItem key={day.key} value={day.label}>{day.label}</BaseSelectItem>
                            ))}
                          </BaseSelect>
                          <BaseSelect
                            value={timeOff.start}
                            onValueChange={(value) => updateTimeOff(index, 'start', value)}
                          >
                            {timeOptions.map((time) => (
                              <BaseSelectItem key={time} value={time}>{time}</BaseSelectItem>
                            ))}
                          </BaseSelect>
                          <BaseSelect
                            value={timeOff.end}
                            onValueChange={(value) => updateTimeOff(index, 'end', value)}
                          >
                            {timeOptions.map((time) => (
                              <BaseSelectItem key={time} value={time}>{time}</BaseSelectItem>
                            ))}
                          </BaseSelect>
                          <BaseInput
                            value={timeOff.title}
                            onChange={(e) => updateTimeOff(index, 'title', e.target.value)}
                            placeholder="Title"
                          />
                          <BaseButton
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeOff(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </BaseButton>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </BaseCard>

                {/* Services */}
                <BaseCard>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-heading font-semibold">Services</h3>
                      <BaseButton variant="outline" size="sm" onClick={addService}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </BaseButton>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedStaff.service_list.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No services assigned yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {/* Services Column Headers */}
                        <div className="grid grid-cols-6 gap-3 items-center px-3 py-2 border-b">
                          <span className="text-sm font-medium text-muted-foreground">Service</span>
                          <span className="text-sm font-medium text-muted-foreground">Duration</span>
                          <span className="text-sm font-medium text-muted-foreground">Price</span>
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                          <span className="text-sm font-medium text-muted-foreground">Edit</span>
                          <span className="text-sm font-medium text-muted-foreground">Remove</span>
                        </div>
                        
                        {selectedStaff.service_list.map((service, index) => (
                          <div key={index} className="grid grid-cols-6 gap-3 items-center p-3 border rounded-md">
                            <BaseSelect
                              value={service.service_id}
                              onValueChange={(value) => updateService(index, 'service_id', value)}
                            >
                              {services.map((s) => (
                                <BaseSelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </BaseSelectItem>
                              ))}
                            </BaseSelect>
                            
                            <BaseSelect
                              value={service.duration_min.toString()}
                              onValueChange={(value) => updateService(index, 'duration_min', parseInt(value))}
                            >
                              {durationOptions.map((duration) => (
                                <BaseSelectItem key={duration} value={duration.toString()}>
                                  {duration} min
                                </BaseSelectItem>
                              ))}
                            </BaseSelect>
                            
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <BaseInput
                                type="number"
                                value={service.price}
                                onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || 0)}
                                className="pl-8"
                              />
                            </div>
                            
                            <div className="flex items-center justify-center">
                              <div className={`w-3 h-3 rounded-full ${service.active ? 'bg-success' : 'bg-destructive'}`} />
                            </div>
                            
                            <BaseButton
                              variant="ghost"
                              size="sm"
                              onClick={() => updateService(index, 'active', !service.active)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </BaseButton>
                            
                            <BaseButton
                              variant="ghost"
                              size="sm"
                              onClick={() => removeService(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </BaseButton>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </BaseCard>

                {/* Update Button */}
                <div className="flex justify-end">
                  <BaseButton variant="gradient" onClick={handleUpdate}>
                    Update Staff Information
                  </BaseButton>
                </div>
              </div>
            ) : (
              <BaseCard>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">Select a staff member to view details</p>
                </CardContent>
              </BaseCard>
            )}
          </div>
        </div>
      </Container>
    </AppLayout>
  );
}
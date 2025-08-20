import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/ui/Container";
import { BaseCard, CardHeader, CardContent } from "@/components/base/BaseCard";
import { BaseButton } from "@/components/base/BaseButton";
import { BaseInput } from "@/components/base/BaseInput";
import { BaseBadge } from "@/components/base/BaseBadge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseLabel } from "@/components/base/BaseLabel";
import { Plus, Search, Filter, Phone, Mail, Calendar, DollarSign } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import clientsData from '@/data/clients.json';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  lifetimeSpend: number;
  tags: string[];
  createdAt: string;
}

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function Clients() {
  const [clients, setClients] = useState<Client[]>(clientsData.clients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      phone: value || ""
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if email already exists
    if (clients.some(client => client.email === formData.email)) {
      toast.error("A client with this email already exists");
      return;
    }

    const newClient: Client = {
      id: (clients.length + 1).toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      lastVisit: new Date().toISOString().split('T')[0],
      lifetimeSpend: 0,
      tags: ["New Client"],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setClients(prev => [...prev, newClient]);
    setFormData({ name: "", email: "", phone: "" });
    setIsDialogOpen(false);
    toast.success("Client added successfully!");
  };

  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== "all") {
      switch (selectedFilter) {
        case "vip":
          filtered = filtered.filter(client => client.tags.includes("VIP"));
          break;
        case "new":
          filtered = filtered.filter(client => client.tags.includes("New Client"));
          break;
        case "regular":
          filtered = filtered.filter(client => client.tags.includes("Regular"));
          break;
        case "high-spend":
          filtered = filtered.filter(client => client.lifetimeSpend > 1000);
          break;
        case "recent":
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          filtered = filtered.filter(client => new Date(client.lastVisit) > oneWeekAgo);
          break;
      }
    }

    return filtered;
  }, [clients, searchTerm, selectedFilter]);

  return (
    <AppLayout>
      <Container className="py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-foreground">Clients</h1>
            <p className="text-muted-foreground">Manage your client database</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <BaseButton variant="gradient" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Client
              </BaseButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <BaseLabel htmlFor="name">Name *</BaseLabel>
                  <BaseInput
                    id="name"
                    name="name"
                    placeholder="Enter client name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <BaseLabel htmlFor="email">Email *</BaseLabel>
                  <BaseInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <BaseLabel htmlFor="phone">Phone Number *</BaseLabel>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="US"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_input]:bg-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <BaseButton type="submit" variant="gradient" className="flex-1">
                    Add Client
                  </BaseButton>
                  <BaseButton 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </BaseButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <BaseCard>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <BaseInput
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="vip">VIP Clients</SelectItem>
                  <SelectItem value="new">New Clients</SelectItem>
                  <SelectItem value="regular">Regular Clients</SelectItem>
                  <SelectItem value="high-spend">High Spenders ($1000+)</SelectItem>
                  <SelectItem value="recent">Recent Visits (7 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </BaseCard>

        {/* Clients Table */}
        <BaseCard>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold">
                Client List ({filteredClients.length})
              </h2>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Lifetime Spend</TableHead>
                    <TableHead>Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm || selectedFilter !== "all" 
                          ? "No clients found matching your criteria" 
                          : "No clients added yet"
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${getAvatarColor(client.name)} flex items-center justify-center text-white font-semibold text-sm`}>
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Member since {formatDate(client.createdAt)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {client.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {client.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(client.lastVisit)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {formatCurrency(client.lifetimeSpend)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {client.tags.map((tag, index) => (
                              <BaseBadge 
                                key={index} 
                                variant={
                                  tag === "VIP" ? "success" : 
                                  tag === "New Client" ? "warning" : 
                                  "secondary"
                                }
                                size="sm"
                              >
                                {tag}
                              </BaseBadge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </BaseCard>
      </Container>
    </AppLayout>
  );
}
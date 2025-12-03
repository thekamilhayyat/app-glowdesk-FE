import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/ui/Container";
import { BaseCard, CardHeader, CardContent } from "@/components/base/BaseCard";
import { BaseButton } from "@/components/base/BaseButton";
import { BaseInput } from "@/components/base/BaseInput";
import { BaseLabel } from "@/components/base/BaseLabel";
import { BaseBadge } from "@/components/base/BaseBadge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  Building2,
  Clock,
  DollarSign,
  CreditCard,
  Calendar,
  Bell,
  Palette,
  Link2,
  Save,
  MapPin,
  Phone,
  Mail,
  Globe,
  Percent,
  Shield,
} from "lucide-react";

export function Settings() {
  const {
    businessProfile,
    businessHours,
    commissionSettings,
    taxSettings,
    paymentSettings,
    bookingSettings,
    notificationSettings,
    appearanceSettings,
    integrationSettings,
    updateBusinessProfile,
    updateBusinessHours,
    updateCommissionSettings,
    updateTaxSettings,
    updatePaymentSettings,
    updateBookingSettings,
    updateNotificationSettings,
    updateAppearanceSettings,
    updateIntegrationSettings,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState("business");
  const [formData, setFormData] = useState({
    businessName: businessProfile.name,
    legalName: businessProfile.legalName || "",
    email: businessProfile.email,
    phone: businessProfile.phone,
    street: businessProfile.address.street,
    city: businessProfile.address.city,
    state: businessProfile.address.state,
    zipCode: businessProfile.address.zipCode,
    country: businessProfile.address.country,
    website: businessProfile.website || "",
    description: businessProfile.description || "",
  });

  const handleBusinessSave = () => {
    updateBusinessProfile({
      name: formData.businessName,
      legalName: formData.legalName || undefined,
      email: formData.email,
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      },
      website: formData.website || undefined,
      description: formData.description || undefined,
    });
    toast.success("Business profile updated successfully");
  };

  const handleHoursChange = (dayOfWeek: number, field: string, value: string | boolean) => {
    const updatedHours = businessHours.map((h) => {
      if (h.dayOfWeek === dayOfWeek) {
        return { ...h, [field]: value };
      }
      return h;
    });
    updateBusinessHours(updatedHours);
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <AppLayout>
      <Container>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your business settings and preferences
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex flex-wrap gap-1">
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Business</span>
              </TabsTrigger>
              <TabsTrigger value="hours" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Hours</span>
              </TabsTrigger>
              <TabsTrigger value="commissions" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                <span className="hidden sm:inline">Commissions</span>
              </TabsTrigger>
              <TabsTrigger value="taxes" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Taxes</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Payments</span>
              </TabsTrigger>
              <TabsTrigger value="booking" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Booking</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Permissions</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">Integrations</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="space-y-6">
              <BaseCard>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Business Profile</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <BaseLabel htmlFor="businessName">Business Name *</BaseLabel>
                      <BaseInput
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="Your Salon Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <BaseLabel htmlFor="legalName">Legal Business Name</BaseLabel>
                      <BaseInput
                        id="legalName"
                        value={formData.legalName}
                        onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                        placeholder="Legal Entity Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <BaseLabel htmlFor="description">Description</BaseLabel>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your business..."
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <BaseLabel htmlFor="email">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email Address *
                      </BaseLabel>
                      <BaseInput
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@yoursalon.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <BaseLabel htmlFor="phone">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Phone Number *
                      </BaseLabel>
                      <BaseInput
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1-555-0100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <BaseLabel htmlFor="website">
                      <Globe className="inline h-4 w-4 mr-1" />
                      Website
                    </BaseLabel>
                    <BaseInput
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yoursalon.com"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <BaseLabel htmlFor="street">Street Address</BaseLabel>
                        <BaseInput
                          id="street"
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div className="space-y-2">
                        <BaseLabel htmlFor="city">City</BaseLabel>
                        <BaseInput
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Los Angeles"
                        />
                      </div>
                      <div className="space-y-2">
                        <BaseLabel htmlFor="state">State/Province</BaseLabel>
                        <BaseInput
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="CA"
                        />
                      </div>
                      <div className="space-y-2">
                        <BaseLabel htmlFor="zipCode">ZIP/Postal Code</BaseLabel>
                        <BaseInput
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          placeholder="90001"
                        />
                      </div>
                      <div className="space-y-2">
                        <BaseLabel htmlFor="country">Country</BaseLabel>
                        <BaseInput
                          id="country"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="USA"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <BaseButton variant="gradient" onClick={handleBusinessSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </BaseButton>
                  </div>
                </CardContent>
              </BaseCard>
            </TabsContent>

            <TabsContent value="hours" className="space-y-6">
              <BaseCard>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Business Hours</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessHours.map((hours) => (
                      <div
                        key={hours.dayOfWeek}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30"
                      >
                        <div className="w-28 font-medium">{dayNames[hours.dayOfWeek]}</div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={hours.isOpen}
                            onCheckedChange={(checked) =>
                              handleHoursChange(hours.dayOfWeek, "isOpen", checked)
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {hours.isOpen ? "Open" : "Closed"}
                          </span>
                        </div>
                        {hours.isOpen && (
                          <div className="flex items-center gap-2 ml-auto">
                            <BaseInput
                              type="time"
                              value={hours.openTime}
                              onChange={(e) =>
                                handleHoursChange(hours.dayOfWeek, "openTime", e.target.value)
                              }
                              className="w-32"
                            />
                            <span className="text-muted-foreground">to</span>
                            <BaseInput
                              type="time"
                              value={hours.closeTime}
                              onChange={(e) =>
                                handleHoursChange(hours.dayOfWeek, "closeTime", e.target.value)
                              }
                              className="w-32"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </BaseCard>
            </TabsContent>

            <TabsContent value="commissions" className="space-y-6">
              <BaseCard>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Commission Settings</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <BaseLabel>Default Service Commission Rate</BaseLabel>
                      <div className="flex items-center gap-2">
                        <BaseInput
                          type="number"
                          min="0"
                          max="100"
                          value={commissionSettings.defaultServiceCommissionRate}
                          onChange={(e) =>
                            updateCommissionSettings({
                              defaultServiceCommissionRate: Number(e.target.value),
                            })
                          }
                          className="w-24"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Applied to service revenue for staff without custom rates
                      </p>
                    </div>
                    <div className="space-y-2">
                      <BaseLabel>Default Product Commission Rate</BaseLabel>
                      <div className="flex items-center gap-2">
                        <BaseInput
                          type="number"
                          min="0"
                          max="100"
                          value={commissionSettings.defaultProductCommissionRate}
                          onChange={(e) =>
                            updateCommissionSettings({
                              defaultProductCommissionRate: Number(e.target.value),
                            })
                          }
                          className="w-24"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Applied to product sales for staff without custom rates
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-sm font-medium">Commission Calculation Options</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Include Discounted Amount</p>
                          <p className="text-sm text-muted-foreground">
                            Calculate commission on the discounted price instead of original
                          </p>
                        </div>
                        <Switch
                          checked={commissionSettings.includeDiscountedAmount}
                          onCheckedChange={(checked) =>
                            updateCommissionSettings({ includeDiscountedAmount: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Calculate on Pre-Tax Amount</p>
                          <p className="text-sm text-muted-foreground">
                            Calculate commission before tax is added
                          </p>
                        </div>
                        <Switch
                          checked={commissionSettings.calculateOnPreTax}
                          onCheckedChange={(checked) =>
                            updateCommissionSettings({ calculateOnPreTax: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Tips Commission</p>
                          <p className="text-sm text-muted-foreground">
                            Apply commission rate to tips received
                          </p>
                        </div>
                        <Switch
                          checked={commissionSettings.tipCommission}
                          onCheckedChange={(checked) =>
                            updateCommissionSettings({ tipCommission: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </BaseCard>
            </TabsContent>

            <TabsContent value="taxes" className="space-y-6">
              <BaseCard>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Tax Settings</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Taxes</p>
                      <p className="text-sm text-muted-foreground">
                        Apply tax to eligible transactions
                      </p>
                    </div>
                    <Switch
                      checked={taxSettings.enabled}
                      onCheckedChange={(checked) => updateTaxSettings({ enabled: checked })}
                    />
                  </div>

                  {taxSettings.enabled && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <BaseLabel>Tax Name</BaseLabel>
                          <BaseInput
                            value={taxSettings.taxName}
                            onChange={(e) => updateTaxSettings({ taxName: e.target.value })}
                            placeholder="Sales Tax"
                          />
                        </div>
                        <div className="space-y-2">
                          <BaseLabel>Default Tax Rate</BaseLabel>
                          <div className="flex items-center gap-2">
                            <BaseInput
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={taxSettings.defaultTaxRate}
                              onChange={(e) =>
                                updateTaxSettings({ defaultTaxRate: Number(e.target.value) })
                              }
                              className="w-24"
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Include Tax in Displayed Prices</p>
                            <p className="text-sm text-muted-foreground">
                              Show prices with tax included
                            </p>
                          </div>
                          <Switch
                            checked={taxSettings.includeTaxInPrice}
                            onCheckedChange={(checked) =>
                              updateTaxSettings({ includeTaxInPrice: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Services Taxable</p>
                            <p className="text-sm text-muted-foreground">Apply tax to services</p>
                          </div>
                          <Switch
                            checked={taxSettings.serviceTaxable}
                            onCheckedChange={(checked) =>
                              updateTaxSettings({ serviceTaxable: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Products Taxable</p>
                            <p className="text-sm text-muted-foreground">Apply tax to products</p>
                          </div>
                          <Switch
                            checked={taxSettings.productTaxable}
                            onCheckedChange={(checked) =>
                              updateTaxSettings({ productTaxable: checked })
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </BaseCard>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <BaseCard>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Payment Settings</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-4">Accepted Payment Methods</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(paymentSettings.acceptedMethods).map(([method, enabled]) => (
                        <div key={method} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="capitalize">{method.replace(/([A-Z])/g, " $1").trim()}</span>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) =>
                              updatePaymentSettings({
                                acceptedMethods: {
                                  ...paymentSettings.acceptedMethods,
                                  [method]: checked,
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-sm font-medium">Tips Settings</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Allow Tips</p>
                        <p className="text-sm text-muted-foreground">
                          Enable tip collection at checkout
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.allowTips}
                        onCheckedChange={(checked) =>
                          updatePaymentSettings({ allowTips: checked })
                        }
                      />
                    </div>
                    {paymentSettings.allowTips && (
                      <div className="space-y-2">
                        <BaseLabel>Suggested Tip Percentages</BaseLabel>
                        <div className="flex gap-2">
                          {paymentSettings.suggestedTipPercentages.map((tip, index) => (
                            <BaseBadge key={index} variant="outline" className="text-sm">
                              {tip}%
                            </BaseBadge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-sm font-medium">Deposit & Cancellation Fees</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Require Deposit</p>
                        <p className="text-sm text-muted-foreground">
                          Require deposit for bookings
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.depositRequired}
                        onCheckedChange={(checked) =>
                          updatePaymentSettings({ depositRequired: checked })
                        }
                      />
                    </div>
                    {paymentSettings.depositRequired && (
                      <div className="space-y-2">
                        <BaseLabel>Default Deposit Percentage</BaseLabel>
                        <div className="flex items-center gap-2">
                          <BaseInput
                            type="number"
                            min="0"
                            max="100"
                            value={paymentSettings.defaultDepositPercentage}
                            onChange={(e) =>
                              updatePaymentSettings({
                                defaultDepositPercentage: Number(e.target.value),
                              })
                            }
                            className="w-24"
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </BaseCard>
            </TabsContent>

            <TabsContent value="booking" className="space-y-6">
              <BaseCard>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Booking Settings</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Allow Online Booking</p>
                        <p className="text-sm text-muted-foreground">
                          Clients can book appointments online
                        </p>
                      </div>
                      <Switch
                        checked={bookingSettings.allowOnlineBooking}
                        onCheckedChange={(checked) =>
                          updateBookingSettings({ allowOnlineBooking: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Allow Guest Booking</p>
                        <p className="text-sm text-muted-foreground">
                          Clients can book without creating an account
                        </p>
                      </div>
                      <Switch
                        checked={bookingSettings.allowGuestBooking}
                        onCheckedChange={(checked) =>
                          updateBookingSettings({ allowGuestBooking: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Show Staff Selection</p>
                        <p className="text-sm text-muted-foreground">
                          Allow clients to choose their preferred staff
                        </p>
                      </div>
                      <Switch
                        checked={bookingSettings.showStaffSelection}
                        onCheckedChange={(checked) =>
                          updateBookingSettings({ showStaffSelection: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-Confirm Bookings</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically confirm new appointments
                        </p>
                      </div>
                      <Switch
                        checked={bookingSettings.autoConfirmBookings}
                        onCheckedChange={(checked) =>
                          updateBookingSettings({ autoConfirmBookings: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable Waitlist</p>
                        <p className="text-sm text-muted-foreground">
                          Allow clients to join waitlist for full slots
                        </p>
                      </div>
                      <Switch
                        checked={bookingSettings.waitlistEnabled}
                        onCheckedChange={(checked) =>
                          updateBookingSettings({ waitlistEnabled: checked })
                        }
                      />
                    </div>
                    {bookingSettings.waitlistEnabled && (
                      <div className="ml-6 space-y-2">
                        <BaseLabel>Maximum Waitlist Size</BaseLabel>
                        <BaseInput
                          type="number"
                          min="1"
                          value={bookingSettings.maxWaitlistSize || 10}
                          onChange={(e) =>
                            updateBookingSettings({ maxWaitlistSize: Number(e.target.value) || undefined })
                          }
                          className="w-24"
                        />
                        <p className="text-xs text-muted-foreground">
                          Maximum number of clients per waitlist
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <BaseLabel>Booking Window (days)</BaseLabel>
                      <BaseInput
                        type="number"
                        min="1"
                        value={bookingSettings.bookingWindowDays}
                        onChange={(e) =>
                          updateBookingSettings({ bookingWindowDays: Number(e.target.value) })
                        }
                        className="w-32"
                      />
                      <p className="text-xs text-muted-foreground">
                        How far in advance clients can book
                      </p>
                    </div>
                    <div className="space-y-2">
                      <BaseLabel>Minimum Advance (hours)</BaseLabel>
                      <BaseInput
                        type="number"
                        min="0"
                        value={bookingSettings.minAdvanceBookingHours}
                        onChange={(e) =>
                          updateBookingSettings({ minAdvanceBookingHours: Number(e.target.value) })
                        }
                        className="w-32"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum hours before appointment to book
                      </p>
                    </div>
                    <div className="space-y-2">
                      <BaseLabel>Time Slot Duration (minutes)</BaseLabel>
                      <BaseInput
                        type="number"
                        min="5"
                        step="5"
                        value={bookingSettings.slotDuration}
                        onChange={(e) =>
                          updateBookingSettings({ slotDuration: Number(e.target.value) })
                        }
                        className="w-32"
                      />
                    </div>
                    <div className="space-y-2">
                      <BaseLabel>Buffer Time (minutes)</BaseLabel>
                      <BaseInput
                        type="number"
                        min="0"
                        step="5"
                        value={bookingSettings.bufferTime}
                        onChange={(e) =>
                          updateBookingSettings({ bufferTime: Number(e.target.value) })
                        }
                        className="w-32"
                      />
                      <p className="text-xs text-muted-foreground">
                        Time between appointments
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium mb-4">Cancellation Policy</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable Cancellation Policy</p>
                          <p className="text-sm text-muted-foreground">
                            Apply fees for late cancellations
                          </p>
                        </div>
                        <Switch
                          checked={bookingSettings.cancellationPolicy.enabled}
                          onCheckedChange={(checked) =>
                            updateBookingSettings({
                              cancellationPolicy: {
                                ...bookingSettings.cancellationPolicy,
                                enabled: checked,
                              },
                            })
                          }
                        />
                      </div>
                      {bookingSettings.cancellationPolicy.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <BaseLabel>Free Cancellation Window (hours)</BaseLabel>
                            <BaseInput
                              type="number"
                              min="0"
                              value={bookingSettings.cancellationPolicy.freeCancellationHours}
                              onChange={(e) =>
                                updateBookingSettings({
                                  cancellationPolicy: {
                                    ...bookingSettings.cancellationPolicy,
                                    freeCancellationHours: Number(e.target.value),
                                  },
                                })
                              }
                              className="w-32"
                            />
                          </div>
                          <div className="space-y-2">
                            <BaseLabel>Late Cancellation Fee (%)</BaseLabel>
                            <BaseInput
                              type="number"
                              min="0"
                              max="100"
                              value={bookingSettings.cancellationPolicy.lateCancellationFee}
                              onChange={(e) =>
                                updateBookingSettings({
                                  cancellationPolicy: {
                                    ...bookingSettings.cancellationPolicy,
                                    lateCancellationFee: Number(e.target.value),
                                  },
                                })
                              }
                              className="w-32"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </BaseCard>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <BaseCard>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Notification Settings</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Booking Confirmation</span>
                        <Switch
                          checked={notificationSettings.email.bookingConfirmation}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              email: { ...notificationSettings.email, bookingConfirmation: checked },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Booking Reminder</span>
                        <Switch
                          checked={notificationSettings.email.bookingReminder}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              email: { ...notificationSettings.email, bookingReminder: checked },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Cancellation Notice</span>
                        <Switch
                          checked={notificationSettings.email.bookingCancellation}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              email: { ...notificationSettings.email, bookingCancellation: checked },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Payment Receipt</span>
                        <Switch
                          checked={notificationSettings.email.paymentReceipt}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              email: { ...notificationSettings.email, paymentReceipt: checked },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Review Request</span>
                        <Switch
                          checked={notificationSettings.email.reviewRequest}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              email: { ...notificationSettings.email, reviewRequest: checked },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium mb-4">SMS Notifications</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">Enable SMS</p>
                        <p className="text-sm text-muted-foreground">
                          Send text message notifications
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.sms.enabled}
                        onCheckedChange={(checked) =>
                          updateNotificationSettings({
                            sms: { ...notificationSettings.sms, enabled: checked },
                          })
                        }
                      />
                    </div>
                    {notificationSettings.sms.enabled && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Booking Confirmation</span>
                          <Switch
                            checked={notificationSettings.sms.bookingConfirmation}
                            onCheckedChange={(checked) =>
                              updateNotificationSettings({
                                sms: { ...notificationSettings.sms, bookingConfirmation: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Booking Reminder</span>
                          <Switch
                            checked={notificationSettings.sms.bookingReminder}
                            onCheckedChange={(checked) =>
                              updateNotificationSettings({
                                sms: { ...notificationSettings.sms, bookingReminder: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium mb-4">Reminder Timing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <BaseLabel>First Reminder (hours before)</BaseLabel>
                        <BaseInput
                          type="number"
                          min="1"
                          value={notificationSettings.reminderTiming.firstReminder}
                          onChange={(e) =>
                            updateNotificationSettings({
                              reminderTiming: {
                                ...notificationSettings.reminderTiming,
                                firstReminder: Number(e.target.value),
                              },
                            })
                          }
                          className="w-32"
                        />
                      </div>
                      <div className="space-y-2">
                        <BaseLabel>Second Reminder (hours before)</BaseLabel>
                        <BaseInput
                          type="number"
                          min="0"
                          value={notificationSettings.reminderTiming.secondReminder || 0}
                          onChange={(e) =>
                            updateNotificationSettings({
                              reminderTiming: {
                                ...notificationSettings.reminderTiming,
                                secondReminder: Number(e.target.value) || undefined,
                              },
                            })
                          }
                          className="w-32"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </BaseCard>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              <BaseCard>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Permission Templates</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Permission templates define what staff members can access and manage in the system.
                      Assign templates to staff members to control their access levels.
                    </p>

                    <div className="grid gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Owner</h3>
                          <BaseBadge variant="default">Full Access</BaseBadge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Complete access to all features, settings, and data. Cannot be modified.
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Manager</h3>
                          <BaseBadge variant="secondary">High Access</BaseBadge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Can manage staff, view reports, process refunds, and access most features.
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Receptionist</h3>
                          <BaseBadge variant="secondary">Medium Access</BaseBadge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Can manage calendar, clients, apply discounts, and view all appointments.
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Service Provider</h3>
                          <BaseBadge variant="outline">Low Access</BaseBadge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Can view and manage their own appointments, clients, and basic sales functions.
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Basic</h3>
                          <BaseBadge variant="outline">View Only</BaseBadge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Read-only access to calendar and services. Cannot make changes.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <BaseButton variant="outline" className="w-full">
                        Create Custom Permission Template
                      </BaseButton>
                    </div>
                  </div>
                </CardContent>
              </BaseCard>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <BaseCard>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Appearance Settings</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-4">Brand Colors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <BaseLabel>Primary Color</BaseLabel>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={appearanceSettings.primaryColor}
                            onChange={(e) =>
                              updateAppearanceSettings({ primaryColor: e.target.value })
                            }
                            className="w-12 h-10 rounded border cursor-pointer"
                          />
                          <BaseInput
                            value={appearanceSettings.primaryColor}
                            onChange={(e) =>
                              updateAppearanceSettings({ primaryColor: e.target.value })
                            }
                            className="w-28"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <BaseLabel>Secondary Color</BaseLabel>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={appearanceSettings.secondaryColor}
                            onChange={(e) =>
                              updateAppearanceSettings({ secondaryColor: e.target.value })
                            }
                            className="w-12 h-10 rounded border cursor-pointer"
                          />
                          <BaseInput
                            value={appearanceSettings.secondaryColor}
                            onChange={(e) =>
                              updateAppearanceSettings({ secondaryColor: e.target.value })
                            }
                            className="w-28"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <BaseLabel>Accent Color</BaseLabel>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={appearanceSettings.accentColor}
                            onChange={(e) =>
                              updateAppearanceSettings({ accentColor: e.target.value })
                            }
                            className="w-12 h-10 rounded border cursor-pointer"
                          />
                          <BaseInput
                            value={appearanceSettings.accentColor}
                            onChange={(e) =>
                              updateAppearanceSettings({ accentColor: e.target.value })
                            }
                            className="w-28"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-sm font-medium">Display Options</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Show Business Name</p>
                          <p className="text-sm text-muted-foreground">
                            Display business name in the booking page header
                          </p>
                        </div>
                        <Switch
                          checked={appearanceSettings.showBusinessName}
                          onCheckedChange={(checked) =>
                            updateAppearanceSettings({ showBusinessName: checked })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <BaseLabel>Logo Position</BaseLabel>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="logoPosition"
                              value="left"
                              checked={appearanceSettings.logoPosition === "left"}
                              onChange={() => updateAppearanceSettings({ logoPosition: "left" })}
                              className="w-4 h-4"
                            />
                            <span>Left</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="logoPosition"
                              value="center"
                              checked={appearanceSettings.logoPosition === "center"}
                              onChange={() => updateAppearanceSettings({ logoPosition: "center" })}
                              className="w-4 h-4"
                            />
                            <span>Center</span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <BaseLabel>Booking Page Theme</BaseLabel>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              value="light"
                              checked={appearanceSettings.bookingPageTheme === "light"}
                              onChange={() => updateAppearanceSettings({ bookingPageTheme: "light" })}
                              className="w-4 h-4"
                            />
                            <span>Light</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              value="dark"
                              checked={appearanceSettings.bookingPageTheme === "dark"}
                              onChange={() => updateAppearanceSettings({ bookingPageTheme: "dark" })}
                              className="w-4 h-4"
                            />
                            <span>Dark</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              value="auto"
                              checked={appearanceSettings.bookingPageTheme === "auto"}
                              onChange={() => updateAppearanceSettings({ bookingPageTheme: "auto" })}
                              className="w-4 h-4"
                            />
                            <span>Auto (System)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="space-y-2">
                      <BaseLabel>Custom CSS (Advanced)</BaseLabel>
                      <textarea
                        value={appearanceSettings.customCss || ""}
                        onChange={(e) =>
                          updateAppearanceSettings({ customCss: e.target.value || undefined })
                        }
                        placeholder="/* Add custom CSS styles for the booking page */"
                        className="w-full min-h-[100px] font-mono text-sm rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground">
                        Add custom CSS to further customize the booking page appearance
                      </p>
                    </div>
                  </div>
                </CardContent>
              </BaseCard>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <BaseCard>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Integrations</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">Google Calendar</h3>
                          <p className="text-sm text-muted-foreground">
                            Sync appointments with Google Calendar
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={integrationSettings.googleCalendar.enabled}
                        onCheckedChange={(checked) =>
                          updateIntegrationSettings({
                            googleCalendar: { ...integrationSettings.googleCalendar, enabled: checked },
                          })
                        }
                      />
                    </div>
                    {integrationSettings.googleCalendar.enabled && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Sync Appointments</span>
                          <Switch
                            checked={integrationSettings.googleCalendar.syncAppointments}
                            onCheckedChange={(checked) =>
                              updateIntegrationSettings({
                                googleCalendar: { ...integrationSettings.googleCalendar, syncAppointments: checked },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <BaseLabel>Calendar ID</BaseLabel>
                          <BaseInput
                            value={integrationSettings.googleCalendar.calendarId || ""}
                            onChange={(e) =>
                              updateIntegrationSettings({
                                googleCalendar: { ...integrationSettings.googleCalendar, calendarId: e.target.value || undefined },
                              })
                            }
                            placeholder="primary"
                          />
                        </div>
                        <BaseButton variant="outline" size="sm">
                          Connect Google Account
                        </BaseButton>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">Stripe</h3>
                          <p className="text-sm text-muted-foreground">
                            Accept payments with Stripe
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={integrationSettings.stripe.enabled}
                        onCheckedChange={(checked) =>
                          updateIntegrationSettings({
                            stripe: { ...integrationSettings.stripe, enabled: checked },
                          })
                        }
                      />
                    </div>
                    {integrationSettings.stripe.enabled && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="space-y-2">
                          <BaseLabel>Account ID</BaseLabel>
                          <BaseInput
                            value={integrationSettings.stripe.accountId || ""}
                            onChange={(e) =>
                              updateIntegrationSettings({
                                stripe: { ...integrationSettings.stripe, accountId: e.target.value || undefined },
                              })
                            }
                            placeholder="acct_..."
                          />
                        </div>
                        <BaseButton variant="outline" size="sm" className="mt-3">
                          Connect Stripe Account
                        </BaseButton>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">Mailchimp</h3>
                          <p className="text-sm text-muted-foreground">
                            Sync clients with Mailchimp for email marketing
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={integrationSettings.mailchimp.enabled}
                        onCheckedChange={(checked) =>
                          updateIntegrationSettings({
                            mailchimp: { ...integrationSettings.mailchimp, enabled: checked },
                          })
                        }
                      />
                    </div>
                    {integrationSettings.mailchimp.enabled && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="space-y-2">
                          <BaseLabel>API Key</BaseLabel>
                          <BaseInput
                            type="password"
                            value={integrationSettings.mailchimp.apiKey || ""}
                            onChange={(e) =>
                              updateIntegrationSettings({
                                mailchimp: { ...integrationSettings.mailchimp, apiKey: e.target.value || undefined },
                              })
                            }
                            placeholder="Enter API key"
                          />
                        </div>
                        <div className="space-y-2">
                          <BaseLabel>List ID</BaseLabel>
                          <BaseInput
                            value={integrationSettings.mailchimp.listId || ""}
                            onChange={(e) =>
                              updateIntegrationSettings({
                                mailchimp: { ...integrationSettings.mailchimp, listId: e.target.value || undefined },
                              })
                            }
                            placeholder="Enter list ID"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                          <Link2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">Zapier</h3>
                          <p className="text-sm text-muted-foreground">
                            Connect to 5,000+ apps with Zapier webhooks
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={integrationSettings.zapier.enabled}
                        onCheckedChange={(checked) =>
                          updateIntegrationSettings({
                            zapier: { ...integrationSettings.zapier, enabled: checked },
                          })
                        }
                      />
                    </div>
                    {integrationSettings.zapier.enabled && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="space-y-2">
                          <BaseLabel>Webhook URL</BaseLabel>
                          <BaseInput
                            value={integrationSettings.zapier.webhookUrl || ""}
                            onChange={(e) =>
                              updateIntegrationSettings({
                                zapier: { ...integrationSettings.zapier, webhookUrl: e.target.value || undefined },
                              })
                            }
                            placeholder="https://hooks.zapier.com/..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </BaseCard>
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </AppLayout>
  );
}

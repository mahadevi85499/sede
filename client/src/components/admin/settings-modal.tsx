import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Store, 
  Bell, 
  Users, 
  CreditCard, 
  Wifi, 
  Printer, 
  Save,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const restaurantSettingsSchema = z.object({
  name: z.string().min(2, "Restaurant name is required"),
  address: z.string().min(10, "Complete address is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  openingTime: z.string(),
  closingTime: z.string(),
  maxTables: z.number().min(1).max(100),
  taxPercentage: z.number().min(0).max(50),
});

type RestaurantSettings = z.infer<typeof restaurantSettingsSchema>;

const initialSettings: RestaurantSettings = {
  name: "The Golden Spoon Restaurant",
  address: "123 Main Street, Downtown, City - 400001",
  phone: "+91 98765 43210",
  email: "contact@goldenspoon.com",
  description: "Fine dining experience with authentic Indian cuisine and modern ambiance",
  openingTime: "11:00",
  closingTime: "23:00",
  maxTables: 20,
  taxPercentage: 18,
};

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [notifications, setNotifications] = useState({
    newOrders: true,
    serviceRequests: true,
    lowStock: false,
    dailyReports: true,
    systemAlerts: true,
  });

  const [integrations, setIntegrations] = useState({
    wifi: { enabled: true, status: 'connected' },
    printer: { enabled: true, status: 'connected' },
    payment: { enabled: true, status: 'connected' },
    delivery: { enabled: false, status: 'disconnected' },
  });

  const { toast } = useToast();

  const form = useForm<RestaurantSettings>({
    resolver: zodResolver(restaurantSettingsSchema),
    defaultValues: initialSettings,
  });

  const onSubmit = (data: RestaurantSettings) => {
    // In a real app, this would save to Firebase/database
    console.log("Settings updated:", data);
    
    toast({
      title: "Settings saved successfully!",
      description: "Restaurant settings have been updated",
    });
  };

  const saveNotificationSettings = () => {
    // In a real app, this would save to Firebase/database
    console.log("Notification settings:", notifications);
    
    toast({
      title: "Notification settings saved",
      description: "Your preferences have been updated",
    });
  };

  const testIntegration = (service: string) => {
    toast({
      title: `Testing ${service} connection...`,
      description: "Please wait while we verify the connection",
    });

    // Simulate test
    setTimeout(() => {
      toast({
        title: `${service} test successful!`,
        description: "Connection is working properly",
      });
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    return status === 'connected' ? (
      <Badge className="bg-success-green">Connected</Badge>
    ) : (
      <Badge className="bg-red-500">Disconnected</Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-secondary-dark border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center space-x-2">
            <Settings className="text-blue-400" size={20} />
            <span>Restaurant Settings</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-primary-dark">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card className="bg-primary-dark border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Store className="text-accent-orange" size={18} />
                  <span>Restaurant Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Restaurant Name</FormLabel>
                            <FormControl>
                              <Input 
                                className="bg-secondary-dark border-gray-600"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                className="bg-secondary-dark border-gray-600"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              className="bg-secondary-dark border-gray-600"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="bg-secondary-dark border-gray-600"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="bg-secondary-dark border-gray-600"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="openingTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opening Time</FormLabel>
                            <FormControl>
                              <Input 
                                type="time"
                                className="bg-secondary-dark border-gray-600"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="closingTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Closing Time</FormLabel>
                            <FormControl>
                              <Input 
                                type="time"
                                className="bg-secondary-dark border-gray-600"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxTables"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Tables</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="1"
                                max="100"
                                className="bg-secondary-dark border-gray-600"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="taxPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                max="50"
                                step="0.1"
                                className="bg-secondary-dark border-gray-600"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="bg-success-green hover:bg-green-600"
                    >
                      <Save size={16} className="mr-2" />
                      Save Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-primary-dark border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="text-warning-yellow" size={18} />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-secondary-dark rounded-lg">
                    <div>
                      <div className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                      <div className="text-sm text-gray-400">
                        {key === 'newOrders' && 'Get notified when new orders are placed'}
                        {key === 'serviceRequests' && 'Alerts for customer service requests'}
                        {key === 'lowStock' && 'Inventory low stock warnings'}
                        {key === 'dailyReports' && 'Daily business summary reports'}
                        {key === 'systemAlerts' && 'System maintenance and updates'}
                      </div>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
                
                <Button 
                  onClick={saveNotificationSettings}
                  className="bg-warning-yellow text-black hover:bg-yellow-600"
                >
                  <Save size={16} className="mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Settings */}
          <TabsContent value="integrations" className="space-y-4">
            <Card className="bg-primary-dark border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wifi className="text-blue-400" size={18} />
                  <span>System Integrations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(integrations).map(([key, config]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-secondary-dark rounded-lg">
                    <div className="flex items-center space-x-3">
                      {key === 'wifi' && <Wifi size={20} className="text-blue-400" />}
                      {key === 'printer' && <Printer size={20} className="text-gray-400" />}
                      {key === 'payment' && <CreditCard size={20} className="text-success-green" />}
                      {key === 'delivery' && <Users size={20} className="text-accent-orange" />}
                      
                      <div>
                        <div className="font-medium capitalize">{key} Integration</div>
                        <div className="text-sm text-gray-400">
                          {key === 'wifi' && 'Restaurant WiFi system'}
                          {key === 'printer' && 'Kitchen receipt printer'}
                          {key === 'payment' && 'Payment gateway integration'}
                          {key === 'delivery' && 'Third-party delivery platforms'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(config.status)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => testIntegration(key)}
                        className="text-blue-400 hover:bg-blue-600 hover:text-white"
                      >
                        <RefreshCw size={14} className="mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-4">
            <Card className="bg-primary-dark border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="text-blue-400" size={18} />
                  <span>System Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-secondary-dark rounded-lg">
                      <span className="text-gray-400">System Version</span>
                      <span className="font-medium">v2.1.0</span>
                    </div>
                    <div className="flex justify-between p-3 bg-secondary-dark rounded-lg">
                      <span className="text-gray-400">Database Status</span>
                      <Badge className="bg-success-green">Connected</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-secondary-dark rounded-lg">
                      <span className="text-gray-400">Last Backup</span>
                      <span className="font-medium">2 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-secondary-dark rounded-lg">
                      <span className="text-gray-400">Storage Used</span>
                      <span className="font-medium">2.3 GB / 10 GB</span>
                    </div>
                    <div className="flex justify-between p-3 bg-secondary-dark rounded-lg">
                      <span className="text-gray-400">Active Users</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between p-3 bg-secondary-dark rounded-lg">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="font-medium">Today</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button 
                    variant="ghost"
                    className="text-blue-400 hover:bg-blue-600 hover:text-white"
                  >
                    Check Updates
                  </Button>
                  <Button 
                    variant="ghost"
                    className="text-success-green hover:bg-green-600 hover:text-white"
                  >
                    Backup Now
                  </Button>
                  <Button 
                    variant="ghost"
                    className="text-accent-orange hover:bg-orange-600 hover:text-white"
                  >
                    System Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            variant="ghost"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
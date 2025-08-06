import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Car, ShoppingBag, Calendar } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import FoodMenu from "./food-menu";
import Cart from "./cart";
import type { OrderEvent } from "@shared/schema";

interface OrderAheadFormData {
  customerName: string;
  customerPhone: string;
  orderType: "takeout" | "delivery";
  scheduledTime: string;
  deliveryAddress?: string;
}

export function OrderAhead() {
  const [step, setStep] = useState<"details" | "menu" | "checkout">("details");
  const [formData, setFormData] = useState<OrderAheadFormData>({
    customerName: "",
    customerPhone: "",
    orderType: "takeout",
    scheduledTime: "",
    deliveryAddress: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate time slots (next 2 hours to next 8 hours)
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const startTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    
    for (let i = 0; i < 24; i++) { // Next 24 hours of slots
      const time = new Date(startTime.getTime() + i * 30 * 60 * 1000); // 30-minute intervals
      const timeString = time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      const dateString = time.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
      });
      const isoString = time.toISOString();
      
      slots.push({
        value: isoString,
        label: `${timeString} (${dateString})`,
        time: time
      });
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Submit order ahead mutation
  const submitOrderAhead = useMutation({
    mutationFn: async (orderData: any) => {
      const orderEvent: Omit<OrderEvent, 'timestamp'> = {
        type: "order",
        table: 0, // Table 0 for takeout/delivery
        items: orderData.items,
        paymentMode: orderData.paymentMode,
        orderType: formData.orderType === "takeout" ? "takeout" : "order-ahead",
        scheduledTime: formData.scheduledTime,
        status: "pending",
        totalAmount: orderData.totalAmount,
        loyaltyPointsEarned: Math.floor(orderData.totalAmount / 10),
      };

      await addDoc(collection(db, "events"), {
        ...orderEvent,
        timestamp: serverTimestamp(),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
      });
    },
    onSuccess: () => {
      toast({
        title: "Order Scheduled!",
        description: `Your ${formData.orderType} order has been scheduled successfully.`,
      });
      setStep("details");
      setFormData({
        customerName: "",
        customerPhone: "",
        orderType: "takeout",
        scheduledTime: "",
        deliveryAddress: "",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
    onError: () => {
      toast({
        title: "Order Failed",
        description: "Unable to schedule your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone || !formData.scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.orderType === "delivery" && !formData.deliveryAddress) {
      toast({
        title: "Missing Address",
        description: "Please provide a delivery address.",
        variant: "destructive",
      });
      return;
    }

    setStep("menu");
  };

  const getSelectedTimeInfo = () => {
    if (!formData.scheduledTime) return null;
    
    const selectedTime = new Date(formData.scheduledTime);
    const now = new Date();
    const diffMinutes = Math.floor((selectedTime.getTime() - now.getTime()) / (1000 * 60));
    
    return {
      time: selectedTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      date: selectedTime.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }),
      minutesFromNow: diffMinutes
    };
  };

  const timeInfo = getSelectedTimeInfo();

  if (step === "details") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Order Ahead
            </CardTitle>
            <CardDescription>
              Schedule your order for pickup or delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Full Name</Label>
                  <Input
                    id="customer-name"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer-phone">Phone Number</Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Order Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={formData.orderType === "takeout" ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, orderType: "takeout" }))}
                    className="justify-start"
                  >
                    <Car className="h-4 w-4 mr-2" />
                    Takeout
                  </Button>
                  <Button
                    type="button"
                    variant={formData.orderType === "delivery" ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, orderType: "delivery" }))}
                    className="justify-start"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Delivery
                  </Button>
                </div>
              </div>

              {formData.orderType === "delivery" && (
                <div className="space-y-2">
                  <Label htmlFor="delivery-address">Delivery Address</Label>
                  <Input
                    id="delivery-address"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    placeholder="Enter your complete delivery address"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="scheduled-time">
                  {formData.orderType === "takeout" ? "Pickup Time" : "Delivery Time"}
                </Label>
                <Select 
                  value={formData.scheduledTime} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, scheduledTime: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {timeInfo && (
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Scheduled for: {timeInfo.date} at {timeInfo.time}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {timeInfo.minutesFromNow} minutes from now
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full">
                Continue to Menu
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "menu") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Select Your Items
            </CardTitle>
            <CardDescription>
              Order scheduled for {timeInfo?.date} at {timeInfo?.time}
              {formData.orderType === "delivery" ? ` • Delivery to: ${formData.deliveryAddress}` : " • Takeout"}
            </CardDescription>
          </CardHeader>
        </Card>

        <FoodMenu />
        
        <Cart 
          cart={[]}
          setCart={() => {}}
          tableNumber={0}
          onOrderPlaced={() => {
            // This will be handled by the form submission
          }}
        />

        <Button
          onClick={() => setStep("details")}
          variant="outline"
          className="w-full"
        >
          Back to Details
        </Button>
      </div>
    );
  }

  return null;
}
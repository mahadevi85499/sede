import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Minus, Plus, X, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Removed import of MENU_ITEMS - will use API data instead
import type { MenuItem, InsertOrderEvent } from "@shared/schema";

interface CartProps {
  cart: MenuItem[];
  setCart: (cart: MenuItem[]) => void;
  tableNumber: number;
  onOrderPlaced?: () => void;
  menuItems?: any[]; // Add menuItems prop to access real menu data
}

export default function Cart({ cart, setCart, tableNumber, onOrderPlaced, menuItems = [] }: CartProps) {
  const [paymentMode, setPaymentMode] = useState<"upi" | "cash">("cash");
  const [packFullOrder, setPackFullOrder] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(itemId);
      return;
    }

    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeItem = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const toggleItemPack = (itemId: string) => {
    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, pack: !item.pack }
        : item
    ));
  };

  const handlePackFullOrder = (checked: boolean) => {
    setPackFullOrder(checked);
    setCart(cart.map(item => ({ ...item, pack: checked })));
  };

  const getItemPrice = (itemId: string): number => {
    const menuItem = menuItems.find(item => item.id === itemId);
    return menuItem?.price || 0;
  };

  const getItemName = (itemId: string): string => {
    const menuItem = menuItems.find(item => item.id === itemId);
    return menuItem?.name || "Unknown Item";
  };

  const calculateTotal = (): number => {
    return cart.reduce((total, item) => {
      const itemPrice = getItemPrice(item.id);
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to place order");
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      // Clear cart after successful order
      setCart([]);
      setPackFullOrder(false);
      
      toast({
        title: "Order placed successfully!",
        description: `Your order #${data.id.slice(-6)} has been sent to the kitchen. ${paymentMode === 'cash' ? 'Please have cash ready for the waiter.' : 'Please have your UPI/card ready for payment.'}`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      // Call the onOrderPlaced callback if provided
      if (onOrderPlaced) {
        onOrderPlaced();
      }
    },
    onError: (error: any) => {
      console.error("Error placing order:", error);
      toast({
        title: "Error placing order",
        description: `Failed to submit order: ${error?.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive"
      });
      return;
    }

    const orderData = {
      table: tableNumber,
      items: cart.map(item => ({
        id: item.id,
        name: getItemName(item.id),
        quantity: item.quantity,
        price: getItemPrice(item.id),
        pack: item.pack
      })),
      paymentMode,
      orderType: "dine-in",
      status: "pending",
      loyaltyPointsEarned: Math.floor(total * 0.1),
      totalAmount: total,
    };

    createOrderMutation.mutate(orderData);
  };

  const total = calculateTotal();

  return (
    <div className="space-y-4">
      {cart.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Your cart is empty</p>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-3 mb-4">
            {cart.map((item) => {
              const itemPrice = getItemPrice(item.id);
              return (
                <div key={item.id} className="bg-primary-dark rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{getItemName(item.id)}</h4>
                      <p className="text-accent-orange font-semibold text-sm">₹{itemPrice}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`pack-${item.id}`}
                        checked={item.pack}
                        onCheckedChange={() => toggleItemPack(item.id)}
                        className="data-[state=checked]:bg-accent-orange"
                      />
                      <Label htmlFor={`pack-${item.id}`} className="text-xs">Pack</Label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pack All Option */}
          <div className="bg-primary-dark rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pack-all"
                checked={packFullOrder}
                onCheckedChange={handlePackFullOrder}
                className="data-[state=checked]:bg-accent-orange"
              />
              <Label htmlFor="pack-all" className="text-sm">Pack entire order for takeaway</Label>
            </div>
          </div>

          {/* Payment Mode */}
          <div className="bg-primary-dark rounded-lg p-3">
            <Label className="text-sm font-medium mb-3 block">Payment Method</Label>
            <RadioGroup
              value={paymentMode}
              onValueChange={(value: "upi" | "cash") => setPaymentMode(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="text-sm flex items-center space-x-2">
                  <Banknote size={16} />
                  <span>Cash (Pay when waiter arrives)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="text-sm flex items-center space-x-2">
                  <CreditCard size={16} />
                  <span>UPI/Card (Pay when waiter arrives)</span>
                </Label>
              </div>
            </RadioGroup>
            <div className="mt-2 p-2 bg-secondary-dark rounded text-xs text-gray-400">
              <strong>Note:</strong> All payments are made directly to the waiter when they serve your order. No advance payment required.
            </div>
          </div>

          {/* Total and Place Order */}
          <div className="bg-primary-dark rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Total:</span>
              <span className="text-accent-orange font-bold text-lg">₹{total}</span>
            </div>
            <Button
              onClick={placeOrder}
              className="w-full bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold py-3"
            >
              Place Order
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
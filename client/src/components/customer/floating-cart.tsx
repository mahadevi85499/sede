import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus, X, CreditCard, Banknote, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MENU_ITEMS } from "@shared/schema";
import type { MenuItem, InsertOrderEvent } from "@shared/schema";

interface FloatingCartProps {
  cart: MenuItem[];
  setCart: (cart: MenuItem[]) => void;
  tableNumber: number;
}

export default function FloatingCart({ cart, setCart, tableNumber }: FloatingCartProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"upi" | "cash">("cash");
  const [packFullOrder, setPackFullOrder] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { toast } = useToast();

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
    const menuItem = MENU_ITEMS.find(item => item.id === itemId);
    return menuItem?.price || 0;
  };

  const calculateTotal = (): number => {
    return cart.reduce((total, item) => {
      const itemPrice = getItemPrice(item.id);
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const getTotalItems = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive"
      });
      return;
    }

    setIsOrdering(true);

    try {
      const order: InsertOrderEvent = {
        type: "order",
        table: tableNumber,
        items: cart,
        paymentMode,
        timestamp: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "events"), order);
      
      // Clear cart after successful order
      setCart([]);
      setPackFullOrder(false);
      setIsCartOpen(false);
      setShowPaymentDialog(true);
      
      toast({
        title: "Order placed successfully!",
        description: `Your order #${docRef.id.slice(-6)} has been sent to the kitchen.`,
      });
    } catch (error) {
      console.error("Error placing order:", error);
      
      toast({
        title: "Error placing order",
        description: "Failed to submit order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const total = calculateTotal();
  const totalItems = getTotalItems();

  if (cart.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsCartOpen(true)}
          className="bg-accent-orange hover:bg-accent-orange/90 rounded-full w-16 h-16 shadow-lg relative"
        >
          <ShoppingCart size={24} />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </Badge>
          )}
        </Button>
      </div>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="bg-secondary-dark border-gray-700 max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Your Order</span>
              <span className="text-accent-orange">₹{total}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Cart Items */}
            <div className="space-y-3">
              {cart.map((item) => {
                const itemPrice = getItemPrice(item.id);
                return (
                  <div key={item.id} className="bg-primary-dark rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
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
                    <span>Cash (Pay to waiter)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="text-sm flex items-center space-x-2">
                    <CreditCard size={16} />
                    <span>UPI/Card (Pay to waiter)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Place Order Button */}
          <div className="border-t border-gray-700 pt-4 mt-4">
            <Button
              onClick={placeOrder}
              disabled={isOrdering}
              className="w-full bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold py-3"
            >
              {isOrdering ? "Placing Order..." : `Place Order - ₹${total}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Instructions Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-secondary-dark border-gray-700 max-w-sm">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Order Confirmed!</h3>
              <p className="text-gray-400 text-sm mb-4">
                Your order has been sent to the kitchen and will be prepared shortly.
              </p>
            </div>
            <div className="bg-primary-dark rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Payment Instructions:</h4>
              <p className="text-xs text-gray-400">
                {paymentMode === "cash" 
                  ? "Please have cash ready. Our waiter will collect payment when serving your order."
                  : "Please have your UPI app or card ready. Our waiter will assist with payment when serving your order."
                }
              </p>
            </div>
            <Button
              onClick={() => setShowPaymentDialog(false)}
              className="w-full bg-accent-orange hover:bg-accent-orange/90"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
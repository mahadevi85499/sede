import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Utensils, ShoppingCart, HelpCircle, Calendar, Gift, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodMenu from "@/components/customer/food-menu";
import Cart from "@/components/customer/cart";
import ServiceRequests from "@/components/customer/service-requests";
import { Reservations } from "@/components/customer/reservations";
import { LoyaltyRewards } from "@/components/customer/loyalty-rewards";
import { OrderAhead } from "@/components/customer/order-ahead";
import type { MenuItem } from "@shared/schema";

export default function CustomerPanel() {
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showService, setShowService] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");

  useEffect(() => {
    // Get table number from URL path (e.g., /5 for table 5)
    const path = window.location.pathname;
    const tableMatch = path.match(/^\/(\d+)$/);
    
    if (tableMatch) {
      const tableNum = parseInt(tableMatch[1], 10);
      setTableNumber(tableNum);
    } else if (path === '/customer') {
      setShowTableSelector(true);
    } else {
      // Get table number from URL query parameter for backward compatibility
      const urlParams = new URLSearchParams(window.location.search);
      const table = urlParams.get('table');
      if (table) {
        setTableNumber(parseInt(table, 10));
      } else {
        setShowTableSelector(true);
      }
    }
  }, []);

  const handleTableSelect = (table: number) => {
    setTableNumber(table);
    setShowTableSelector(false);
    // Navigate to table-specific URL
    window.history.replaceState({}, '', `/${table}`);
  };

  if (showTableSelector || tableNumber === null) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center p-4">
        <Card className="bg-secondary-dark border-gray-700 w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Select Your Table</h2>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map((table) => (
                <Button
                  key={table}
                  variant="outline"
                  size="sm"
                  className="aspect-square bg-primary-dark border-gray-600 hover:border-accent-orange"
                  onClick={() => handleTableSelect(table)}
                >
                  {table}
                </Button>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Other table"
                className="bg-primary-dark border-gray-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt((e.target as HTMLInputElement).value);
                    if (val > 0) handleTableSelect(val);
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <header className="bg-secondary-dark p-3 md:p-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent-orange rounded-lg flex items-center justify-center">
                <Utensils className="text-white" size={16} />
              </div>
              <h1 className="text-lg md:text-xl font-bold">Table {tableNumber}</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTableSelector(true)}
              className="text-gray-400 hover:text-white text-xs md:text-sm"
            >
              Change Table
            </Button>
            <div className="text-right hidden sm:block">
              <p className="text-gray-400 text-sm">Welcome Guest</p>
              <p className="text-accent-orange font-semibold text-sm">Ready to Order</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 md:px-4 py-4 pb-32">
        <FoodMenu cart={cart} setCart={setCart} />
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setShowCart(true)}
            className="bg-accent-orange hover:bg-accent-orange/90 rounded-full w-16 h-16 shadow-lg relative"
          >
            <ShoppingCart size={24} />
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </Badge>
          </Button>
        </div>
      )}

      {/* Floating Help Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setShowService(true)}
          className="bg-blue-600 hover:bg-blue-700 rounded-full w-16 h-16 shadow-lg"
        >
          <HelpCircle size={24} />
        </Button>
      </div>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="bg-secondary-dark border-gray-700 max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Your Order</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Cart 
              cart={cart} 
              setCart={setCart} 
              tableNumber={tableNumber || 1}
              onOrderPlaced={() => setShowCart(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Requests Dialog */}
      <Dialog open={showService} onOpenChange={setShowService}>
        <DialogContent className="bg-secondary-dark border-gray-700 max-w-sm">
          <DialogHeader>
            <DialogTitle>Need Help?</DialogTitle>
          </DialogHeader>
          <ServiceRequests 
            tableNumber={tableNumber || 1}
            onRequestSent={() => setShowService(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

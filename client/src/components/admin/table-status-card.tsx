import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MENU_ITEMS } from "@shared/schema";
import type { OrderEvent } from "@shared/schema";

interface OrderWithId extends OrderEvent {
  id: string;
}

interface TableStatusCardProps {
  order: OrderWithId;
}

export default function TableStatusCard({ order }: TableStatusCardProps) {
  const getItemPrice = (itemId: string): number => {
    const menuItem = MENU_ITEMS.find(item => item.id === itemId);
    return menuItem?.price || 0;
  };

  const calculateTotal = (): number => {
    return order.items.reduce((total, item) => {
      const itemPrice = getItemPrice(item.id);
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const getTimeAgo = (): string => {
    // For now, returning a static value since we don't have timestamp parsing
    return "5 min ago";
  };

  return (
    <Card className="bg-secondary-dark border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-accent-orange rounded-full flex items-center justify-center">
              <span className="font-bold text-white text-lg">{order.table}</span>
            </div>
            <div>
              <h3 className="font-bold">Table {order.table}</h3>
              <p className="text-gray-400 text-sm">2 guests</p>
            </div>
          </div>
          <Badge className="bg-warning-yellow text-black text-xs">Waiting</Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="text-sm">
            <span className="text-gray-400">Items:</span>
            <span className="ml-2">{order.items.length} items</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Total:</span>
            <span className="ml-2 text-accent-orange font-bold">₹{calculateTotal()}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Ordered:</span>
            <span className="ml-2">{getTimeAgo()}</span>
          </div>
        </div>

        <Button className="w-full bg-success-green hover:bg-green-600 text-white font-medium py-2">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

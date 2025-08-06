import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MENU_ITEMS } from "@shared/schema";
import type { OrderEvent } from "@shared/schema";

interface OrderWithId extends OrderEvent {
  id: string;
}

interface OrderCardProps {
  order: OrderWithId;
}

export default function OrderCard({ order }: OrderCardProps) {
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
    return "2 minutes ago";
  };

  return (
    <Card className="bg-secondary-dark border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent-orange rounded-full flex items-center justify-center">
              <span className="font-bold text-white">{order.table}</span>
            </div>
            <div>
              <h3 className="font-bold">Table {order.table}</h3>
              <p className="text-gray-400 text-sm">{getTimeAgo()}</p>
            </div>
          </div>
          <Badge className="bg-warning-yellow text-black">Waiting</Badge>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Order Items:</h4>
          <ul className="space-y-1">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>
                  {item.quantity}x {item.name}
                  {item.pack && <span className="text-accent-orange"> (Pack)</span>}
                </span>
                <span className="text-gray-400">
                  ₹{getItemPrice(item.id) * item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-400">Payment: </span>
            <span className="text-accent-orange font-medium capitalize">
              {order.paymentMode}
            </span>
          </div>
          <Button className="bg-success-green hover:bg-green-600 text-white px-4 py-2 text-sm font-medium">
            Mark Ready
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

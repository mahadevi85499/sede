import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface OrderCardProps {
  order: any; // Using any for now since the order structure from API is different
}

export default function OrderCard({ order }: OrderCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getTimeAgo = (): string => {
    if (!order.createdAt) return "Just now";
    const created = new Date(order.createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ${diffMinutes % 60}m ago`;
  };

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update order");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order updated",
        description: `Order status changed successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  });

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
          <Badge className={`${order.status === 'pending' ? 'bg-warning-yellow text-black' : 'bg-blue-500 text-white'}`}>
            {order.status === 'pending' ? 'Waiting' : 'Preparing'}
          </Badge>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Order Items:</h4>
          <ul className="space-y-1">
            {order.items.map((item: any, index: number) => (
              <li key={index} className="flex justify-between">
                <span>
                  {item.quantity}x {item.name}
                  {item.pack && " (Pack)"}
                </span>
                <span className="text-accent-orange">₹{item.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Amount</p>
            <p className="font-bold text-lg text-accent-orange">₹{order.totalAmount}</p>
            <p className="text-xs text-gray-500">Payment: {order.paymentMode?.toUpperCase()}</p>
          </div>
          <div className="flex gap-2">
            {order.status === 'pending' && (
              <Button 
                onClick={() => updateOrderMutation.mutate('preparing')}
                disabled={updateOrderMutation.isPending}
                className="bg-success-green hover:bg-success-green/90"
              >
                Start Preparing
              </Button>
            )}
            {order.status === 'preparing' && (
              <Button 
                onClick={() => updateOrderMutation.mutate('ready')}
                disabled={updateOrderMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Mark Ready
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

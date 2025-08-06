import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { BillingRequestEvent } from "@shared/schema";

interface BillingRequestWithId extends BillingRequestEvent {
  id: string;
}

interface BillingTableProps {
  requests: BillingRequestWithId[];
}

export default function BillingTable({ requests }: BillingTableProps) {
  const { toast } = useToast();

  const printBill = (tableNumber: number) => {
    toast({
      title: "Printing bill",
      description: `Printing bill for Table ${tableNumber}...`,
    });
  };

  const markAsPaid = async (request: BillingRequestWithId) => {
    try {
      await deleteDoc(doc(db, "events", request.id));
      toast({
        title: "Payment processed",
        description: `Table ${request.table} has been marked as paid.`,
      });
    } catch (error) {
      console.error("Error marking as paid:", error);
      toast({
        title: "Error",
        description: "Failed to mark as paid. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTimeAgo = (): string => {
    // For now, returning a static value since we don't have timestamp parsing
    return "2 min ago";
  };

  if (requests.length === 0) {
    return (
      <Card className="bg-secondary-dark border-gray-700">
        <CardContent className="p-8 text-center text-gray-400">
          No billing requests pending
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary-dark border-gray-700">
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-medium">Table</th>
                <th className="text-left py-3 px-4 font-medium">Request Time</th>
                <th className="text-left py-3 px-4 font-medium">Order Total</th>
                <th className="text-left py-3 px-4 font-medium">Payment Method</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b border-gray-700">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-accent-orange rounded-full flex items-center justify-center">
                        <span className="font-bold text-white text-sm">{request.table}</span>
                      </div>
                      <span className="font-medium">Table {request.table}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-400">{getTimeAgo()}</td>
                  <td className="py-4 px-4 font-bold text-accent-orange">₹740</td>
                  <td className="py-4 px-4">
                    <Badge className="bg-blue-500 text-white text-xs">UPI</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <Button
                        className="bg-accent-orange hover:bg-orange-600 text-white px-3 py-1 text-sm h-8"
                        onClick={() => printBill(request.table)}
                      >
                        Print Bill
                      </Button>
                      <Button
                        className="bg-success-green hover:bg-green-600 text-white px-3 py-1 text-sm h-8"
                        onClick={() => markAsPaid(request)}
                      >
                        Mark Paid
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

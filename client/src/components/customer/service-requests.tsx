import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Droplets, Flame, Fan, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { InsertServiceRequestEvent, InsertBillingRequestEvent } from "@shared/schema";

interface ServiceRequestsProps {
  tableNumber: number;
  onRequestSent?: () => void;
}

export default function ServiceRequests({ tableNumber, onRequestSent }: ServiceRequestsProps) {
  const { toast } = useToast();

  const sendServiceRequest = async (requestType: "staff" | "water" | "hot-water" | "cleaning") => {
    try {
      const request: InsertServiceRequestEvent = {
        type: "service-request",
        table: tableNumber,
        request: requestType,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, "events"), request);
      
      toast({
        title: "Request sent!",
        description: `Your ${requestType.replace('-', ' ')} request has been sent to staff.`,
      });

      // Call the onRequestSent callback if provided
      if (onRequestSent) {
        setTimeout(() => onRequestSent(), 1500); // Delay to show toast
      }
    } catch (error) {
      console.error("Error sending request:", error);
      toast({
        title: "Error sending request",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const requestBill = async () => {
    try {
      const request: InsertBillingRequestEvent = {
        type: "billing-request",
        table: tableNumber,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, "events"), request);
      
      toast({
        title: "Bill requested!",
        description: "Your bill request has been sent to staff.",
      });

      // Call the onRequestSent callback if provided
      if (onRequestSent) {
        setTimeout(() => onRequestSent(), 1500); // Delay to show toast
      }
    } catch (error) {
      console.error("Error requesting bill:", error);
      toast({
        title: "Error requesting bill",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-secondary-dark border-gray-700">
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Need Help?</h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button
            variant="ghost"
            className="bg-primary-dark hover:bg-gray-700 h-auto p-2 sm:p-3 flex flex-col items-center space-y-1 border border-gray-700"
            onClick={() => sendServiceRequest("staff")}
          >
            <UserCheck className="text-accent-orange" size={16} />
            <span className="text-xs sm:text-sm">Call Staff</span>
          </Button>
          
          <Button
            variant="ghost"
            className="bg-primary-dark hover:bg-gray-700 h-auto p-2 sm:p-3 flex flex-col items-center space-y-1 border border-gray-700"
            onClick={() => sendServiceRequest("water")}
          >
            <Droplets className="text-blue-400" size={16} />
            <span className="text-xs sm:text-sm">Water</span>
          </Button>
          
          <Button
            variant="ghost"
            className="bg-primary-dark hover:bg-gray-700 h-auto p-2 sm:p-3 flex flex-col items-center space-y-1 border border-gray-700"
            onClick={() => sendServiceRequest("cleaning")}
          >
            <Fan className="text-green-400" size={16} />
            <span className="text-xs sm:text-sm">Cleaning</span>
          </Button>
          
          <Button
            variant="ghost"
            className="bg-primary-dark hover:bg-gray-700 h-auto p-2 sm:p-3 flex flex-col items-center space-y-1 border border-gray-700"
            onClick={requestBill}
          >
            <Receipt className="text-warning-yellow" size={16} />
            <span className="text-xs sm:text-sm">Get Bill</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

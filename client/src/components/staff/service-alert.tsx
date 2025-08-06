import { useState, useEffect } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ServiceRequestEvent } from "@shared/schema";

interface ServiceRequestWithId extends ServiceRequestEvent {
  id: string;
}

interface ServiceAlertProps {
  request: ServiceRequestWithId;
}

export default function ServiceAlert({ request }: ServiceAlertProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDone = async () => {
    try {
      await deleteDoc(doc(db, "events", request.id));
      toast({
        title: "Request completed",
        description: `${request.request} request for Table ${request.table} has been marked as done.`,
      });
    } catch (error) {
      console.error("Error marking request as done:", error);
      toast({
        title: "Error",
        description: "Failed to mark request as done. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getRequestDisplay = (requestType: string): string => {
    switch (requestType) {
      case "staff":
        return "Staff Call";
      case "water":
        return "Water";
      case "hot-water":
        return "Hot Water";
      case "cleaning":
        return "Cleaning";
      default:
        return requestType;
    }
  };

  const getBorderColor = (requestType: string): string => {
    switch (requestType) {
      case "staff":
        return "border-accent-orange";
      case "water":
      case "hot-water":
        return "border-blue-500";
      case "cleaning":
        return "border-green-500";
      default:
        return "border-warning-yellow";
    }
  };

  const getIconColor = (requestType: string): string => {
    switch (requestType) {
      case "staff":
        return "bg-accent-orange";
      case "water":
      case "hot-water":
        return "bg-blue-500";
      case "cleaning":
        return "bg-green-500";
      default:
        return "bg-warning-yellow";
    }
  };

  return (
    <Card className={`bg-secondary-dark ${getBorderColor(request.request)}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${getIconColor(request.request)} rounded-full flex items-center justify-center`}>
              <span className="font-bold text-white">{request.table}</span>
            </div>
            <div>
              <h3 className="font-bold">Table {request.table}</h3>
              <p className="font-medium text-warning-yellow">
                Needs {getRequestDisplay(request.request)}
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-yellow">{timeLeft}</div>
            <div className="text-xs text-gray-400">seconds</div>
          </div>
        </div>
        
        <Button 
          className="w-full bg-success-green hover:bg-green-600 text-white font-semibold py-2"
          onClick={handleDone}
        >
          Mark as Done
        </Button>
      </CardContent>
    </Card>
  );
}

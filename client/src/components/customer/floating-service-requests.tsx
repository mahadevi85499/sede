import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserCheck, Droplets, Flame, Receipt, HelpCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { InsertServiceRequestEvent, InsertBillingRequestEvent } from "@shared/schema";

interface FloatingServiceRequestsProps {
  tableNumber: number;
}

export default function FloatingServiceRequests({ tableNumber }: FloatingServiceRequestsProps) {
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
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
      
      const requestNames = {
        "staff": "Staff assistance",
        "water": "Water",
        "hot-water": "Hot water",
        "cleaning": "Table cleaning"
      };

      setConfirmationMessage(`${requestNames[requestType]} request sent! Our staff will assist you shortly.`);
      setShowConfirmation(true);
      setIsServiceOpen(false);
      
      toast({
        title: "Request sent!",
        description: `Your ${requestType.replace('-', ' ')} request has been sent to staff.`,
      });
    } catch (error) {
      console.error("Error sending request:", error);
      toast({
        title: "Error sending request",
        description: "Please try again or call staff directly.",
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
      
      setConfirmationMessage("Bill request sent! Our staff will bring your bill shortly.");
      setShowConfirmation(true);
      setIsServiceOpen(false);
      
      toast({
        title: "Bill requested!",
        description: "Your bill request has been sent to staff.",
      });
    } catch (error) {
      console.error("Error requesting bill:", error);
      toast({
        title: "Error requesting bill",
        description: "Please try again or call staff directly.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {/* Floating Help Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsServiceOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 rounded-full w-16 h-16 shadow-lg"
        >
          <HelpCircle size={24} />
        </Button>
      </div>

      {/* Service Requests Dialog */}
      <Dialog open={isServiceOpen} onOpenChange={setIsServiceOpen}>
        <DialogContent className="bg-secondary-dark border-gray-700 max-w-sm">
          <DialogHeader>
            <DialogTitle>Need Help?</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="bg-primary-dark hover:bg-gray-700 h-20 flex flex-col items-center space-y-2 border-gray-700"
              onClick={() => sendServiceRequest("staff")}
            >
              <UserCheck className="text-accent-orange" size={20} />
              <span className="text-xs">Call Staff</span>
            </Button>
            
            <Button
              variant="outline"
              className="bg-primary-dark hover:bg-gray-700 h-20 flex flex-col items-center space-y-2 border-gray-700"
              onClick={() => sendServiceRequest("water")}
            >
              <Droplets className="text-blue-400" size={20} />
              <span className="text-xs">Water</span>
            </Button>
            
            <Button
              variant="outline"
              className="bg-primary-dark hover:bg-gray-700 h-20 flex flex-col items-center space-y-2 border-gray-700"
              onClick={() => sendServiceRequest("hot-water")}
            >
              <Flame className="text-red-400" size={20} />
              <span className="text-xs">Hot Water</span>
            </Button>
            
            <Button
              variant="outline"
              className="bg-primary-dark hover:bg-gray-700 h-20 flex flex-col items-center space-y-2 border-gray-700"
              onClick={() => sendServiceRequest("cleaning")}
            >
              <UserCheck className="text-green-400" size={20} />
              <span className="text-xs">Cleaning</span>
            </Button>
          </div>

          <Button
            onClick={requestBill}
            className="w-full bg-accent-orange hover:bg-accent-orange/90 mt-4"
          >
            <Receipt className="mr-2" size={16} />
            Request Bill
          </Button>

          <div className="mt-4 p-3 bg-primary-dark rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              <strong>Need immediate assistance?</strong><br />
              Please raise your hand or approach any staff member directly.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-secondary-dark border-gray-700 max-w-sm">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Request Sent!</h3>
              <p className="text-gray-400 text-sm">
                {confirmationMessage}
              </p>
            </div>
            <Button
              onClick={() => setShowConfirmation(false)}
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
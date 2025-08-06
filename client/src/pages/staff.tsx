import { useState, useEffect } from "react";
import { Link } from "wouter";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderCard from "@/components/staff/order-card";
import ServiceAlert from "@/components/staff/service-alert";
import type { OrderEvent, ServiceRequestEvent } from "@shared/schema";

interface OrderWithId extends OrderEvent {
  id: string;
}

interface ServiceRequestWithId extends ServiceRequestEvent {
  id: string;
}

export default function StaffPanel() {
  const [orders, setOrders] = useState<OrderWithId[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestWithId[]>([]);

  useEffect(() => {
    // Set up real-time listener for orders and service requests
    const q = query(
      collection(db, "events"),
      where("type", "in", ["order", "service-request"]),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData: OrderWithId[] = [];
      const requestsData: ServiceRequestWithId[] = [];

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.type === "order") {
          ordersData.push({ ...data, id: doc.id } as OrderWithId);
        } else if (data.type === "service-request") {
          requestsData.push({ ...data, id: doc.id } as ServiceRequestWithId);
        }
      });

      setOrders(ordersData);
      setServiceRequests(requestsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-primary-dark">
      <header className="bg-secondary-dark p-3 sm:p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-success-green rounded-lg flex items-center justify-center">
                <ClipboardList className="text-white" size={14} />
              </div>
              <h1 className="text-lg sm:text-xl font-bold">Staff Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-center">
              <p className="text-gray-400 text-xs sm:text-sm">Orders</p>
              <p className="text-success-green font-bold text-lg sm:text-xl">{orders.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs sm:text-sm">Requests</p>
              <p className="text-warning-yellow font-bold text-lg sm:text-xl">{serviceRequests.length}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Orders Column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">New Orders</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
                <span className="text-success-green text-sm">Live</span>
              </div>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-secondary-dark rounded-xl p-6 text-center text-gray-400">
                  No active orders
                </div>
              ) : (
                orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </div>

          {/* Service Requests Column */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Service Alerts</h2>
            
            <div className="space-y-4">
              {serviceRequests.length === 0 ? (
                <div className="bg-secondary-dark rounded-xl p-6 text-center text-gray-400">
                  No pending requests
                </div>
              ) : (
                serviceRequests.map((request) => (
                  <ServiceAlert key={request.id} request={request} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

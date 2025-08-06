import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderCard from "@/components/staff/order-card";
import ServiceAlert from "@/components/staff/service-alert";

export default function StaffPanel() {
  // Fetch orders from Express API with auto-refresh
  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ['/api/orders'],
    refetchInterval: 3000, // Refresh every 3 seconds
    staleTime: 0,
  });

  // Filter only pending and preparing orders for staff
  const activeOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'preparing'
  );

  // Fetch service requests (placeholder for now)
  const { data: serviceRequests = [] } = useQuery<any[]>({
    queryKey: ['/api/service-requests'],
    refetchInterval: 5000,
    retry: false, // Don't retry if endpoint doesn't exist yet
  });

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
              <p className="text-success-green font-bold text-lg sm:text-xl">{activeOrders.length}</p>
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
              {ordersLoading ? (
                <div className="bg-secondary-dark rounded-xl p-6 text-center text-gray-400">
                  <p>Loading orders...</p>
                </div>
              ) : activeOrders.length === 0 ? (
                <div className="bg-secondary-dark rounded-xl p-6 text-center text-gray-400">
                  <h3 className="text-lg font-medium mb-2">No active orders</h3>
                  <p className="text-sm">New orders will appear here automatically</p>
                </div>
              ) : (
                activeOrders.map((order) => (
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

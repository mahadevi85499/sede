import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Clock,
  TrendingUp,
  Plus,
  Table,
  BarChart3,
  Settings
} from "lucide-react";
import type { OrderEvent } from "@shared/schema";
import AddItemModal from "@/components/admin/add-item-modal";
import TableManagementModal from "@/components/admin/table-management-modal";
import ReportsModal from "@/components/admin/reports-modal";
import SettingsModal from "@/components/admin/settings-modal";

interface OrderWithId extends OrderEvent {
  id: string;
}

export default function DashboardPage() {
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Fetch orders from API
  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
  });

  // Fetch menu items from API
  const { data: menuItems = [] } = useQuery({
    queryKey: ['/api/menu'],
  });

  const todayOrders = orders;

  const todayRevenue = todayOrders.reduce((total, order) => {
    return total + order.items.reduce((orderTotal, item) => {
      const itemPrice = getItemPrice(item.id);
      return orderTotal + (itemPrice * item.quantity);
    }, 0);
  }, 0);

  const activeTables = new Set(todayOrders.map(order => order.table)).size;

  function getItemPrice(itemId: string): number {
    const prices: Record<string, number> = {
      'paneer-tikka': 280,
      'veg-samosa': 120,
      'chicken-seekh': 320,
      'garden-salad': 180,
    };
    return prices[itemId] || 0;
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-gray-400 text-sm sm:text-base">Real-time restaurant management analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-secondary-dark border-gray-700">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Today's Orders</p>
                <p className="text-lg sm:text-2xl font-bold text-accent-orange">{todayOrders.length}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-accent-orange rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-white" size={16} />
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Real-time data</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary-dark border-gray-700">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Revenue</p>
                <p className="text-lg sm:text-2xl font-bold text-success-green">₹{todayRevenue.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-success-green rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={16} />
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Real-time data</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary-dark border-gray-700">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Active Tables</p>
                <p className="text-lg sm:text-2xl font-bold text-warning-yellow">{activeTables}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-warning-yellow rounded-lg flex items-center justify-center">
                <Users className="text-black" size={16} />
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">tables in use</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary-dark border-gray-700">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Avg Order Time</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-400">{Math.round(todayOrders.length > 0 ? todayOrders.reduce((sum: number, order: any) => sum + (order.items?.length || 0), 0) / todayOrders.length * 15 : 0) || '--'}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Clock className="text-white" size={16} />
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">minutes avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="bg-secondary-dark border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold">Recent Orders</h3>
                <Button variant="ghost" className="text-accent-orange hover:text-orange-400 text-xs sm:text-sm font-medium">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {todayOrders.slice(-3).reverse().map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-primary-dark rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent-orange rounded-full flex items-center justify-center">
                        <span className="font-bold text-white">{order.tableNumber || order.table}</span>
                      </div>
                      <div>
                        <p className="font-medium">Table {order.tableNumber || order.table} - ₹{order.totalAmount || 0}</p>
                        <p className="text-gray-400 text-sm">{order.items?.length || 0} items • {order.status}</p>
                      </div>
                    </div>
                    <Badge className="bg-success-green text-white">{order.status || 'pending'}</Badge>
                  </div>
                ))}
                
                {todayOrders.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    No orders yet today
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="bg-secondary-dark border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Quick Actions</h3>
              <div className="space-y-3 sm:space-y-4">
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-primary-dark hover:bg-gray-700 rounded-lg h-auto"
                  onClick={() => setShowAddItemModal(true)}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Plus className="text-accent-orange" size={14} />
                    <span className="text-sm sm:text-base">Add New Item</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-primary-dark hover:bg-gray-700 rounded-lg h-auto"
                  onClick={() => setShowTableModal(true)}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Table className="text-success-green" size={14} />
                    <span className="text-sm sm:text-base">Manage Tables</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-primary-dark hover:bg-gray-700 rounded-lg h-auto"
                  onClick={() => setShowReportsModal(true)}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <BarChart3 className="text-warning-yellow" size={14} />
                    <span className="text-sm sm:text-base">View Reports</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-primary-dark hover:bg-gray-700 rounded-lg h-auto"
                  onClick={() => setShowSettingsModal(true)}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Settings className="text-blue-400" size={14} />
                    <span className="text-sm sm:text-base">Settings</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Menu Items Section */}
      <div className="mt-6 sm:mt-8">
        <Card className="bg-secondary-dark border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold">Menu Items ({menuItems.length})</h3>
              <Button 
                onClick={() => setShowAddItemModal(true)}
                className="bg-accent-orange hover:bg-orange-400 text-white text-xs sm:text-sm"
              >
                <Plus size={16} className="mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item: any) => (
                <div key={item.id} className="bg-primary-dark p-4 rounded-lg border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover ml-3 flex-shrink-0"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-success-green font-bold text-sm">₹{item.price}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${item.inStock ? 'border-success-green text-success-green' : 'border-red-500 text-red-500'}`}
                      >
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      {item.isVegetarian && (
                        <div className="w-4 h-4 border border-success-green rounded-sm flex items-center justify-center">
                          <div className="w-2 h-2 bg-success-green rounded-full"></div>
                        </div>
                      )}
                      {item.isSpicy && (
                        <span className="text-red-500 text-xs">🌶️</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Category: {item.category}</span>
                      <span>{item.preparationTime}min</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {menuItems.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-8">
                  <p>No menu items yet</p>
                  <Button 
                    onClick={() => setShowAddItemModal(true)}
                    className="mt-4 bg-accent-orange hover:bg-orange-400 text-white"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Your First Item
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddItemModal 
        open={showAddItemModal} 
        onOpenChange={setShowAddItemModal} 
      />
      <TableManagementModal 
        open={showTableModal} 
        onOpenChange={setShowTableModal} 
      />
      <ReportsModal 
        open={showReportsModal} 
        onOpenChange={setShowReportsModal} 
      />
      <SettingsModal 
        open={showSettingsModal} 
        onOpenChange={setShowSettingsModal} 
      />
    </div>
  );
}

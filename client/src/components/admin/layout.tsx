import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, BarChart3, ShoppingBag, DollarSign, Bell, Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getActiveRoute = (): string => {
    if (location === "/admin/orders") return "/admin/orders";
    if (location === "/admin/billing") return "/admin/billing";
    if (location === "/admin/requests") return "/admin/requests";
    return "/admin";
  };

  const activeRoute = getActiveRoute();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-secondary-dark p-3 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-warning-yellow rounded-lg flex items-center justify-center">
              <BarChart3 className="text-black" size={14} />
            </div>
            <h1 className="text-lg font-bold">Admin</h1>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-white"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <nav className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 
        fixed lg:static 
        w-64 bg-secondary-dark min-h-screen p-4 
        transition-transform duration-300 ease-in-out 
        z-40 top-0 left-0
        ${isSidebarOpen ? 'pt-16' : 'pt-4'} lg:pt-4
      `}>
        <div className="hidden lg:flex items-center space-x-3 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-warning-yellow rounded-lg flex items-center justify-center">
              <BarChart3 className="text-black" size={16} />
            </div>
            <h1 className="text-lg font-bold">Admin</h1>
          </div>
        </div>

        <ul className="space-y-2">
          <li>
            <Link href="/admin">
              <Button
                variant="ghost"
                className={`w-full justify-start px-4 py-3 ${
                  activeRoute === "/admin" 
                    ? "bg-warning-yellow text-black font-medium" 
                    : "text-gray-400 hover:text-white hover:bg-primary-dark"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Home className="mr-3" size={16} />
                <span>Dashboard</span>
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/admin/orders">
              <Button
                variant="ghost"
                className={`w-full justify-start px-4 py-3 ${
                  activeRoute === "/admin/orders" 
                    ? "bg-warning-yellow text-black font-medium" 
                    : "text-gray-400 hover:text-white hover:bg-primary-dark"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <ShoppingBag className="mr-3" size={16} />
                <span>Live Orders</span>
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/admin/billing">
              <Button
                variant="ghost"
                className={`w-full justify-start px-4 py-3 ${
                  activeRoute === "/admin/billing" 
                    ? "bg-warning-yellow text-black font-medium" 
                    : "text-gray-400 hover:text-white hover:bg-primary-dark"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <DollarSign className="mr-3" size={16} />
                <span>Billing</span>
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/admin/requests">
              <Button
                variant="ghost"
                className={`w-full justify-start px-4 py-3 ${
                  activeRoute === "/admin/requests" 
                    ? "bg-warning-yellow text-black font-medium" 
                    : "text-gray-400 hover:text-white hover:bg-primary-dark"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Bell className="mr-3" size={16} />
                <span>Service Requests</span>
              </Button>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-3 sm:p-4 lg:p-6 pt-16 lg:pt-6">
        {children}
      </main>
    </div>
  );
}

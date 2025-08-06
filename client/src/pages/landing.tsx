import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Utensils, 
  Smartphone, 
  ClipboardList, 
  BarChart3,
  QrCode,
  Bell,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  Settings 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark to-secondary-dark">
      <header className="p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent-orange rounded-lg flex items-center justify-center">
              <Utensils className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">GastroFlow</h1>
              <p className="text-gray-400 text-sm">Smart Hotel Management</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Live System</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
              <span className="text-success-green text-sm font-medium">Connected</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Select Your Panel</h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
            Choose the appropriate interface for your role in the restaurant management system
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Customer Panel Card */}
          <Link href="/customer">
            <Card className="bg-secondary-dark border-gray-700 hover:border-accent-orange transition-all duration-300 cursor-pointer group h-full">
              <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="text-white" size={24} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Customer Panel</h3>
                <p className="text-gray-400 mb-4 sm:mb-6 flex-grow text-sm sm:text-base">
                  QR code table ordering, menu browsing, and service requests for restaurant guests
                </p>
                <div className="space-y-2 text-xs sm:text-sm text-gray-300 mb-6 sm:mb-8">
                  <div className="flex items-center justify-center space-x-2">
                    <QrCode className="text-accent-orange" size={16} />
                    <span>QR Code Integration</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Utensils className="text-accent-orange" size={16} />
                    <span>Digital Menu</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Bell className="text-accent-orange" size={16} />
                    <span>Service Requests</span>
                  </div>
                </div>
                <Button className="w-full bg-accent-orange hover:bg-orange-600 text-white font-semibold">
                  Access Customer Panel
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Staff Panel Card */}
          <Link href="/staff">
            <Card className="bg-secondary-dark border-gray-700 hover:border-success-green transition-all duration-300 cursor-pointer group h-full">
              <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="text-white" size={24} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Staff Panel</h3>
                <p className="text-gray-400 mb-4 sm:mb-6 flex-grow text-sm sm:text-base">
                  Real-time kitchen dashboard for order management and service coordination
                </p>
                <div className="space-y-2 text-xs sm:text-sm text-gray-300 mb-6 sm:mb-8">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="text-success-green" size={16} />
                    <span>Real-time Orders</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <ClipboardList className="text-success-green" size={16} />
                    <span>Task Management</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="text-success-green" size={16} />
                    <span>Service Alerts</span>
                  </div>
                </div>
                <Button className="w-full bg-success-green hover:bg-green-600 text-white font-semibold">
                  Access Staff Panel
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Admin Panel Card */}
          <Link href="/admin">
            <Card className="bg-secondary-dark border-gray-700 hover:border-warning-yellow transition-all duration-300 cursor-pointer group h-full">
              <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Admin Panel</h3>
                <p className="text-gray-400 mb-4 sm:mb-6 flex-grow text-sm sm:text-base">
                  Complete management dashboard with analytics, billing, and system oversight
                </p>
                <div className="space-y-2 text-xs sm:text-sm text-gray-300 mb-6 sm:mb-8">
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="text-warning-yellow" size={16} />
                    <span>Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <DollarSign className="text-warning-yellow" size={16} />
                    <span>Billing Management</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Settings className="text-warning-yellow" size={16} />
                    <span>System Control</span>
                  </div>
                </div>
                <Button className="w-full bg-warning-yellow hover:bg-yellow-600 text-black font-semibold">
                  Access Admin Panel
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}

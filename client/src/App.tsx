import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/landing";
import CustomerPanel from "@/pages/customer";
import StaffPanel from "@/pages/staff";
import AdminPanel from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/customer" component={CustomerPanel} />
      <Route path="/staff" component={StaffPanel} />
      <Route path="/admin/:page?" component={AdminPanel} />
      <Route path="/:tableNumber" component={CustomerPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-primary-dark text-white">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

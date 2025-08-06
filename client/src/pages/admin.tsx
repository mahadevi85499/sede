import { useRoute } from "wouter";
import AdminLayout from "@/components/admin/layout";
import DashboardPage from "./admin/dashboard";
import OrdersPage from "./admin/orders";
import BillingPage from "./admin/billing";
import RequestsPage from "./admin/requests";

export default function AdminPanel() {
  const [match, params] = useRoute("/admin/:page?");
  const page = params?.page || "dashboard";

  const renderPage = () => {
    switch (page) {
      case "orders":
        return <OrdersPage />;
      case "billing":
        return <BillingPage />;
      case "requests":
        return <RequestsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AdminLayout>
      {renderPage()}
    </AdminLayout>
  );
}

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import TableStatusCard from "@/components/admin/table-status-card";
import type { OrderEvent } from "@shared/schema";

interface OrderWithId extends OrderEvent {
  id: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithId[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "events"),
      where("type", "==", "order")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData: OrderWithId[] = [];
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        ordersData.push({ ...data, id: doc.id } as OrderWithId);
      });
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Live Orders</h2>
        <p className="text-gray-400">Monitor and manage all active orders</p>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full bg-secondary-dark rounded-xl p-8 text-center text-gray-400">
            No active orders
          </div>
        ) : (
          orders.map((order) => (
            <TableStatusCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}

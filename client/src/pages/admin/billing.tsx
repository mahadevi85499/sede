import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BillingTable from "@/components/admin/billing-table";
import type { BillingRequestEvent } from "@shared/schema";

interface BillingRequestWithId extends BillingRequestEvent {
  id: string;
}

export default function BillingPage() {
  const [billingRequests, setBillingRequests] = useState<BillingRequestWithId[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "events"),
      where("type", "==", "billing-request")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsData: BillingRequestWithId[] = [];
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        requestsData.push({ ...data, id: doc.id } as BillingRequestWithId);
      });
      setBillingRequests(requestsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Billing Management</h2>
        <p className="text-gray-400">Handle billing requests and payment processing</p>
      </div>

      <BillingTable requests={billingRequests} />
    </div>
  );
}

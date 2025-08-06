import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import RequestItem from "@/components/admin/request-item";
import type { ServiceRequestEvent } from "@shared/schema";

interface ServiceRequestWithId extends ServiceRequestEvent {
  id: string;
}

export default function RequestsPage() {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestWithId[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "events"),
      where("type", "==", "service-request")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsData: ServiceRequestWithId[] = [];
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        requestsData.push({ ...data, id: doc.id } as ServiceRequestWithId);
      });
      setServiceRequests(requestsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Service Requests</h2>
        <p className="text-gray-400">Monitor all service requests from tables</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {serviceRequests.length === 0 ? (
          <div className="col-span-full bg-secondary-dark rounded-xl p-8 text-center text-gray-400">
            No pending service requests
          </div>
        ) : (
          serviceRequests.map((request) => (
            <RequestItem key={request.id} request={request} />
          ))
        )}
      </div>
    </div>
  );
}

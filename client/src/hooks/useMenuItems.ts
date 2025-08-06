import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FullMenuItem } from "@shared/schema";

export const useMenuItems = () => {
  return useQuery({
    queryKey: ['/api/menu-items'],
    queryFn: async (): Promise<FullMenuItem[]> => {
      try {
        const menuQuery = query(
          collection(db, "menuItems"),
          orderBy("createdAt", "desc")
        );
        
        const snapshot = await getDocs(menuQuery);
        
        if (snapshot.empty) {
          return [];
        }

        const menuItems: FullMenuItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FullMenuItem[];

        return menuItems;
      } catch (error) {
        console.error("Error fetching menu items:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useMenuItemsByCategory = (category?: string) => {
  const { data: allItems, ...rest } = useMenuItems();
  
  const filteredItems = category 
    ? allItems?.filter(item => item.category === category) || []
    : allItems || [];

  return {
    data: filteredItems,
    ...rest,
  };
};
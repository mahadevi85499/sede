import { useQuery } from "@tanstack/react-query";
import type { FullMenuItem } from "@shared/schema";

export const useMenuItems = () => {
  return useQuery({
    queryKey: ['/api/menu'],
    queryFn: async (): Promise<FullMenuItem[]> => {
      try {
        const response = await fetch('/api/menu');
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching menu items:", error);
        throw error;
      }
    },
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 5 * 1000, // Auto refresh every 5 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Loader2 } from "lucide-react";
import { MENU_CATEGORIES } from "@shared/schema";
import type { MenuItem } from "@shared/schema";
import type { MenuItem as DBMenuItem } from "@shared/drizzle-schema";

import { getOptimizedImageUrl } from "@/lib/image-upload";

interface FoodMenuProps {
  cart: MenuItem[];
  setCart: (cart: MenuItem[]) => void;
}

export default function FoodMenu({ cart, setCart }: FoodMenuProps) {
  const [activeCategory, setActiveCategory] = useState("starters");
  // Fetch menu items with real-time sync
  const { data: menuItems = [], isLoading, error } = useQuery<DBMenuItem[]>({
    queryKey: ['/api/menu'],
    staleTime: 0, // Set to 0 to always fetch fresh data
    refetchInterval: 5 * 1000, // Auto refresh every 5 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<DBMenuItem[]> => {
      const response = await fetch('/api/menu');
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      return response.json();
    }
  });

  const getItemQuantity = (itemId: string): number => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const updateQuantity = (itemId: string, name: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.id !== itemId));
      return;
    }

    const existingItem = cart.find(item => item.id === itemId);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      setCart([...cart, {
        id: itemId,
        name,
        quantity: newQuantity,
        pack: false
      }]);
    }
  };

  const filteredItems = menuItems.filter((item: DBMenuItem) => item.category === activeCategory);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-secondary-dark rounded-lg p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Our Menu</h2>
        
        {/* Category Tabs - Mobile Optimized */}
        <div className="flex space-x-1 mb-4 md:mb-6 bg-primary-dark rounded-lg p-1 overflow-x-auto scrollbar-hide">
          {MENU_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "ghost"}
              className={`px-3 md:px-4 py-2 rounded-md font-medium transition-all duration-200 whitespace-nowrap text-sm md:text-base flex-shrink-0 ${
                activeCategory === category.id 
                  ? "bg-accent-orange text-white" 
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent-orange" />
          <span className="ml-2 text-gray-400">Loading menu...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-center">
          <p className="text-red-400">Failed to load menu items. Please try again later.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No items available in this category</p>
          <p className="text-gray-500 text-sm mt-2">Check back soon or try another category</p>
        </div>
      )}

      {/* Menu Items Grid - Mobile Optimized */}
      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredItems.map((item: DBMenuItem) => {
            const quantity = getItemQuantity(item.id);
            const optimizedImageUrl = item.image ? getOptimizedImageUrl(item.image) : null;
            
            return (
              <Card key={item.id} className="bg-secondary-dark border-gray-700">
                <CardContent className="p-3 md:p-4">
                  {optimizedImageUrl ? (
                    <img 
                      src={optimizedImageUrl} 
                      alt={item.name} 
                      className="w-full h-32 md:h-36 object-cover rounded-lg mb-3"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-32 md:h-36 bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No image</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm md:text-base leading-tight">{item.name}</h3>
                      {quantity > 0 && (
                        <Badge className="bg-accent-orange text-white text-xs">
                          {quantity}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs md:text-sm line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-accent-orange font-bold text-sm md:text-base">₹{item.price}</span>
                      {!item.inStock ? (
                        <span className="text-red-400 text-xs">Out of Stock</span>
                      ) : quantity === 0 ? (
                        <Button
                          onClick={() => updateQuantity(item.id, item.name, 1)}
                          className="bg-accent-orange hover:bg-accent-orange/90 text-white text-xs md:text-sm px-3 md:px-4 py-1 md:py-2"
                        >
                          Add to Cart
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.name, quantity - 1)}
                            className="w-8 h-8 p-0 border-gray-600"
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.name, quantity + 1)}
                            className="w-8 h-8 p-0 border-gray-600"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
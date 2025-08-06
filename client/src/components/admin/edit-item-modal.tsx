import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/image-upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const editItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Please select a category"),
  isVegetarian: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  preparationTime: z.number().min(1, "Preparation time must be at least 1 minute"),
  inStock: z.boolean().default(true),
});

type EditItemFormData = z.infer<typeof editItemSchema>;

interface EditItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any; // The menu item to edit
}

const categories = [
  "Starters",
  "Main Course", 
  "Desserts",
  "Beverages",
  "Snacks",
  "Salads"
];

export default function EditItemModal({ open, onOpenChange, item }: EditItemModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditItemFormData>({
    resolver: zodResolver(editItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      isVegetarian: false,
      isSpicy: false,
      preparationTime: 15,
      inStock: true,
    },
  });

  // Set form values when item changes
  useEffect(() => {
    if (item && open) {
      form.reset({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        isVegetarian: item.isVegetarian,
        isSpicy: item.isSpicy,
        preparationTime: item.preparationTime,
        inStock: item.inStock,
      });

      // Set image preview if item has an image
      if (item.image) {
        setImagePreview(item.image);
      } else {
        setImagePreview(null);
      }
    }
  }, [item, open, form]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, GIF)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const updateItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Immediately refresh menu data everywhere
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      queryClient.refetchQueries({ queryKey: ['/api/menu'] });
      
      toast({
        title: "Item updated successfully!",
        description: "Menu item has been updated and changes are now visible",
      });
      
      // Close the modal
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error updating menu item:", error);
      toast({
        title: "Error updating item",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: EditItemFormData) => {
    setIsSubmitting(true);
    
    try {
      let imageUrl = item.image || "";
      
      // Upload image if a new one is selected
      if (imageFile) {
        try {
          console.log('Starting image upload...');
          imageUrl = await uploadImage(imageFile);
          console.log('Image upload successful:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue with existing image or no image
        }
      } else if (imagePreview === null && item.image) {
        // User removed the image
        imageUrl = "";
      }

      // Prepare item data for update
      const updatedItem = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image: imageUrl,
        isVegetarian: data.isVegetarian,
        isSpicy: data.isSpicy,
        preparationTime: data.preparationTime,
        inStock: data.inStock,
      };

      console.log('Updating item:', updatedItem);
      updateItemMutation.mutate(updatedItem);
      
    } catch (error) {
      console.error("Error preparing menu item update:", error);
      toast({
        title: "Error updating item",
        description: "Please try again later",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-secondary-dark border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Menu Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Image</label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-300">
                        Click to upload image
                      </span>
                      <span className="block text-xs text-gray-400">
                        PNG, JPG, GIF up to 5MB
                      </span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Butter Chicken" 
                      className="bg-primary-dark border-gray-600"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the dish, ingredients, and special features..."
                      className="bg-primary-dark border-gray-600 min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="bg-primary-dark border-gray-600"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-primary-dark border-gray-600">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="preparationTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preparation Time (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="1"
                      className="bg-primary-dark border-gray-600"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 15)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...form.register("isVegetarian")}
                  className="rounded border-gray-600"
                />
                <span className="text-sm">Vegetarian</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...form.register("isSpicy")}
                  className="rounded border-gray-600"
                />
                <span className="text-sm">Spicy</span>
              </label>
            </div>

            <FormField
              control={form.control}
              name="inStock"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-600"
                    />
                    <FormLabel htmlFor="inStock" className="cursor-pointer">
                      Item In Stock
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-accent-orange hover:bg-orange-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Item"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
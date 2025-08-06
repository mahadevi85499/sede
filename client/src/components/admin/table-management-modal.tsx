import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, QrCode, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Table } from "@shared/drizzle-schema";

interface TableManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tableSchema = z.object({
  number: z.number().min(1, "Table number must be at least 1"),
  seats: z.number().min(1, "Seats must be at least 1").max(20, "Maximum 20 seats"),
});

type TableFormData = z.infer<typeof tableSchema>;

export default function TableManagementModal({ open, onOpenChange }: TableManagementModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      number: 1,
      seats: 4,
    },
  });



  // Add table mutation
  const addTableMutation = useMutation({
    mutationFn: (tableData: TableFormData) => apiRequest('/api/tables', 'POST', { 
      ...tableData, 
      status: 'available' 
    }),
    onSuccess: () => {
      form.reset();
      toast({
        title: "Table added successfully",
        description: `Table ${form.getValues().number} is ready for QR code generation.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding table",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TableFormData) => {
    addTableMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-secondary-dark border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Table Management</DialogTitle>
        </DialogHeader>

        <div className="max-w-md mx-auto">
          {/* Add Table Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Add New Table</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Table Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="e.g., 5"
                          className="bg-primary-dark border-gray-600"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Seats</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          placeholder="e.g., 4"
                          className="bg-primary-dark border-gray-600"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 4)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />



                <Button 
                  type="submit" 
                  className="w-full bg-accent-orange hover:bg-accent-orange/80"
                  disabled={addTableMutation.isPending}
                >
                  Add Table
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 p-4 bg-primary-dark rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 text-center">
                Each table will be accessible via URL: /{`{table_number}`}
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Example: Table 5 → yoursite.com/5
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
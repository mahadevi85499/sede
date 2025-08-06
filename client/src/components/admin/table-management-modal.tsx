import { useState, useEffect } from "react";
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
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const form = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      number: 1,
      seats: 4,
    },
  });

  // Fetch existing tables
  const { data: tables = [], isLoading: tablesLoading } = useQuery<Table[]>({
    queryKey: ['/api/tables'],
    enabled: open,
  });

  // Reset form when editing changes
  useEffect(() => {
    if (editingTable) {
      form.reset({
        number: editingTable.number,
        seats: editingTable.seats,
      });
    }
  }, [editingTable, form]);

  // Add table mutation
  const addTableMutation = useMutation({
    mutationFn: async (tableData: TableFormData) => {
      const response = await apiRequest('/api/tables', 'POST', { 
        ...tableData, 
        status: 'available' 
      });
      return response as unknown as Table;
    },
    onSuccess: (newTable: Table) => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      toast({
        title: "Table added successfully",
        description: `Table ${newTable.number} is ready for QR code generation. URL: /${newTable.number}`,
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

  // Update table mutation
  const updateTableMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Table> }) => {
      const response = await apiRequest(`/api/tables/${id}`, 'PUT', data);
      return response as unknown as Table;
    },
    onSuccess: (updatedTable: Table) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      setEditingTable(null);
      form.reset();
      toast({
        title: "Table updated successfully",
        description: `Table ${updatedTable.number} has been updated.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating table",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TableFormData) => {
    if (editingTable) {
      updateTableMutation.mutate({
        id: editingTable.id,
        data: { ...data }
      });
    } else {
      addTableMutation.mutate(data);
    }
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    form.reset({
      number: table.number,
      seats: table.seats,
    });
  };

  const handleCancelEdit = () => {
    setEditingTable(null);
    form.reset({
      number: 1,
      seats: 4,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-secondary-dark border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Table Management</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Existing Tables */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Tables</h3>
            
            {tablesLoading ? (
              <div className="text-center py-8 text-gray-400">Loading tables...</div>
            ) : tables.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border border-dashed border-gray-600 rounded-lg">
                <p>No tables added yet</p>
                <p className="text-sm">Add your first table to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {tables.map((table) => (
                  <Card key={table.id} className="bg-primary-dark border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-accent-orange rounded-lg flex items-center justify-center text-white font-bold">
                            {table.number}
                          </div>
                          <div>
                            <p className="font-medium">Table {table.number}</p>
                            <p className="text-sm text-gray-400">{table.seats} seats</p>
                            <p className="text-xs text-gray-500">URL: /{table.number}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={table.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                            {table.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-gray-600 hover:bg-accent-orange/20"
                            onClick={() => handleEditTable(table)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Table Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingTable ? `Edit Table ${editingTable.number}` : 'Add New Table'}
              </h3>
              {editingTable && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  className="border-gray-600"
                >
                  Cancel
                </Button>
              )}
            </div>
            
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
                  disabled={addTableMutation.isPending || updateTableMutation.isPending}
                >
                  {editingTable ? 'Update Table' : 'Add Table'}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 p-4 bg-primary-dark rounded-lg border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <QrCode className="h-4 w-4 text-accent-orange" />
                <p className="text-sm font-medium">QR Code URLs</p>
              </div>
              <p className="text-sm text-gray-400">
                Each table will be accessible via URL: /{`{table_number}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Example: Table 5 → yoursite.com/5
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Generate QR codes pointing to these URLs for easy customer access.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
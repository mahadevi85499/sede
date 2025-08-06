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
  status: z.enum(["available", "occupied", "reserved", "maintenance"]).default("available"),
});

type TableFormData = z.infer<typeof tableSchema>;

export default function TableManagementModal({ open, onOpenChange }: TableManagementModalProps) {
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      number: 1,
      seats: 4,
      status: "available",
    },
  });

  // Fetch tables
  const { data: tables = [], isLoading } = useQuery<Table[]>({
    queryKey: ['/api/tables'],
    queryFn: async () => {
      const response = await fetch('/api/tables');
      if (!response.ok) throw new Error('Failed to fetch tables');
      return response.json();
    }
  });

  // Add table mutation
  const addTableMutation = useMutation({
    mutationFn: (tableData: TableFormData) => apiRequest('/api/tables', 'POST', tableData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      form.reset();
      toast({
        title: "Table added successfully",
        description: "The new table is now available for reservations.",
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Table> }) => 
      apiRequest(`/api/tables/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      setEditingTable(null);
      toast({
        title: "Table updated successfully",
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
      updateTableMutation.mutate({ id: editingTable.id, data });
    } else {
      addTableMutation.mutate(data);
    }
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    form.reset({
      number: table.number,
      seats: table.seats,
      status: table.status as any,
    });
  };

  const handleCancel = () => {
    setEditingTable(null);
    form.reset();
  };

  const generateQRCode = (tableNumber: number) => {
    const tableUrl = `${window.location.origin}/${tableNumber}`;
    // Open QR code generator in new tab (you can integrate with QR libraries later)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tableUrl)}`;
    window.open(qrUrl, '_blank');
    toast({
      title: "QR Code Generated",
      description: `QR code for table ${tableNumber} opened in new tab`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'maintenance': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-secondary-dark border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Table Management</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add/Edit Table Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {editingTable ? "Edit Table" : "Add New Table"}
            </h3>
            
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-primary-dark border-gray-600">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="bg-accent-orange hover:bg-accent-orange/80"
                    disabled={addTableMutation.isPending || updateTableMutation.isPending}
                  >
                    {editingTable ? "Update" : "Add"} Table
                  </Button>
                  {editingTable && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {/* Tables List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Tables</h3>
            
            {isLoading ? (
              <div className="text-center py-4 text-gray-400">Loading tables...</div>
            ) : tables.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No tables added yet</p>
                <p className="text-sm">Add your first table to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tables.map((table) => (
                  <Card key={table.id} className="bg-primary-dark border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-bold">Table {table.number}</div>
                          <Badge className={`${getStatusColor(table.status)} text-white`}>
                            {table.status}
                          </Badge>
                          <span className="text-sm text-gray-400">{table.seats} seats</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateQRCode(table.number)}
                            className="p-2"
                          >
                            <QrCode size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(table)}
                            className="p-2"
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        URL: /{table.number}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
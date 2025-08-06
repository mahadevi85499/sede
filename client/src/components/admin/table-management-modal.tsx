import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Users, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Table {
  id: string;
  number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  currentOrder?: string;
  reservedBy?: string;
  reservedUntil?: string;
}

interface TableManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Tables will be loaded from Supabase database
const initialTables: Table[] = [];

export default function TableManagementModal({ open, onOpenChange }: TableManagementModalProps) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableSeats, setNewTableSeats] = useState(4);
  const { toast } = useToast();

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-success-green';
      case 'occupied': return 'bg-accent-orange';
      case 'reserved': return 'bg-warning-yellow text-black';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Table['status']) => {
    switch (status) {
      case 'available': return <CheckCircle size={16} />;
      case 'occupied': return <Users size={16} />;
      case 'reserved': return <Clock size={16} />;
      case 'maintenance': return <Edit2 size={16} />;
      default: return null;
    }
  };

  const addNewTable = () => {
    const newTable: Table = {
      id: Date.now().toString(),
      number: Math.max(...tables.map(t => t.number)) + 1,
      seats: newTableSeats,
      status: 'available'
    };

    setTables([...tables, newTable]);
    setIsAddingTable(false);
    setNewTableSeats(4);
    
    toast({
      title: "Table added successfully!",
      description: `Table ${newTable.number} with ${newTable.seats} seats has been added`,
    });
  };

  const updateTableStatus = (tableId: string, newStatus: Table['status']) => {
    setTables(tables.map(table => 
      table.id === tableId 
        ? { ...table, status: newStatus, currentOrder: newStatus === 'available' ? undefined : table.currentOrder }
        : table
    ));
    
    toast({
      title: "Table status updated",
      description: `Table status changed to ${newStatus}`,
    });
  };

  const removeTable = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table?.status === 'occupied') {
      toast({
        title: "Cannot remove table",
        description: "Table is currently occupied",
        variant: "destructive",
      });
      return;
    }

    setTables(tables.filter(t => t.id !== tableId));
    toast({
      title: "Table removed",
      description: `Table ${table?.number} has been removed`,
    });
  };

  const reserveTable = (tableId: string) => {
    const customerName = prompt("Enter customer name for reservation:");
    const reservationTime = prompt("Enter reservation time (HH:MM):");
    
    if (customerName && reservationTime) {
      setTables(tables.map(table => 
        table.id === tableId 
          ? { 
              ...table, 
              status: 'reserved',
              reservedBy: customerName,
              reservedUntil: reservationTime
            }
          : table
      ));
      
      toast({
        title: "Table reserved",
        description: `Table reserved for ${customerName} until ${reservationTime}`,
      });
    }
  };

  const totalTables = tables.length;
  const availableTables = tables.filter(t => t.status === 'available').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const reservedTables = tables.filter(t => t.status === 'reserved').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-secondary-dark border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Table Management</DialogTitle>
        </DialogHeader>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-primary-dark border-gray-700">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold">{totalTables}</div>
              <div className="text-xs text-gray-400">Total Tables</div>
            </CardContent>
          </Card>
          <Card className="bg-primary-dark border-gray-700">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-success-green">{availableTables}</div>
              <div className="text-xs text-gray-400">Available</div>
            </CardContent>
          </Card>
          <Card className="bg-primary-dark border-gray-700">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-accent-orange">{occupiedTables}</div>
              <div className="text-xs text-gray-400">Occupied</div>
            </CardContent>
          </Card>
          <Card className="bg-primary-dark border-gray-700">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-warning-yellow">{reservedTables}</div>
              <div className="text-xs text-gray-400">Reserved</div>
            </CardContent>
          </Card>
        </div>

        {/* Add New Table */}
        <div className="mb-6">
          {!isAddingTable ? (
            <Button 
              onClick={() => setIsAddingTable(true)}
              className="bg-accent-orange hover:bg-orange-600"
            >
              <Plus size={16} className="mr-2" />
              Add New Table
            </Button>
          ) : (
            <div className="flex items-center space-x-3 bg-primary-dark p-4 rounded-lg">
              <span className="text-sm">Seats:</span>
              <Input 
                type="number"
                min="1"
                max="12"
                value={newTableSeats}
                onChange={(e) => setNewTableSeats(parseInt(e.target.value) || 4)}
                className="w-20 bg-secondary-dark border-gray-600"
              />
              <Button 
                onClick={addNewTable}
                size="sm"
                className="bg-success-green hover:bg-green-600"
              >
                Add
              </Button>
              <Button 
                onClick={() => setIsAddingTable(false)}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <Card key={table.id} className="bg-primary-dark border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg">Table {table.number}</span>
                    <Badge className={getStatusColor(table.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(table.status)}
                        <span className="capitalize text-xs">{table.status}</span>
                      </div>
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Users size={14} />
                    <span>{table.seats} seats</span>
                  </div>
                  
                  {table.currentOrder && (
                    <div className="text-sm text-accent-orange">
                      Order: {table.currentOrder}
                    </div>
                  )}
                  
                  {table.reservedBy && (
                    <div className="text-sm text-warning-yellow">
                      Reserved by: {table.reservedBy}
                      {table.reservedUntil && <div>Until: {table.reservedUntil}</div>}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {table.status === 'available' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => updateTableStatus(table.id, 'occupied')}
                        className="text-accent-orange hover:bg-orange-600 hover:text-white"
                      >
                        Occupy
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => reserveTable(table.id)}
                        className="text-warning-yellow hover:bg-yellow-600 hover:text-black"
                      >
                        Reserve
                      </Button>
                    </>
                  )}
                  
                  {table.status === 'occupied' && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => updateTableStatus(table.id, 'available')}
                      className="text-success-green hover:bg-green-600 hover:text-white"
                    >
                      Free Up
                    </Button>
                  )}
                  
                  {table.status === 'reserved' && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => updateTableStatus(table.id, 'available')}
                      className="text-success-green hover:bg-green-600 hover:text-white"
                    >
                      Cancel Reservation
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => updateTableStatus(table.id, 'maintenance')}
                    className="text-blue-400 hover:bg-blue-600 hover:text-white"
                  >
                    Maintenance
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => removeTable(table.id)}
                    className="text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            variant="ghost"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
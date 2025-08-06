import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Table } from "@shared/drizzle-schema";

interface TableSelectorProps {
  onTableSelect: (tableNumber: number) => void;
}

export default function TableSelector({ onTableSelect }: TableSelectorProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [customTable, setCustomTable] = useState("");

  // Fetch available tables from API
  const { data: tables = [], isLoading } = useQuery<Table[]>({
    queryKey: ['/api/tables'],
    queryFn: async () => {
      const response = await fetch('/api/tables');
      if (!response.ok) throw new Error('Failed to fetch tables');
      return response.json();
    }
  });

  // Filter available tables
  const availableTables = tables.filter(table => table.status === 'available');

  const handleTableSelect = (table: number) => {
    setSelectedTable(table);
    onTableSelect(table);
  };

  const handleCustomTableSubmit = () => {
    const tableNum = parseInt(customTable);
    if (tableNum && tableNum > 0) {
      handleTableSelect(tableNum);
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center p-4">
      <Card className="bg-secondary-dark border-gray-700 w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to GastroFlow</h2>
            <p className="text-gray-400">Please select your table number to continue</p>
          </div>

          {/* Quick Table Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Available Tables</Label>
            {isLoading ? (
              <div className="text-center py-4 text-gray-400">Loading tables...</div>
            ) : availableTables.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <p>No tables available</p>
                <p className="text-sm">Please contact staff for assistance</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableTables.map((table) => (
                  <Button
                    key={table.id}
                    variant="outline"
                    size="sm"
                    className="aspect-square bg-primary-dark border-gray-600 hover:border-accent-orange hover:bg-accent-orange/20"
                    onClick={() => handleTableSelect(table.number)}
                  >
                    {table.number}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Table Input */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Or enter table number</Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Table number"
                value={customTable}
                onChange={(e) => setCustomTable(e.target.value)}
                className="bg-primary-dark border-gray-600"
                min="1"
                max="999"
              />
              <Button 
                onClick={handleCustomTableSubmit}
                disabled={!customTable || parseInt(customTable) <= 0}
                className="bg-accent-orange hover:bg-accent-orange/90"
              >
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          <div className="mt-6 p-3 bg-primary-dark rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              Can't find your table? Please ask the staff for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ServiceRequestEvent } from "@shared/schema";

interface ServiceRequestWithId extends ServiceRequestEvent {
  id: string;
}

interface RequestItemProps {
  request: ServiceRequestWithId;
}

export default function RequestItem({ request }: RequestItemProps) {
  const getRequestDisplay = (requestType: string): string => {
    switch (requestType) {
      case "staff":
        return "Staff Call";
      case "water":
        return "Water Request";
      case "hot-water":
        return "Hot Water Request";
      case "cleaning":
        return "Cleaning Request";
      default:
        return requestType;
    }
  };

  const getBorderColor = (requestType: string): string => {
    switch (requestType) {
      case "staff":
        return "border-accent-orange";
      case "water":
      case "hot-water":
        return "border-blue-500";
      case "cleaning":
        return "border-green-500";
      default:
        return "border-warning-yellow";
    }
  };

  const getIconColor = (requestType: string): string => {
    switch (requestType) {
      case "staff":
        return "bg-accent-orange";
      case "water":
      case "hot-water":
        return "bg-blue-500";
      case "cleaning":
        return "bg-green-500";
      default:
        return "bg-warning-yellow";
    }
  };

  const getTimeAgo = (): string => {
    // For now, returning a static value since we don't have timestamp parsing
    return "2 min ago";
  };

  return (
    <Card className={`bg-secondary-dark ${getBorderColor(request.request)}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${getIconColor(request.request)} rounded-full flex items-center justify-center`}>
              <span className="font-bold text-white">{request.table}</span>
            </div>
            <div>
              <h3 className="font-bold">Table {request.table}</h3>
              <p className="font-medium text-warning-yellow">
                {getRequestDisplay(request.request)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Requested</p>
            <p className="font-medium">{getTimeAgo()}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Status:</span>
          <Badge className="bg-warning-yellow text-black font-medium">Pending</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

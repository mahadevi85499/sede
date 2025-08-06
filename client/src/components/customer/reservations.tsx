import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, Phone, User } from "lucide-react";
import { addDoc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { ReservationEvent } from "@shared/schema";

interface ReservationFormData {
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
}

export function Reservations() {
  const [formData, setFormData] = useState<ReservationFormData>({
    customerName: "",
    customerPhone: "",
    date: "",
    time: "",
    partySize: 2,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate time slots for booking
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 10; // 10 AM to 10 PM
    const time12 = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
    const time24 = `${hour.toString().padStart(2, '0')}:00`;
    return { label: time12, value: time24 };
  });

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Fetch user reservations
  const { data: reservations = [] } = useQuery({
    queryKey: ['/api/reservations', formData.customerPhone],
    queryFn: async () => {
      if (!formData.customerPhone) return [];
      
      return new Promise<ReservationEvent[]>((resolve) => {
        const q = query(
          collection(db, "events"),
          where("type", "==", "reservation"),
          where("customerPhone", "==", formData.customerPhone),
          orderBy("timestamp", "desc")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const reservationData = snapshot.docs.map(doc => ({
            ...doc.data()
          })) as ReservationEvent[];
          resolve(reservationData);
        });
        
        return () => unsubscribe();
      });
    },
    enabled: !!formData.customerPhone,
  });

  // Create reservation mutation
  const createReservation = useMutation({
    mutationFn: async (data: ReservationFormData) => {
      const reservationData: Omit<ReservationEvent, 'timestamp'> = {
        type: "reservation",
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        date: data.date,
        time: data.time,
        partySize: data.partySize,
        status: "pending",
      };

      await addDoc(collection(db, "events"), {
        ...reservationData,
        timestamp: new Date(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Reservation Confirmed!",
        description: "Your table has been reserved successfully.",
      });
      setFormData({
        customerName: "",
        customerPhone: "",
        date: "",
        time: "",
        partySize: 2,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reservations'] });
    },
    onError: () => {
      toast({
        title: "Reservation Failed",
        description: "Unable to make reservation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createReservation.mutate(formData);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hour12 = parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour);
    const ampm = parseInt(hour) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minute} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Reservation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Make a Reservation
          </CardTitle>
          <CardDescription>
            Book your table for a perfect dining experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  min={minDate}
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </Label>
                <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="party-size" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Party Size
                </Label>
                <Select 
                  value={formData.partySize.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, partySize: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(size => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} {size === 1 ? 'Person' : 'People'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createReservation.isPending}
            >
              {createReservation.isPending ? "Booking..." : "Reserve Table"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Bookings */}
      {formData.customerPhone && reservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>
              Your upcoming and past reservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservations.map((reservation, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{reservation.customerName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(reservation.date)} at {formatTime(reservation.time)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Party of {reservation.partySize}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
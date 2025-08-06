import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Star, Coins, Trophy, Phone } from "lucide-react";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { LoyaltyPoints } from "@shared/schema";

interface LoyaltyTier {
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
}

const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: "Silver",
    minPoints: 0,
    benefits: ["5% discount on orders", "Birthday special offer"],
    color: "bg-gray-100 text-gray-800"
  },
  {
    name: "Gold", 
    minPoints: 500,
    benefits: ["10% discount on orders", "Free appetizer monthly", "Priority reservations"],
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    name: "Platinum",
    minPoints: 1500,
    benefits: ["15% discount on orders", "Free dessert weekly", "VIP table access", "Complimentary beverages"],
    color: "bg-purple-100 text-purple-800"
  }
];

const REWARDS_CATALOG = [
  { id: "free-appetizer", name: "Free Appetizer", cost: 100, description: "Choose any starter from our menu" },
  { id: "10-percent-off", name: "10% Off Next Order", cost: 150, description: "Discount on your entire next order" },
  { id: "free-dessert", name: "Free Dessert", cost: 200, description: "Choose any dessert from our menu" },
  { id: "free-beverage", name: "Free Beverage", cost: 80, description: "Choose any non-alcoholic drink" },
  { id: "20-percent-off", name: "20% Off Next Order", cost: 300, description: "Big discount on your entire next order" },
];

export function LoyaltyRewards() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyPoints | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCurrentTier = (points: number): LoyaltyTier => {
    for (let i = LOYALTY_TIERS.length - 1; i >= 0; i--) {
      if (points >= LOYALTY_TIERS[i].minPoints) {
        return LOYALTY_TIERS[i];
      }
    }
    return LOYALTY_TIERS[0];
  };

  const getNextTier = (points: number): LoyaltyTier | null => {
    for (let tier of LOYALTY_TIERS) {
      if (points < tier.minPoints) {
        return tier;
      }
    }
    return null;
  };

  const loadLoyaltyData = async () => {
    if (!phoneNumber) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, "loyalty", phoneNumber);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setLoyaltyData(docSnap.data() as LoyaltyPoints);
      } else {
        // Create new loyalty account
        const newLoyaltyData: LoyaltyPoints = {
          customerId: phoneNumber,
          points: 0,
          lastUpdated: new Date(),
        };
        await setDoc(docRef, newLoyaltyData);
        setLoyaltyData(newLoyaltyData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load loyalty data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (rewardId: string, cost: number) => {
    if (!loyaltyData || loyaltyData.points < cost) {
      toast({
        title: "Insufficient Points",
        description: "You don't have enough points for this reward.",
        variant: "destructive",
      });
      return;
    }

    try {
      const docRef = doc(db, "loyalty", phoneNumber);
      await updateDoc(docRef, {
        points: increment(-cost),
        lastUpdated: new Date(),
      });

      setLoyaltyData(prev => prev ? { ...prev, points: prev.points - cost } : null);
      
      toast({
        title: "Reward Redeemed!",
        description: "Your reward has been added to your account. Show this to staff when ordering.",
      });
    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: "Failed to redeem reward. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Award points for completed orders (this would be called from the order completion flow)
  const awardPoints = async (orderAmount: number) => {
    if (!phoneNumber) return;
    
    const pointsToAward = Math.floor(orderAmount / 10); // 1 point per ₹10 spent
    
    try {
      const docRef = doc(db, "loyalty", phoneNumber);
      await updateDoc(docRef, {
        points: increment(pointsToAward),
        lastUpdated: new Date(),
      });

      if (loyaltyData) {
        setLoyaltyData(prev => prev ? { ...prev, points: prev.points + pointsToAward } : null);
      }

      toast({
        title: "Points Earned!",
        description: `You earned ${pointsToAward} loyalty points from your order.`,
      });
    } catch (error) {
      console.error("Failed to award points:", error);
    }
  };

  useEffect(() => {
    if (phoneNumber) {
      loadLoyaltyData();
    }
  }, [phoneNumber]);

  const currentTier = loyaltyData ? getCurrentTier(loyaltyData.points) : LOYALTY_TIERS[0];
  const nextTier = loyaltyData ? getNextTier(loyaltyData.points) : LOYALTY_TIERS[1];
  const progressToNext = nextTier ? 
    ((loyaltyData?.points || 0) - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Phone Number Input */}
      {!loyaltyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Access Your Rewards
            </CardTitle>
            <CardDescription>
              Enter your phone number to view your loyalty points and rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <Button 
                onClick={loadLoyaltyData} 
                disabled={!phoneNumber || loading}
                className="w-full"
              >
                {loading ? "Loading..." : "Access Rewards"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loyalty Status */}
      {loyaltyData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Your Loyalty Status
              </CardTitle>
              <CardDescription>
                Track your points and tier benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{loyaltyData.points} Points</h3>
                  <Badge className={currentTier.color}>{currentTier.name} Member</Badge>
                </div>
                <div className="text-right">
                  <Coins className="h-12 w-12 text-primary mx-auto" />
                </div>
              </div>

              {nextTier && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to {nextTier.name}</span>
                    <span>{loyaltyData.points}/{nextTier.minPoints}</span>
                  </div>
                  <Progress value={progressToNext} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {nextTier.minPoints - loyaltyData.points} points to reach {nextTier.name}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold">Your Benefits:</h4>
                <ul className="space-y-1">
                  {currentTier.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Star className="h-3 w-3 text-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Catalog */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Redeem Rewards
              </CardTitle>
              <CardDescription>
                Use your points to unlock delicious rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REWARDS_CATALOG.map((reward) => (
                  <div key={reward.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{reward.name}</h4>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      </div>
                      <Badge variant="outline">{reward.cost} pts</Badge>
                    </div>
                    <Button
                      onClick={() => redeemReward(reward.id, reward.cost)}
                      disabled={loyaltyData.points < reward.cost}
                      variant={loyaltyData.points >= reward.cost ? "default" : "secondary"}
                      size="sm"
                      className="w-full"
                    >
                      {loyaltyData.points >= reward.cost ? "Redeem" : "Not enough points"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={() => {
              setLoyaltyData(null);
              setPhoneNumber("");
            }}
            variant="outline"
            className="w-full"
          >
            Switch Account
          </Button>
        </>
      )}
    </div>
  );
}
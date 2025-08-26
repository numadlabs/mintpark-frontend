import { useQuery } from "@tanstack/react-query";
import { fetchLoyaltyPoints } from "../service/queryHelper";
import { useAuth } from "@/components/provider/auth-context-provider";

//todo: implement point activity later
// // Types for the loyalty points response
// interface PointActivity {
//   id: string;
//   userId: string;
//   points: number;
//   activityType: string;
//   description?: string;
//   createdAt: string;
//   updatedAt: string;
// }

interface LoyaltyPointsResponse {
  balance: number;
}

interface UseLoyaltyPointsReturn {
  loyaltyPoints: number;
  pointsData: LoyaltyPointsResponse | undefined;
  // activities: PointActivity[];
  // totalEarned: number;
  // totalSpent: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

// Custom hook
export const useLoyaltyPoints = (): UseLoyaltyPointsReturn => {
  const refetchInterval = 30000; // Refetch every 30 seconds by default
  const staleTime = 5 * 60 * 1000; // Consider data stale after 5 minutes

  const { currentUserLayer, isConnected } = useAuth();

  // Extract userId safely with null checking
  const userId = currentUserLayer?.id;

  const {
    data: pointsData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["loyalty-points", userId],
    queryFn: () => {
      // This function will only be called when enabled is true
      // and userId exists due to the enabled condition below
      if (!userId) {
        throw new Error("User ID is required to fetch loyalty points");
      }
      return fetchLoyaltyPoints(userId);
    },
    enabled: isConnected && !!userId, // Only run if enabled and userId exists
    refetchInterval,
    staleTime,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    loyaltyPoints: pointsData?.balance || 0,
    pointsData,
    // activities: pointsData?.activities || [],
    // totalEarned: pointsData?.totalEarned || 0,
    // totalSpent: pointsData?.totalSpent || 0,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    isRefetching,
  };
};

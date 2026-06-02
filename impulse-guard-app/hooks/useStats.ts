import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getAchievements, getStats } from "@/api/statsApi";

export const useStats = (userId?: string) => {
  return useQuery({
    queryKey: ["stats", userId],
    queryFn: () => getStats(userId!),
    enabled: !!userId,
  });
};

export const useAchievements = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["achievements", userId],
    queryFn: ({ pageParam = 1 }) => getAchievements(userId!, pageParam, 10),
    initialPageParam: 1,
    enabled: !!userId,
    getNextPageParam: (lastPage) => {
      if (lastPage.pages < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });
};

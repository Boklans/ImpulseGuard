import { getLevelsRewards } from "@/api/levelsApi";
import { useQuery } from "@tanstack/react-query";

export function useLevels(userId?: string) {
  return useQuery({
    queryKey: ["level"],
    queryFn: () => getLevelsRewards(userId),
    enabled: !!userId,
    initialData: undefined,
  });
}

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getItems, useItem as useItemApi } from "@/api/items/itemsApi";

export const useItems = (userId?: string, pageSize = 10) => {
  return useInfiniteQuery({
    queryKey: ["items", userId, pageSize],
    queryFn: ({ pageParam = 1 }) => getItems(userId!, pageParam, pageSize),
    initialPageParam: 1,
    enabled: !!userId,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
};

export const useUseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      petId: string;
      itemRef: string;
    }) => {
      const { petId, itemRef } = params;
      console.log(`Using item ${itemRef} on pet ${petId}`);
      return useItemApi(petId, itemRef);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["items", vars.userId] });
      queryClient.invalidateQueries({ queryKey: ["pets", vars.userId] });
      queryClient.invalidateQueries({ queryKey: ["pet", vars.petId] });
    },
  });
};

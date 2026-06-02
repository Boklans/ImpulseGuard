import { useApi } from "@/hooks/useApi";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  scheduleEggReadyNotification,
  cancelEggNotification,
} from "@/utils/localNotifications";

const PAGE_LIMIT = 10;

const getEggs =
  (api: ReturnType<typeof useApi>) =>
  async (userId: string, page = 1, limit = PAGE_LIMIT) => {
    const { data } = await api.get("/eggs", {
      params: { userId, page, limit },
    });
    return data;
  };

const startEggHatching =
  (api: ReturnType<typeof useApi>) => async (id: string) =>
    (await api.post(`/eggs/${id}/hatchStart`)).data;

const finishEggHatching =
  (api: ReturnType<typeof useApi>) => async (id: string) =>
    (await api.post(`/eggs/${id}/finishHatch`)).data;

const quickHatch = (api: ReturnType<typeof useApi>) => async (id: string) =>
  (await api.post(`/eggs/${id}/quickHatch`)).data;

export const useEggs = (userId?: string) => {
  const api = useApi();

  return useInfiniteQuery({
    queryKey: ["eggs", userId],
    enabled: !!userId,
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => getEggs(api)(userId!, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
  });
};

export const useStartEggHatching = () => {
  const api = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: startEggHatching(api),
    onSuccess: (egg) => {
      qc.invalidateQueries({ queryKey: ["eggs"] });
      // Schedule local notification for when egg is ready
      if (egg?.hatchEndTime) {
        scheduleEggReadyNotification(egg._id, new Date(egg.hatchEndTime));
      }
    },
  });
};

export const useFinishEggHatching = () => {
  const api = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: finishEggHatching(api),
    onSuccess: (_result, eggId) => {
      qc.invalidateQueries({ queryKey: ["eggs"] });
      // Cancel the scheduled notification since egg has hatched
      cancelEggNotification(eggId);
    },
  });
};

export const useQuickHatch = () => {
  const api = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: quickHatch(api),
    onSuccess: (_result, eggId) => {
      qc.invalidateQueries({ queryKey: ["eggs"] });
      // Cancel the scheduled notification since egg was quick-hatched
      cancelEggNotification(eggId);
    },
  });
};

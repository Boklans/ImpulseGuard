import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";

export const useImpulses = (userId?: string) => {
  const api = useApi();

  const fetchImpulses = async (page = 1, limit = 10) => {
    const { data } = await api.get("/impulses", {
      params: { userId, page, limit },
    });
    return data;
  };

  return useInfiniteQuery({
    queryKey: ["impulses", userId],
    enabled: !!userId,
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => fetchImpulses(pageParam),
    getNextPageParam: (last) =>
      last.currentPage < last.totalPages ? last.currentPage + 1 : undefined,
  });
};

export const useCreateImpulse = (userId: string) => {
  const api = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; avatarUrl: string }) =>
      api.post("/impulses", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["impulses", userId] });
    },
  });
};

export const useDeleteImpulse = (userId: string) => {
  const api = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (impulseId: string) => api.delete(`/impulses/${impulseId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["impulses", userId] });
    },
  });
};

export const useUpdateImpulse = (userId: string) => {
  const api = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      impulseId,
      data,
    }: {
      impulseId: string;
      data: { name?: string; description?: string; avatarUrl?: string };
    }) => api.patch(`/impulses/${impulseId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["impulses", userId] });
    },
  });
};

export const useFinishSession = () => {
  const api = useApi();
  const qc = useQueryClient();

  const finishSession = async ({
    impulseId,
    userId,
    status,
    selectedPetId,
    duration,
  }: {
    impulseId: string;
    userId: string;
    status: boolean;
    selectedPetId: string;
    duration: number;
  }) => {
    const { data } = await api.post(`/impulses/${impulseId}/finish-session`, {
      userId,
      status,
      selectedPetId,
      duration,
    });
    return data;
  };

  return useMutation({
    mutationFn: finishSession,
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ["impulses", userId] });
    },
  });
};

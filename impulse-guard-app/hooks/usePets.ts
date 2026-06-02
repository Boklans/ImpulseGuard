import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { UpdatePetDto } from "@/api/pets/pets.types";
import { getPets, revivePet, updatePet } from "@/api/pets/petsApi";
import { AxiosError } from "axios";

export const usePets = (userId?: string, aliveOnly = false) => {
  return useInfiniteQuery({
    queryKey: ["pets", userId, aliveOnly],
    queryFn: ({ pageParam = 1 }) => getPets(userId!, pageParam, 10, aliveOnly),
    initialPageParam: 1,
    enabled: !!userId,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });
};

export const useUpdatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ petId, data }: { petId: string; data: UpdatePetDto }) =>
      updatePet(petId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
    onError: (err) => {
      console.log(err, err.message, err.name);
      if (err instanceof AxiosError) {
        console.log(err.code, err.status, err.response?.data);
      }
    },
  });
};

export const useRevivePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (petId: string) => revivePet(petId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
    onError: (err) => {
      console.log("Revive error:", err, err.message, err.name);
      if (err instanceof AxiosError) {
        console.log(err.code, err.status, err.response?.data);
      }
    },
  });
};

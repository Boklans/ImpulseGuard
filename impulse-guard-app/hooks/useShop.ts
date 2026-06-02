import { useApi } from "@/hooks/useApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type EggRarity = "common" | "rare" | "epic" | "legendary";

export interface EggPrices {
  common: { buy: number; sell: number };
  rare: { buy: number; sell: number };
  epic: { buy: number; sell: number };
  legendary: { buy: number; sell: number };
}

export const useEggPrices = () => {
  const api = useApi();

  return useQuery({
    queryKey: ["shop", "prices"],
    queryFn: async (): Promise<EggPrices> => {
      const { data } = await api.get("/shop/prices");
      return data;
    },
  });
};

export const useSellEgg = () => {
  const api = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (eggId: string) => {
      const { data } = await api.post(`/shop/eggs/sell/${eggId}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eggs"] });
    },
  });
};

export const useBuyEgg = () => {
  const api = useApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/shop/eggs/buy", {});
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eggs"] });
    },
  });
};

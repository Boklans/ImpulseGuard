import { client } from "@/utils/client";

export const getStats = async (userId: string) => {
  const response = await client.get("/statistics", {
    params: { userId },
  });

  return response.data;
};

export const getAchievements = async (userId: string, page = 1, limit = 10) => {
  const response = await client.get("/achievements", {
    params: { userId, page, limit },
  });
  return response.data;
};

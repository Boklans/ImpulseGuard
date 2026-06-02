import { client } from "@/utils/client";

export const getItems = async (userId: string, page = 1, limit = 10) => {
  const response = await client.get(`/items`, {
    params: { userId, page, limit },
  });
  return response.data;
};

export const useItem = async (petId: string, itemRef: string) => {
  console.log(client.defaults.baseURL);

  const response = await client.post("/items/use", { petId, itemRef });
  return response.data;
};

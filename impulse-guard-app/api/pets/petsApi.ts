import { client } from "@/utils/client";

export const getPets = async (
  userId: string,
  page = 1,
  limit = 10,
  aliveOnly = false
) => {
  const response = await client.get("/pets", {
    params: { page, limit, aliveOnly },
  });
  return response.data;
};

export const updatePet = async (petId: string, data: any) => {
  const response = await client.patch(`/pets/${petId}`, data);
  return response.data;
};

export const revivePet = async (petId: string) => {
  console.log(`Revive pet ${petId}`);
  const response = await client.post(`/pets/${petId}/revive`);
  return response.data;
};

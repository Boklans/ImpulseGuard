import {client} from "@/utils/client";

export const getLevelsRewards = async (userId?: string) => {
    const response = await client.get(`/users/level-rewards`, {
        params: { userId},
    });
    return response.data;
};

export const confirmLevelReward = async (userId?: string, level?: number) => {
    await client.post(`/users/claim-reward`, {
        userId, level
    });
}
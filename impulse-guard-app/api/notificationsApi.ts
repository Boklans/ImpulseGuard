import {client} from "@/utils/client";

export async function setUpNotifications(userId: string, token: string) {
    await client.post("/notifications/settings", { userId, token }, );
}
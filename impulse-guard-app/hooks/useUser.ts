import { useApi } from "@/hooks/useApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const makeUserApi = (api: ReturnType<typeof useApi>) => ({
  setStreakGoal: (userId: string, goal: number) =>
    api.post(`/users/${userId}/streak-goal`, { goal }).then((r) => r.data),

  declineStreakGoal: (userId: string) =>
    api.post(`/users/${userId}/streak-goal/decline`).then((r) => r.data),

  deleteUser: (userId: string) =>
    api.delete(`/users/${userId}`).then((r) => r.data),

  checkStreak: (userId: string) =>
    api.post(`/users/${userId}/check-streak`).then((r) => r.data),

  getNotifSettings: (userId: string) =>
    api
      .get("/notifications/settings", { params: { userId } })
      .then((r) => r.data),

  patchNotifSettings: (userId: string, settings: Record<string, boolean>) =>
    api
      .patch("/notifications/settings", { userId, ...settings })
      .then((r) => r.data),

  setAvatar: (userId: string, avatar: string) =>
    api.patch(`/users/${userId}`, { avatar }).then((r) => r.data),

  updateUser: (userId: string, data: { username?: string }) =>
    api.patch(`/users/${userId}`, data).then((r) => r.data),
});

export const useNotificationsSettings = (userId: string) => {
  const api = useApi();
  const userApi = makeUserApi(api);

  return useQuery({
    queryKey: ["notifSettings", userId],
    enabled: !!userId,
    queryFn: () => userApi.getNotifSettings(userId!),
  });
};

export const useSetStreakGoal = () => {
  const api = useApi();
  const userApi = makeUserApi(api);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, goal }: { userId: string; goal: number }) =>
      userApi.setStreakGoal(userId, goal),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
};

export const useDeclineStreakGoal = () => {
  const api = useApi();
  const userApi = makeUserApi(api);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userApi.declineStreakGoal(userId),
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
};

export const useDeleteUser = () => {
  const api = useApi();
  const userApi = makeUserApi(api);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
};

export const usePatchNotifSettings = () => {
  const api = useApi();
  const userApi = makeUserApi(api);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      settings,
    }: {
      userId: string;
      settings: Record<string, boolean>;
    }) => userApi.patchNotifSettings(userId, settings),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ["notifSettings", userId] });
    },
  });
};

export const useCheckUserStreak = () => {
  const api = useApi();
  const userApi = makeUserApi(api);

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => userApi.checkStreak(userId),
  });
};

export const useSetAvatar = () => {
  const api = useApi();
  const userApi = makeUserApi(api);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, avatar }: { userId: string; avatar: string }) =>
      userApi.setAvatar(userId, avatar),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
};

export const useUpdateUser = () => {
  const api = useApi();
  const userApi = makeUserApi(api);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { username?: string } }) =>
      userApi.updateUser(userId, data),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
};

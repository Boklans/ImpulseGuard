import axios from "axios";
import { BASE_URL } from "@/constants/Config";
import type { GetToken } from "@clerk/types";
import { router } from "expo-router";

export const createApiClient = (getToken: GetToken) => {
  const api = axios.create({ baseURL: BASE_URL });

  api.interceptors.request.use(async (config) => {
    const jwt = await getToken();
    if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    async (err) => {
      if (err?.response?.status === 401) {
        router.replace("/(auth)/sign-in");
      }
      return Promise.reject(err);
    }
  );

  return api;
};

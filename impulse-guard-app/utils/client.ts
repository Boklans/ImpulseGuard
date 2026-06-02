import { BASE_URL } from "@/constants/Config";
import { store } from "@/redux/store";
import axios from "axios";

const client = axios.create({
  baseURL: BASE_URL,
});

client.interceptors.request.use(
  async (config) => {
    const token = store.getState().user.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error?.response?.status === 401) {
      store.dispatch({ type: "user/logout" });
    }
    return Promise.reject(error);
  }
);

export { client };

import { useMemo } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { createApiClient } from "@/utils/api";

export const useApi = () => {
  const { getToken } = useAuth();
  return useMemo(() => createApiClient(getToken), [getToken]);
};

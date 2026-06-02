import React, { createContext, useContext, ReactNode } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type User = {
  didWatchOnBoarding: boolean;
  didWatchSessionGuid: boolean;
};

const initialState: User = {
  didWatchOnBoarding: false,
  didWatchSessionGuid: false,
};

const USER_LOCAL_STORAGE_KEY = "USER_LOCAL_STORAGE";

const fetchUser = async (): Promise<User> => {
  const user = await AsyncStorage.getItem(USER_LOCAL_STORAGE_KEY);
  return user ? (JSON.parse(user) as User) : initialState;
};

const saveDidWatch = async (updatedUser: Partial<User>): Promise<void> => {
  const user = await fetchUser();
  const newUserState = { ...user, ...updatedUser };
  await AsyncStorage.setItem(
    USER_LOCAL_STORAGE_KEY,
    JSON.stringify(newUserState)
  );
};

export const useUserLocalStorage = () => {
  return useQuery<User>({
    queryKey: ["user-local"],
    queryFn: fetchUser,
  });
};

export const useSetDidWatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveDidWatch,
    onSuccess: (_, updatedUser) => {
      queryClient.setQueryData(["user"], (u: User | undefined) =>
        u ? { ...u, ...updatedUser } : { ...initialState, ...updatedUser }
      );
    },
  });
};

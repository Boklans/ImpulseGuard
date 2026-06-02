// store/features/user/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./types";

interface UserState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastSessionRewards: { [key: string]: {amount: number, id : number} };
}

const initialState: UserState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  lastSessionRewards: {}
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateUserPartially: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload } ;
      }
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLastSessionRewards: (
        state,
        action: PayloadAction<{ [key: string]: {amount: number, id : number} }>
    ) => {
      state.lastSessionRewards = action.payload;
    },

  },
});

export const { setCredentials, logout, updateUser, setIsLoading, setLastSessionRewards, updateUserPartially } = userSlice.actions;
  userSlice.actions;

export default userSlice.reducer;

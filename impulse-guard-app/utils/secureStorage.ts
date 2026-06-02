import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export async function saveToken(token: string | null) {
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

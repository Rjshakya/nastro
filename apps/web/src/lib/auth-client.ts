import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_API_URL,
});

export const login = async () => {
  try {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: import.meta.env.PUBLIC_CLIENT_URL + "/dashboard",
    });
  } catch (e) {
    console.error("failed to signin");
  }
};


export const logout = async() => await authClient.signOut()
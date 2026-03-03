import { createAuthClient } from "better-auth/react";
import { Env } from "env";

export const authClient = createAuthClient({
  baseURL: Env.apiUrl,
});

export const login = async () => {
  try {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: Env.clientUrl + "/dashboard",
    });
  } catch (e) {
    console.error("failed to signin");
  }
};

export const logout = async () => await authClient.signOut();

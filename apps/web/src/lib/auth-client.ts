import { createAuthClient } from "better-auth/react";
import { Env } from "@/lib/env";
import { redirect } from "@tanstack/react-router";
import { getRouter } from "@/router";
import { toast } from "sonner";

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
    console.error("failed to signin", e);
    toast.error("Failed to signIn ; please try again later");
  }
};

export const logout = async () => {
  await authClient.signOut();
  const router = getRouter();
  await router.invalidate();
};

export const protectedLoader = async () => {
  const { data } = await authClient.getSession();

  if (!data?.session.id) {
    throw redirect({ to: "/" });
  }
};

export const handleConnectNotion = async () => {
  await authClient.linkSocial({
    provider: "notion",
    callbackURL: Env.clientUrl + "/dashboard",
  });
};

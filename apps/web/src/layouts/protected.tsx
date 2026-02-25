import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Protected = ({ children, fallback }: Props) => {
  const { data, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !data?.session) {
      window.location.href = "/login";
    }
  }, [data, isPending]);

  if (isPending) {
    return fallback || <div>Checking authentication...</div>;
  }

  if (!data?.session) {
    return null;
  }

  return <>{children}</>;
};

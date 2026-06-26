import { useCallback, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const useCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);

  const checkout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authClient.checkout({
        slug: "pro",
      });
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { checkout, isLoading };
};

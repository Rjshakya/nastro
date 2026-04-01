import { toast } from "sonner";

type ErrorRes = {
  message: string;
  statusCode: number;
  error?: any;
  throwError?: boolean;
  showToast: boolean;
};

export const handleHttpError = () => {
  return (error: ErrorRes) => {
    const message = error?.message || "An unexpected error occurred";
    console.error("HTTP Error:", error);

    if (error?.showToast) {
      toast.error(message);
    }

    if (error?.throwError) {
      throw new Error(message);
    }
  };
};

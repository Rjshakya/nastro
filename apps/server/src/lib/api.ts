export const ApiResponse = <T, E, M extends string>({
  data,
  error,
  message,
}: {
  data: T;
  message: M;
  error?: E;
}) => ({ data, message, error });

import { useEffect, useState } from "react";

export const useDebounce = <T>(initialValue: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;

    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => setDebouncedValue(value), delay);
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [value]);

  return {
    debouncedValue,
    initialValue,
    value,
    setValue,
  };
};

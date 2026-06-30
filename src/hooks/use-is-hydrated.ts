import { useEffect, useLayoutEffect, useState } from "react";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

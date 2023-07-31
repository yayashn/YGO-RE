import Roact from "@rbxts/roact";
import { HttpService } from "@rbxts/services";

function memoize<F extends (...args: any[]) => any>(func: F): F {
  const cache = new Map();
  return ((...args: unknown[]) => {
      const key = HttpService.JSONEncode(args);
      if (cache.has(key)) {
          return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
  }) as F;
}

export function RoactMemo<P extends {}>(component: Roact.FunctionComponent<P>): Roact.FunctionComponent<P> {
  return memoize(component);
}

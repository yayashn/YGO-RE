import { setTimeout, clearTimeout } from "@rbxts/roact-hooked-plus";

type Procedure = (...args: unknown[]) => void;

interface DebounceOptions {
  leading?: boolean;
  maxWait?: number;
  trailing?: boolean;
}

export default function debounce<F extends Procedure>(
  func: F,
  waitMilliseconds = 50,
  options: DebounceOptions = {}
): F {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastInvokeTime = os.time() * 1000;
  let result: unknown;

  const {
    leading = false,
    maxWait,
    trailing = true
  } = options;

  function nextInvokeTimeout(timeSinceLastCall: number, timeSinceLastInvoke: number) {
    if (maxWait !== undefined) {
      return math.min(maxWait - timeSinceLastInvoke, waitMilliseconds - timeSinceLastCall);
    }
    return waitMilliseconds - timeSinceLastCall;
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastInvokeTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    return (!lastInvokeTime || (timeSinceLastCall >= waitMilliseconds) || (timeSinceLastCall < 0) || (maxWait !== undefined && timeSinceLastInvoke >= maxWait));
  }

  function invokeFunc(time: number, args: unknown[]) {
    lastInvokeTime = time;
    result = func(...args);
  }

  function startTimer(time: number, args: unknown[]) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (trailing) {
        invokeFunc(os.time() * 1000, args);
      }
      timeoutId = undefined;
    }, nextInvokeTimeout(time - lastInvokeTime, time - lastInvokeTime));
  }

  function debounced(this: ThisParameterType<F>, ...args: Parameters<F>) {
    const time = os.time() * 1000;

    startTimer(time, args);

    if (shouldInvoke(time)) {
      invokeFunc(time, args);
    }

    return result as ReturnType<F>;
  }

  return debounced as unknown as F;
}

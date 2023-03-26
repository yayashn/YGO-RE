import { useState, useEffect } from "@rbxts/roact-hooked";

type Global<T> = { init: T };
type GlobalState<T> = { value: T, listeners: Set<() => void> };

export const createGlobalState = <T>(initialValue: T): Global<T> => ({ init: initialValue });

const globalStateMap = new WeakMap<Global<any>, GlobalState<any>>();

const getGlobalState = <T>(global: Global<T>): GlobalState<T> => {
  let globalState = globalStateMap.get(global);
  if (!globalState) {
    globalState = { value: global.init, listeners: new Set() };
    globalStateMap.set(global, globalState);
  }
  return globalState;
};

export const useGlobalState = <T>(global: Global<T>): [T, (nextValue: T) => void] => {
  const globalState = getGlobalState(global);
  const [value, setValue] = useState<T>(globalState.value);

  useEffect(() => {
    const callback = () => setValue(globalState.value);

    globalState.listeners.add(callback);
    callback();

    return () => globalState.listeners.delete(callback);
  }, [globalState]);

  const setGlobal = (nextValue: T) => {
    globalState.value = nextValue;
    globalState.listeners.forEach((listener) => listener());
  };

  return [value, setGlobal];
};
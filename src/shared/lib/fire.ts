type Callback<T, A extends unknown[]> = (...args: A) => T;

export function fire<T, A extends unknown[]>(event: BindableEvent<Callback<T | void, A>>, ...args: A): Promise<void> {
  return new Promise((resolve) => {
    event.Fire(...args);
    resolve();
  });
}

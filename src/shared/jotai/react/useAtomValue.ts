import { useDebugValue, useEffect, useReducer } from '@rbxts/roact'
import type { ReducerWithoutAction } from '@rbxts/roact'
import type { Atom } from 'shared/jotai/vanilla/atom'
import { useStore } from 'shared/jotai/react/Provider'
import { setTimeout } from '@rbxts/set-timeout'
import { ExtractAtomValue } from '../vanilla/typeUtils'

type Store = ReturnType<typeof useStore>

const isPromiseLike = (x: unknown): x is PromiseLike<unknown> => {
  const maybePromise = x as { then?: unknown };
  try {
    return typeIs(maybePromise?.then, "function");
  } catch {
    return false;
  }
};
const use =
  (<T>(
    promise: PromiseLike<T> & {
      status?: 'pending' | 'fulfilled' | 'rejected'
      value?: T
      reason?: unknown
    }
  ): T => {
    if (promise.status === 'pending') {
      throw promise
    } else if (promise.status === 'fulfilled') {
      return promise.value as T
    } else if (promise.status === 'rejected') {
      throw promise.reason
    } else {
      promise.status = 'pending';
      (promise as Promise<T>).then(
        (v: T) => {
          promise.status = 'fulfilled'
          promise.value = v
        },
        (e: T) => {
          promise.status = 'rejected'
          promise.reason = e
        }
      )
      throw promise
    }
  })

type Options = {
  store?: Store
  delay?: number
}

export function useAtomValue<Value>(
  atom: Atom<Value>,
  options?: Options
): Awaited<Value>

export function useAtomValue<AtomType extends Atom<any>>(
  atom: AtomType,
  options?: Options
): Awaited<ExtractAtomValue<AtomType>>

export function useAtomValue<Value>(atom: Atom<Value>, options?: Options) {
  const store = useStore(options)

  const [[valueFromReducer, storeFromReducer, atomFromReducer], rerender] =
    useReducer<
      ReducerWithoutAction<readonly [Value, Store, typeof atom]>,
      undefined
    >(
      (prev) => {
        const nextValue = store.get(atom)
        if (
          rawequal(prev[0], nextValue) &&
          prev[1] === store &&
          prev[2] === atom
        ) {
          return prev
        }
        return [nextValue, store, atom]
      },
      undefined,
      () => [store.get(atom), store, atom]
    )

  let value = valueFromReducer
  if (storeFromReducer !== store || atomFromReducer !== atom) {
    rerender()
    value = store.get(atom)
  }

  const delay = options?.delay
  useEffect(() => {
    const unsub = store.sub(atom, () => {
      if (typeOf(delay) === 'number') {
        // delay rerendering to wait a promise possibly to resolve
        setTimeout(rerender, delay!)
        return
      }
      rerender()
    })
    rerender()
    return unsub
  }, [store, atom, delay])

  useDebugValue(value)
  // TS doesn't allow using `use` always.
  // The use of isPromiseLike is to be consistent with `use` type.
  // `instanceof Promise` actually works fine in this case.
  return isPromiseLike(value) ? use(value) : (value as Awaited<Value>)
}

import { useMemo } from '@rbxts/roact'
import { useSetAtom } from '../../react/useSetAtom'
import { atom } from '../../vanilla/atom'
import type { Getter, Setter } from '../../vanilla/typeUtils'

type Options = Parameters<typeof useSetAtom>[1]

export function useAtomCallback<Result, Args extends unknown[]>(
  callback: (get: Getter, set: Setter, ...arg: Args) => Result,
  options?: Options
): (...args: Args) => Result {
  const anAtom = useMemo(
    () => atom(undefined, (get, set, ...args: Args) => callback(get, set, ...args)),
    [callback]
  )
  return useSetAtom(anAtom, options)
}

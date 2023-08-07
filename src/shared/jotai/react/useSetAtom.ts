import { useCallback } from '@rbxts/roact'
import type {
  ExtractAtomArgs,
  ExtractAtomResult,
  WritableAtom,
} from '../vanilla-index'
import { useStore } from 'shared/jotai/react/Provider'

type SetAtom<Args extends any[], Result> = (...args: Args) => Result
type Store = ReturnType<typeof useStore>

type Options = {
  store?: Store
}

export function useSetAtom<Value, Args extends any[], Result>(
  atom: WritableAtom<Value, Args, Result>,
  options?: Options
): SetAtom<Args, Result>

export function useSetAtom<AtomType extends WritableAtom<any, any[], any>>(
  atom: AtomType,
  options?: Options
): SetAtom<ExtractAtomArgs<AtomType>, ExtractAtomResult<AtomType>>

export function useSetAtom<Value, Args extends unknown[], Result>(
  atom: WritableAtom<Value, Args, Result>,
  options?: Options
) {
  const store = useStore(options)
  const setAtom = useCallback(
    (...args: Args) => {
      return store.set(atom, ...(args as Args))
    },
    [store, atom]
  )
  return setAtom
}

import { atom } from '../../vanilla/atom'
import type { WritableAtom } from '../../vanilla/atom'
import { RESET } from './constants'

type SetStateActionWithReset<Value> =
  | Value
  | typeof RESET
  | ((prev: Value) => Value | typeof RESET)

export function atomWithReset<Value>(initialValue: Value) {
  type Update = SetStateActionWithReset<Value>
  const anAtom = atom<Value, [Update], void>(
    initialValue,
    (get, set, update) => {
      const nextValue =
        typeOf(update) === 'function'
          ? (update as (prev: Value) => Value | typeof RESET)(get(anAtom))
          : update

      set(anAtom, nextValue === RESET ? initialValue : nextValue)
    }
  )
  return anAtom as WritableAtom<Value, [Update], void>
}

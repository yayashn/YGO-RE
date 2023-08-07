import { atom } from '../../vanilla-index'
import type { SetStateAction } from '../../vanilla/typeUtils'
import type { WritableAtom } from '../../vanilla/atom'
import { RESET } from './constants'

type Read<Value, Args extends unknown[], Result> = WritableAtom<
  Value,
  Args,
  Result
>['read']

export function atomWithDefault<Value>(
  getDefault: Read<Value, [SetStateAction<Value> | typeof RESET], void>
) {
  const EMPTY = {}
  const overwrittenAtom = atom<Value | typeof EMPTY>(EMPTY)

  const anAtom = atom(
    (get, options) => {
      const overwritten = get(overwrittenAtom)
      if (overwritten !== EMPTY) {
        return overwritten
      }
      return getDefault(get, options)
    },
    (get, set, update) => {
      if (update === RESET) {
        set(overwrittenAtom, EMPTY)
      } else if (typeOf(update) === 'function') {
        const prevValue = get(anAtom)
        set(overwrittenAtom, (update as (prev: Value) => Value)(prevValue as Value))
      } else {
        set(overwrittenAtom, update as Value)
      }
    }
  )
  return anAtom
}

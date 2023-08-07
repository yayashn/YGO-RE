import { atom } from '../../vanilla/atom'
import type { WritableAtom } from '../../vanilla/atom'

export function atomWithReducer<Value, Action>(
  initialValue: Value,
  reducer: (value: Value, action?: Action) => Value
): WritableAtom<Value, [Action?], void>

export function atomWithReducer<Value, Action>(
  initialValue: Value,
  reducer: (value: Value, action: Action) => Value
): WritableAtom<Value, [Action], void>

export function atomWithReducer<Value, Action>(
  initialValue: Value,
  reducer: (value: Value, action: Action) => Value
) {
  const anAtom: any = atom(initialValue, (get, set, action: Action) =>
    set(anAtom, reducer(get(anAtom), action))
  )
  return anAtom
}

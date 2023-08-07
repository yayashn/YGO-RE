import { useCallback } from '@rbxts/roact'
import { useSetAtom } from '../../react-index'
import { RESET } from '../../vanilla/utils'
import type { WritableAtom } from '../../vanilla/atom'

type Options = Parameters<typeof useSetAtom>[1]

export function useResetAtom(
  anAtom: WritableAtom<unknown, [typeof RESET], unknown>,
  options?: Options
) {
  const setAtom = useSetAtom(anAtom, options)
  const resetAtom = useCallback(() => setAtom(RESET), [setAtom])
  return resetAtom
}

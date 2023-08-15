import { CardTemplate } from "server/types";
import { atom, useAtom } from "shared/jotai";

const store = atom<CardTemplate[] | false>(false)

export default function usepackAnimation() {
    const [state, setState] = useAtom(store)

    return [state, setState] as const
}
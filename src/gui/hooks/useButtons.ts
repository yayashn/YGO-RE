import { atom, useAtom } from "shared/jotai";

type Button = {
    onClick: Callback
    text: string
}

export const buttonsAtom = atom<Button[]>([])

export default function useButtons() {
    const [buttons, setButtons] = useAtom(buttonsAtom)

    return [buttons, setButtons] as const
}
import { Signal } from "@rbxts/beacon";
import { useState } from "@rbxts/roact";
import { CardPublic } from "server/duel/types";
import { useEventListener } from "shared/hooks/useEventListener";

const shoeMenuSignal = new Signal<CardPublic | undefined>()

export default function useShowMenu() {
    const [state, setState] = useState<CardPublic | undefined>(undefined)

    useEventListener(shoeMenuSignal, (card) => {
        setState(card)  
    })

    const setShowMenu = (card: CardPublic | undefined) => {
        shoeMenuSignal.Fire(card)
    }

    return [state, setShowMenu] as const
}
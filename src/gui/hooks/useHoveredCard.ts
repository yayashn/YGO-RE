import { Signal } from "@rbxts/beacon";
import { useState } from "@rbxts/roact";
import { CardPublic } from "server/duel/types";
import { useEventListener } from "shared/hooks/useEventListener";

const hoveredCardSignal = new Signal<CardPublic | undefined>()

export default function useHoveredCard() {
    const [state, setState] = useState<CardPublic | undefined>(undefined)

    useEventListener(hoveredCardSignal, (card) => {
        setState(card)  
    })

    const setHoveredcARD = (card: CardPublic | undefined) => {
        hoveredCardSignal.Fire(card)
    }

    return [state, setHoveredcARD] as const
}
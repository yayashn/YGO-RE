import { useEventListener } from "shared/hooks/useEventListener";
import { useState } from "@rbxts/roact";
import { CardPublic } from "server/duel/types";
import { PlayerRemotes } from "shared/duel/remotes";

const targettableCards = PlayerRemotes.Client.Get("targettableCardsChanged")

export default function useTargettableCards() {
    const [value, setValue] = useState<CardPublic[]>([])

    useEventListener(targettableCards, (newValue) => {
        setValue(newValue)
    })

    return value
}
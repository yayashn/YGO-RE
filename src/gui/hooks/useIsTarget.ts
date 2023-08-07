import { useState } from "@rbxts/roact";
import { CardPublic } from "server/duel/types";
import { PlayerRemotes } from "shared/duel/remotes";
import { useEventListener } from "shared/hooks/useEventListener";

const isTargetChanged = PlayerRemotes.Client.Get("targettedCardsChanged")

export default function useIsTarget(card: CardPublic) {
    const [value, setValue] = useState(false)

    useEventListener(isTargetChanged, (newValue) => {
        setValue(newValue.find(c => c.uid === card.uid) !== undefined)
    })

    return value
}
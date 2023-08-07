import { useState } from "@rbxts/roact";
import { CardPublic } from "server/duel/types";
import { PlayerRemotes } from "shared/duel/remotes";
import { useEventListener } from "shared/hooks/useEventListener";

const isTargettableChanged = PlayerRemotes.Client.Get("targettableCardsChanged")

export default function useIsTargettable(card: CardPublic) {
    const [value, setValue] = useState(false)

    useEventListener(isTargettableChanged, (newValue) => {
        setValue(newValue.find(c => c.uid === card.uid) !== undefined)
    })

    return value
}
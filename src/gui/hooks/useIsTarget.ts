import { useEffect, useState } from "@rbxts/roact";
import { CardPublic } from "server/duel/types";
import { PlayerRemotes } from "shared/duel/remotes";
import { useAsync } from "shared/hooks/useAsync";
import { useEventListener } from "shared/hooks/useEventListener";

const targettedCardsChanged = PlayerRemotes.Client.Get("targettedCardsChanged")
const getTargettedCards = PlayerRemotes.Client.Get("getTargettedCards")

export default function useIsTarget(card: CardPublic) {
    const [value, setValue] = useState(false)

    useAsync(async () => {
        setValue((await getTargettedCards.CallServerAsync()).find(c => c.uid === card.uid) !== undefined)
    }, [])

    useEventListener(targettedCardsChanged, (newValue) => {
        setValue(newValue.find(c => c.uid === card.uid) !== undefined)
    })

    return value
}
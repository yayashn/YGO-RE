import { useEventListener } from "shared/hooks/useEventListener";
import { useState } from "@rbxts/roact";
import { DuelRemotes } from "shared/duel/remotes";

const turnPlayerChanged = DuelRemotes.Client.Get("turnPlayerChanged")

export default function useTurnPlayer() {
    const [player, setPlayer] = useState<Player>()

    useEventListener(turnPlayerChanged, (newPlayer) => {
        setPlayer(newPlayer)
    })

    return player
}
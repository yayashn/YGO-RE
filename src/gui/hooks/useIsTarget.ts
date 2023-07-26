import { useEffect, useState } from "@rbxts/roact-hooked"
import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default (card: Card) => {
    const duel = getDuel(card.owner)!;
    const yPlayer = duel.getPlayer(player);
    const [isTarget, setIsTarget] = useState(false)

    useEffect(() => {
        if(!yPlayer) return
        const connection = yPlayer.targets.changed((newTargets) => {
            setIsTarget((newTargets as unknown as Card[]).includes(card))
        })

        return () => connection.Disconnect()
    }, [yPlayer])

    useEffect(() => {
        if(!isTarget) return
    }, [isTarget])

    return isTarget
}
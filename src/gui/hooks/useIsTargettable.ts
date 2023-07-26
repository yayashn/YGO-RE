import { useEffect, useState } from "@rbxts/roact-hooked"
import type { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel"

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default (card: Card) => {
    const duel = getDuel(card.owner)!;
    const yPlayer = duel.getPlayer(player);
    const [isTargettable, setIsTargettable] = useState(false)

    useEffect(() => {
        if(!yPlayer) return

        const connection = yPlayer.targettableCards.changed((newTargettableCards: Card[]) => {
            setIsTargettable(newTargettableCards.includes(card))
        })

        return () => connection.Disconnect()
    }, [yPlayer])

    useEffect(() => {
        if(!isTargettable) return
    }, [isTargettable])

    return isTargettable
}
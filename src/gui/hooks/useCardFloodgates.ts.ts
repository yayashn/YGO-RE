import { useEffect, useState } from "@rbxts/roact-hooked";
import { FloodgateCard, getCardFloodgates } from "server/functions/floodgates";
import { Card } from "server/ygo/Card";

export default (card: Card) => {
    const [floodgates, setFloodgates] = useState<FloodgateCard[]>([]);

    useEffect(() => {
        const duel = card.duel()
        const connection = duel.floodgates.event.Connect((value) => {
            setFloodgates(getCardFloodgates(card, value as unknown as FloodgateCard[]))
        })

        setFloodgates(getCardFloodgates(card))

        return () => {
            connection.Disconnect()
        }
    }, [])

    return floodgates;
}
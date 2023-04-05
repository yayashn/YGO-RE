import { useEffect, useState } from "@rbxts/roact-hooked";
import { FloodgateCard, getCardFloodgates } from "server/functions/floodgates";
import { CardFolder, DuelFolder } from "server/types";

export default (card: CardFolder) => {
    const [floodgates, setFloodgates] = useState<FloodgateCard[]>([]);

    useEffect(() => {
        const duel = card.controller.Value.Parent as DuelFolder
        const connection = duel.floodgates.Changed.Connect((value) => {
            setFloodgates(getCardFloodgates(card, value))
        })

        setFloodgates(getCardFloodgates(card))

        return () => {
            connection.Disconnect()
        }
    }, [])

    return floodgates;
}
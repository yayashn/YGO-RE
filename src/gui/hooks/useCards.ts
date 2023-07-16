import { useEffect, useState } from "@rbxts/roact-hooked";
import useDuel from "./useDuel";
import { Card } from "server/ygo/Card";

type CardValue = "location" | "controller"

export default (player: Player) => {
    const duel = useDuel()
    const [cards, setCards] = useState<Card[]>([]);

    useEffect(() => {
        if(!duel) {
            setCards([])
            return;
        };

        const playerValue = [duel.player1, duel.player2].find((p) => p.player === player)!;
        setCards(playerValue.cards.get())

        const connections: RBXScriptConnection[] = [];
        const values: CardValue[] = ["location", "controller"];

        cards!.forEach((card) => {
            values.forEach((v) => {
                connections.push(card[v].event.Connect(() => {
                    setCards([...cards!]);
                }))
            })
        })

        return () => {
            connections.forEach((c) => {
                c.Disconnect();
            })
        }
    }, [duel])

    return cards;
}
import { useEffect, useState } from "@rbxts/roact-hooked";
import { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";

type CardValue = "location" | "controller"

export default (player: Player) => {
    const duel = getDuel(player);
    const [cards, setCards] = useState<Card[]>([]);

    useEffect(() => {
        if(!duel) {
            setCards([])
            return;
        };

        const playerValue = [duel.player1, duel.player2].find((p) => p.player === player)!;
        setCards(playerValue.cards)

        const connections: RBXScriptConnection[] = [];
        const values: CardValue[] = ["location", "controller"];

        cards!.forEach((card) => {
            values.forEach((v) => {
                connections.push(card[v].changed(() => {
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
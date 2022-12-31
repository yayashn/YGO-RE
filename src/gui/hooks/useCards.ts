import { useEffect, useState } from "@rbxts/roact-hooked";
import useDuel from "./useDuel";
import { CardFolder } from "server/ygo";

type CardValue = "location" | "controller"

export default (player: Player) => {
    const duel = useDuel()
    const [cards, setCards] = useState<CardFolder[]>([]);

    useEffect(() => {
        if(!duel) {
            setCards([])
            return;
        };

        const playerValue = [duel.player1, duel.player2].find((p) => p.Value === player)!;
        setCards(playerValue.WaitForChild("cards").GetChildren() as CardFolder[])

        const connections: RBXScriptConnection[] = [];
        const values: CardValue[] = ["location", "controller"];

        cards!.forEach((card) => {
            values.forEach((v) => {
                connections.push(card[v].Changed.Connect(() => {
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
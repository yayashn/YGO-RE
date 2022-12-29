import { useEffect, useState } from "@rbxts/roact-hooked";
import useDuel from "./useDuel";
import { CardFolder } from "server/ygo";

export default (player: Player) => {
    const duel = useDuel()
    const [cards, setCards] = useState<CardFolder[]>();

    useEffect(() => {
        if(!duel) {
            setCards(undefined)
            return;
        };
        const playerValue = [duel.player1, duel.player2].find((p) => p.Value === player)!;
        setCards(playerValue.WaitForChild("cards").GetChildren() as CardFolder[])
    }, [duel, ...(cards?.map((c) => c.location.Value) || []), ...(cards?.map((c) => c.controller.Value) || [])])

    return cards;
}
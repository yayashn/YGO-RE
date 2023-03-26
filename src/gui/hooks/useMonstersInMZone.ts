import { useEffect, useState } from "@rbxts/roact-hooked";
import type { CardFolder } from "server/types";
import useCards from "./useCards";
import { getDuel } from "server/utils";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default () => {
    const [duel, YGOPlayer, YGOOpponent] = getDuel(player)!;
    const playerCards = useCards(player);
    const opponentCards = useCards(YGOOpponent.Value);
    let allCards: CardFolder[] = [];
    if(playerCards) {
        allCards = [...allCards, ...playerCards];
    }
    if(opponentCards) {
        allCards = [...allCards, ...opponentCards];
    }
    const [monstersInMZone, setMonstersInMZone] = useState<CardFolder[]>([]);

    useEffect(() => {
        if(YGOPlayer === undefined || YGOOpponent === undefined) return;
        const cardsControlledByPlayer = allCards.filter((c) => c.controller.Value === YGOPlayer);
        setMonstersInMZone(cardsControlledByPlayer.filter(c => c.location.Value.match("MZone").size() > 0))
    }, [playerCards, opponentCards])

    return monstersInMZone;
}
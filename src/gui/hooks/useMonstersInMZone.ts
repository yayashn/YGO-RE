import { useEffect, useState } from "@rbxts/roact-hooked";
import type { CardFolder } from "server/types";
import useCards from "./useCards";
import { getDuel } from "server/utils";
import { Card } from "server/ygo/Card";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default () => {
    const [duel, YGOPlayer, YGOOpponent] = getDuel(player)!;
    const playerCards = useCards(player);
    const opponentCards = useCards(YGOOpponent.player);
    let allCards: Card[] = [];
    if(playerCards) {
        allCards = [...allCards, ...playerCards];
    }
    if(opponentCards) {
        allCards = [...allCards, ...opponentCards];
    }
    const [monstersInMZone, setMonstersInMZone] = useState<Card[]>([]);

    useEffect(() => {
        if(YGOPlayer === undefined || YGOOpponent === undefined) return;
        const cardsControlledByPlayer = allCards.filter((c) => c.controller.get() === YGOPlayer);
        setMonstersInMZone(cardsControlledByPlayer.filter(c => c.location.get().match("MZone").size() > 0))
    }, [playerCards, opponentCards])

    return monstersInMZone;
}
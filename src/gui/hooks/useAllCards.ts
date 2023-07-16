import { getDuel } from "server/utils";
import useCards from "./useCards"
import { useEffect } from "@rbxts/roact-hooked";

const player = script.FindFirstAncestorWhichIsA("Player")!

export default () => {
    const [duel, YGOPlayer, YGOOpponent] = getDuel(player)!
    const cards = useCards(player);
    const cardsOpponent = useCards(YGOOpponent.player);
    const allCards = [...cards, ...cardsOpponent];
    
    const getCardsIn = (field: "MZone" | "SZone" | "Both", all?: boolean) => {
        return (all ? allCards : allCards.filter(card => card.controller.get().player === player)).filter((card) => {
            const MZone = card.location.get().match("MZone").size() > 0
            const SZone = card.location.get().match("SZone").size() > 0
            if (field === "Both") {
                return MZone || SZone
            } else {
                return card.location.get().match(field).size() > 0
            }
        })
    }

    return {
        allCards,
        getCardsIn
    };
}
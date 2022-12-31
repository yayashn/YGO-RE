import { getDuel } from "server/utils";
import useCards from "./useCards"
import { useEffect } from "@rbxts/roact-hooked";

const player = script.FindFirstAncestorWhichIsA("Player")!

export default () => {
    const [duel, YGOPlayer, YGOOpponent] = getDuel(player)!
    const cards = useCards(player);
    const cardsOpponent = useCards(YGOOpponent.Value);
    const allCards = [...cards, ...cardsOpponent];
    
    const getCardsIn = (field: "MZone" | "SZone" | "Both", all?: boolean) => {
        return (all ? allCards : allCards.filter(card => card.controller.Value.Value === player)).filter((card) => {
            const MZone = card.location.Value.match("MZone").size() > 0
            const SZone = card.location.Value.match("SZone").size() > 0
            if (field === "Both") {
                return MZone || SZone
            } else {
                return card.location.Value.match(field).size() > 0
            }
        })
    }

    return {
        allCards,
        getCardsIn
    };
}
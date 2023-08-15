import { getDuel } from "../duel";
import { CardPublic } from "../types";
import { getCards, getPublicCard } from "../utils";

export const getPublicCards = (player: Player) => {
    const duel = getDuel(player)!;
    const realCards = getCards(duel);

    const publicCards: CardPublic[] = realCards.map(card => getPublicCard(player, card))

    return publicCards;
}
import { DuelRemotes } from "shared/duel/remotes";
import { getDuel } from "./duel";
import { CardPublic, Location } from "./types";
import { getFilteredCards } from "./utils";
import { includes } from "shared/utils";

const surrender = (player: Player) => {
    const duel = getDuel(player)!;
    const opponent = duel.getOpponent(player);
    duel.endDuel(opponent, `${player.DisplayName} surrendered!`);
}

const getPublicZoneCards = (player: Player, zone: Location, isOpponentZone?: boolean) => {
    if(!["GZone", "BZone", "EZone"].includes(zone)) return [];

    const duel = getDuel(player)!;
    const opponent = duel.getOpponent(player);
    const controller = isOpponentZone ? opponent.player : player;

    if(zone === "EZone" && isOpponentZone) {
        return []
    }

    return getFilteredCards(duel, {
        location: [zone as Location],
        controller: [controller],
        position: ["FaceUp"],
    })
}

const getCards = (player: Player) => {
    const duel = getDuel(player)!;

    const realCards = getFilteredCards(duel, {})

    const publicCards: CardPublic[] = realCards.map(card => {
        const publicKnowledge = (includes(card.position.get(), "FaceUp") || card.location.get() !== "Deck" ? player === card.controller.get() : false)
        return {
            uid: card.uid,
            position: card.position.get(),
            location: card.location.get(),
            controller: card.controller.get(),
            order: card.order.get(),
            atk: publicKnowledge ? card.getAtk() : undefined,
            def: publicKnowledge ? card.getDef() : undefined,
            art: publicKnowledge ? card.art : "",
            name: publicKnowledge ? card.name.get() : "",
        }
    })

    return publicCards;
}
DuelRemotes.Server.Get("getCards").SetCallback(getCards)
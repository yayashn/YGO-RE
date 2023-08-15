import { PlayerRemotes } from "shared/duel/remotes";
import { getDuel } from "../duel";
import { getPublicCard } from "../utils";

PlayerRemotes.Server.Get("getTargettedCards").SetCallback((player) => {
    const duel = getDuel(player)!;
    const yPlayer = duel.getPlayer(player);
    const targettedCards = yPlayer.targettedCards.get();
    return targettedCards.map(card => {
        return getPublicCard(player, card)
    })
})
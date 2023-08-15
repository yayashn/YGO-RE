import { PlayerRemotes } from "shared/duel/remotes";
import { getDuel } from "../duel";
import { CardAction } from "../types";
import { getAllowedActions } from "./getAllowedActions";

PlayerRemotes.Server.Get("handleCardClick").SetCallback((player, card) => {
    const duel = getDuel(player)!;
    
   //try {
   //    const c = getFilteredCards(duel, { uid: [card.uid] })[0];
   //    if(c.name.get() !== "Trap Hole") throw error("not trap hole");
   //    print(duel.cardFloodgates.get())
   //    print(cardEffects[c.name.get()](c)[0].condition!());
   //} catch {}

    const yPlayer = duel.getPlayer(player);
    const isTargettable = yPlayer.targettableCards.get().find((c) => c.uid === card.uid) !== undefined;

    if(duel.busy.get() === true) {
        return false
    }

    if(isTargettable) {
        yPlayer.handleTarget(card.uid)
    } else {
        return getAllowedActions(player, card) as CardAction[]
    }

    return false
})
import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel";
import { getFilteredCards } from "server/duel/utils";

export default (card: Card) => {
    const controller = card.getController();
    const duel = getDuel(controller.player)!;

    const oneBottomZoneAvailable = getFilteredCards(duel, {
        controller: [controller.player],
        location: ["SZone1", "SZone2", "SZone3", "SZone4", "SZone5"]
    }).size() < 5
    const inHand = card.location.get() === 'Hand'
    const inBottomRow = ["SZone1", "SZone2", "SZone3", "SZone4", "SZone5"].includes(card.location.get())
    const activated = card.activated.get()
    const isActor = duel.actor.get() === controller
    const canActivate = !card.hasFloodgate("CANNOT_ACTIVATE") && !controller.getFloodgates("CANNOT_ACTIVATE_CARD")?.some(f => f.value === card.name.get())

    return isActor && ((inHand && oneBottomZoneAvailable) || inBottomRow) && !activated && canActivate
}
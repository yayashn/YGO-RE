import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"

export default (card: Card) => {
    const controller = card.getController();
    const duel = getDuel(controller.player)!;

    const inBottomRow = ["SZone1", "SZone2", "SZone3", "SZone4", "SZone5"].includes(card.location.get())
    const activated = card.activated.get()
    const isActor = duel.actor.get() === controller
    const canActivate = !card.getFloodgates("CANNOT_ACTIVATE");

    return isActor && inBottomRow && !activated && canActivate
}
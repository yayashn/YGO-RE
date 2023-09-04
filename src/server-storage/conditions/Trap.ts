import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import { includes } from "shared/utils";

export default (card: Card) => {
    const controller = card.getController();
    const duel = getDuel(controller.player)!;

    const inBottomRow = includes(card.location.get(), "SZone");
    const activated = card.activated.get()
    const isActor = duel.actor.get() === controller
    const canActivate = !card.hasFloodgate("CANNOT_ACTIVATE") && !controller.getFloodgates("CANNOT_ACTIVATE_CARD")?.some(f => f.value === card.name.get())

    return isActor && inBottomRow && !activated && canActivate
}
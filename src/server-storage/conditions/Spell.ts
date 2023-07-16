import { getFilteredCards } from 'server/utils'
import { Card } from 'server/ygo/Card'

export default (card: Card) => {
    const controller = card.controller.get()
    const duel = controller.getDuel()

    const oneBottomZoneAvailable = getFilteredCards(duel, {
        controller: [controller],
        location: ["SZone1", "SZone2", "SZone3", "SZone4", "SZone5"]
    }).size() < 5
    const inHand = card.location.get() === 'Hand'
    const inBottomRow = ["SZone1", "SZone2", "SZone3", "SZone4", "SZone5"].includes(card.location.get())
    const activated = card.activated.get()
    const isActor = duel.actor.get() === controller
    const canActivate = card.canActivate.get()

   // print(`isActor: ${isActor}`, `inHand: ${inHand}`, `oneBottomZoneAvailable: ${oneBottomZoneAvailable}`, `inBottomRow: ${inBottomRow}`, `activated: ${activated}`, `canActivate: ${canActivate}`)

    return isActor && ((inHand && oneBottomZoneAvailable) || inBottomRow) && !activated && canActivate
}
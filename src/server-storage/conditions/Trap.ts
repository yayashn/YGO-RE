import { Card } from 'server/ygo/Card'

export default (card: Card) => {
    const controller = card.controller.get()
    const duel = controller.getDuel()

    const inBottomRow = ["SZone1", "SZone2", "SZone3", "SZone4", "SZone5"].includes(card.location.get())
    const activated = card.activated.get()
    const isActor = duel.actor.get() === controller
    const canActivate = card.canActivate.get()

    return isActor && inBottomRow && !activated && canActivate
}
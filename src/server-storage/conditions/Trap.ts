import type { CardFolder, DuelFolder } from 'server/types'
import { getFilteredCards } from 'server/utils'

export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.FindFirstAncestorWhichIsA('Folder') as DuelFolder

    const inBottomRow = ["SZone1", "SZone2", "SZone3", "SZone4", "SZone5"].includes(card.location.Value)
    const activated = card.activated.Value
    const isActor = duel.actor.Value === controller
    const canActivate = card.canActivate.Value
    const isDamageStep = duel.battleStep.Value === 'DAMAGE'

    return isActor && inBottomRow && !activated && canActivate && !isDamageStep
}
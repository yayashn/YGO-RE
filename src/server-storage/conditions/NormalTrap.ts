import type { CardFolder, DuelFolder } from 'server/types'
import { getFilteredCards } from 'server/utils'
import Trap from './Trap'

export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.FindFirstAncestorWhichIsA('Folder') as DuelFolder

    const isSpeedSpell2 = duel.speedSpell.Value <= 2;
    const isDamageStep = duel.battleStep.Value === 'DAMAGE'

    return Trap(card) && isSpeedSpell2 && !isDamageStep
}
import type { CardFolder, DuelFolder } from 'server/types'
import Spell from './Spell'

export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.FindFirstAncestorWhichIsA('Folder') as DuelFolder
    const isSpeedSpell2 = duel.speedSpell.Value <= 2;
    const isDamageStep = duel.battleStep.Value === 'DAMAGE'
    return Spell(card) && isSpeedSpell2 && !isDamageStep
}
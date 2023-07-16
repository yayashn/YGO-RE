import type { CardFolder } from 'server/types'
import Spell from './Spell'
import { Card } from 'server/ygo/Card'

export default (card: Card) => {
    const controller = card.controller.get()
    const duel = controller.getDuel()
    const isSpeedSpell2 = duel.speedSpell.get() <= 2;
    const isDamageStep = duel.battleStep.get() === 'DAMAGE'
    return Spell(card) && isSpeedSpell2 && !isDamageStep
}
import type { CardFolder } from 'server/types'
import Trap from './Trap'
import { Card } from 'server/ygo/Card'

export default (card: Card) => {
    const controller = card.controller.get()
    const duel = controller.getDuel()

    const isSpeedSpell2 = duel.speedSpell.get() <= 2;
    const isDamageStep = duel.battleStep.get() === 'DAMAGE'

    return Trap(card) && isSpeedSpell2 && !isDamageStep
}
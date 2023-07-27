
import type { Card } from 'server/duel/card';
import Trap from './Trap'
import { getDuel } from 'server/duel/duel';

export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!;

    const isSpeedSpell2 = duel.speedSpell.get() <= 2;
    const isDamageStep = duel.battleStep.get() === 'DAMAGE'

    return Trap(card) && isSpeedSpell2 && !isDamageStep
}
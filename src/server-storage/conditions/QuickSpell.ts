import type { Card } from 'server/duel/card';
import Spell from './Spell'
import { getDuel } from 'server/duel/duel';

export default (card: Card) => {
    const controller = card.getController();
    const duel = getDuel(controller.player)!;
    const isSpeedSpell2 = duel.speedSpell.get() <= 2;
    const isDamageStep = duel.battleStep.get() === 'DAMAGE'
    return Spell(card) && isSpeedSpell2 && !isDamageStep
}
import type { Card } from 'server/duel/card'
import { getDuel } from 'server/duel/duel'

export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!;

    const isSpeedSpell2 = duel.speedSpell.get() <= 2;

    return isSpeedSpell2 && duel.battleStep.get() !== "DAMAGE"
}
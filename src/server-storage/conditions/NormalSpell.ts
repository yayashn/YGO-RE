import type { Card } from 'server/duel/card'
import Spell from './Spell'
import { getDuel } from 'server/duel/duel'

export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!;

    const isControllersTurn = duel.turnPlayer.get() === controller
    const isMainPhase = duel.phase.get() === 'MP1' || duel.phase.get() === 'MP2';
    const isSpeedSpell1 = duel.speedSpell.get() === 1;

    return Spell(card) && isControllersTurn && isMainPhase && duel.gameState.get() === "OPEN" && isSpeedSpell1
}
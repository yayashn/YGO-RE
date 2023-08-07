import type { Card } from 'server/duel/card'
import Spell from './Spell'
import { getDuel } from 'server/duel/duel'

export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!;

    const isControllersTurn = duel.turnPlayer.get() === controller
    const isMainPhase = duel.phase.get() === 'MP1' || duel.phase.get() === 'MP2';
    const isSpeedSpell1 = duel.speedSpell.get() === 1;
    const inHand = card.location.get() === 'Hand'
    const inBottomRow = card.location.get() === "FZone"
    const activated = card.activated.get()
    const isActor = duel.actor.get() === controller
    const canActivate = !card.hasFloodgate("CANNOT_ACTIVATE");
    const isFacedown = card.position.get() === "FaceDown";

    return (isActor && (inHand || inBottomRow) && isFacedown && !activated && canActivate) &&
     isControllersTurn && isMainPhase && duel.gameState.get() === "OPEN" && isSpeedSpell1
}
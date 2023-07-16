import Spell from './Spell'
import { Card } from 'server/ygo/Card'

export default (card: Card) => {
    const controller = card.controller.get()
    const duel = controller.getDuel()

    const isControllersTurn = duel.turnPlayer.get() === controller
    const isMainPhase = duel.phase.get() === 'MP1' || duel.phase.get() === 'MP2';
    const isSpeedSpell1 = duel.speedSpell.get() === 1;

    //print(`spell: ${Spell(card)}`, `isControllersTurn: ${isControllersTurn}`, `isMainPhase: ${isMainPhase}`, `duel.gameState.Value: ${duel.gameState.Value}`, `isSpeedSpell1: ${isSpeedSpell1}`)

    return Spell(card) && isControllersTurn && isMainPhase && duel.gameState.get() === "OPEN" && isSpeedSpell1
}
import type { CardFolder, DuelFolder } from 'server/types'
import Spell from './Spell'

export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.FindFirstAncestorWhichIsA('Folder') as DuelFolder

    const isControllersTurn = duel.turnPlayer.Value === controller
    const isMainPhase = duel.phase.Value === 'MP1' || duel.phase.Value === 'MP2';
    const isSpeedSpell1 = duel.speedSpell.Value === 1;

    //print(`spell: ${Spell(card)}`, `isControllersTurn: ${isControllersTurn}`, `isMainPhase: ${isMainPhase}`, `duel.gameState.Value: ${duel.gameState.Value}`, `isSpeedSpell1: ${isSpeedSpell1}`)

    return Spell(card) && isControllersTurn && isMainPhase && duel.gameState.Value === "OPEN" && isSpeedSpell1
}
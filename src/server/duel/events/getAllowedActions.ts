import { includes } from "shared/utils"
import { getDuel } from "../duel"
import { CardPublic } from "../types"
import { getFilteredCards } from "../utils"

export const getAllowedActions = (player: Player, cardPublic: CardPublic) => {
    const duel = getDuel(player)!
    const yPlayer = duel.getPlayer(player)
    duel.handleCardFloodgates()
    const card = getFilteredCards(duel, { uid: [cardPublic.uid] })[0]
    const actor = duel.actor.get()
    const chainResolving = duel.chainResolving.get()
    const phase = duel.phase.get()
    const gameState = duel.gameState.get()
    const position = card.position.get()

    const inHand = card.location.get() === 'Hand'
    const inMonsterZone = includes(card.location.get(), "MZone");
    const isMonster = includes(card.type.get(), "Monster");
    const isSpellTrap = !isMonster;
    const isActor = actor === yPlayer;
    const isSelecting = yPlayer.selectableZones.get().size() !== 0;
    const conditionMet = card.checkEffectConditions()

    const isController = card.getController() === yPlayer
    const szoneAvailable = getFilteredCards(duel, {
        location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
        controller: [yPlayer.player]
    }).size() < 5
    const numberOfMzoneCards = getFilteredCards(duel, {
        location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
        controller: [yPlayer.player]
    }).size();
    const mzoneAvailable = (card.level.get() || 0) <= 4 ? (numberOfMzoneCards < 5) : true

    if(chainResolving || isSelecting || !isActor || !isController) {
        return [];
    }

    const actions: string[] = [];

    // Normal Summon & Set
    if (inHand && isMonster && includes(phase, "MP") && !yPlayer.getFloodgates("CANNOT_NORMAL_SUMMON") 
    && gameState === "OPEN" && mzoneAvailable) {
        if(card.level.get()! <= 4) {
            actions.push("Normal Summon")
            actions.push("Set")
        } else if(card.level.get()! <= 6 && numberOfMzoneCards >= 1) {
            actions.push("Tribute Summon")
            actions.push("Set")
        } else if(card.level.get()! >= 7 && numberOfMzoneCards >= 2) {
            actions.push("Tribute Summon")
            actions.push("Set")
        }
    } 
    // Set
    else if (inHand && isSpellTrap && includes(phase, "MP") && gameState === "OPEN" && szoneAvailable) {
        actions.push("Set")
    }
    

    // Flip Summon
    if(inMonsterZone && includes(phase, "MP") && gameState === "OPEN" && position === "FaceDownDefense" && !card.hasFloodgate("CANNOT_CHANGE_POSITION")) {
        actions.push("Flip Summon")
    } 
    // Change Position
    else if(inMonsterZone && includes(phase, "MP") && gameState === "OPEN" && !card.hasFloodgate("CANNOT_CHANGE_POSITION")) {
        actions.push("Change Position")
    }

    // Activate
    if(conditionMet) {
        actions.push("Activate")
    }

    // Attack
    if(inMonsterZone && phase === "BP" && gameState === "OPEN" && position === "FaceUpAttack" && !yPlayer.getFloodgates("CANNOT_ATTACK") && !card.hasFloodgate("CANNOT_ATTACK")) {
        actions.push("Attack")
    } 

    return actions;
}
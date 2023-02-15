import { CardFolder, DuelFolder } from 'server/ygo'
import { getFilteredCards } from 'server/utils'

export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.FindFirstAncestorWhichIsA('Folder') as DuelFolder

    const isControllersTurn = duel.turnPlayer.Value === controller
    const isMainPhase = duel.phase.Value === 'MP1' || duel.phase.Value === 'MP2';
    const oneBottomZoneAvailable = getFilteredCards(duel, {
        controller: [controller],
        location: ["SZone1", "SZone2", "SZone3", "SZone4", "SZone5"]
    }).size() < 5
    const inHand = card.location.Value === 'Hand'
    const inBottomRow = ["SZone1", "SZone2", "SZone3", "SZone4", "SZone5"].includes(card.location.Value)

    return isControllersTurn && isMainPhase && ((inHand && oneBottomZoneAvailable) || inBottomRow)
}
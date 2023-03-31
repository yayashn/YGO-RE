import type { CardFolder, DuelFolder, PlayerValue, SZone, Zone } from './types'
import { ServerScriptService } from '@rbxts/services'
import Object from '@rbxts/object-utils'
import { Location, MZone } from 'shared/types'
import { JSON } from 'shared/utils'

const duels = ServerScriptService.WaitForChild('instances').WaitForChild('duels') as Folder
const replicatedStorage = game.GetService('ReplicatedStorage')
const cards = replicatedStorage.WaitForChild('cards') as Folder

export const getDuel = (player: Player) => {
    for (const d of duels.GetChildren()) {
        if (string.match(d.Name, `|${player.Name}`) || string.match(d.Name, `${player.Name}|`)) {
            const players = [
                d.FindFirstChild('player1') as PlayerValue,
                d.FindFirstChild('player2') as PlayerValue
            ]
            const p = players.find((p) => (p as unknown as { Value: Player }).Value === player)
            const o = players.find((p) => (p as unknown as { Value: Player }).Value !== player)
            return [d, p, o] as [DuelFolder, PlayerValue, PlayerValue]
        }
    }
}

export const getCards = (duel: DuelFolder) => {
    const cards1 = duel.player1.cards.GetChildren() as CardFolder[]
    const cards2 = duel.player2.cards.GetChildren() as CardFolder[]
    return [...cards1, ...cards2]
}

export const getCard = (duel: DuelFolder, uid: string) => {
    const cards1 = duel.player1.cards.GetChildren() as CardFolder[]
    const cards2 = duel.player2.cards.GetChildren() as CardFolder[]
    const cards = [...cards1, ...cards2]

    return cards.find((c) => c.uid.Value === uid)
}

export const getCardInfo = (name: string) => {
    return cards.FindFirstChild(name, true) as Folder
}

export interface CardFilter {
    location?: Location[]
    controller?: PlayerValue[]
    uid?: string[]
    canChangePosition?: boolean[]
    type?: string[]
}

export const getFilteredCards = (duel: DuelFolder, cardFilter: CardFilter) => {
    const cards = getCards(duel)
    return cards.filter((card) =>
        Object.entries(cardFilter).every(([key, values]) => {
            if(key === "type") {
                return values.some((value) => card.type.Value.match(value as string).size() > 0)
            }
            return values.some((value) => card[key].Value === value)
        })
    )
}

export const getOpponent = (player: PlayerValue) => {
    const duel = player.FindFirstAncestorWhichIsA('Folder') as DuelFolder
    const opponent = duel.FindFirstChild(
        player.Name === 'player1' ? 'player2' : 'player1'
    ) as PlayerValue
    return opponent
}

export type SelectableZone = {
    [key in MZone | SZone]: {
        opponent: boolean
        player: boolean
    }
}

export const getEmptyFieldZones = (
    zoneType: 'MZone' | 'SZone' | 'Both',
    YGOPlayer: PlayerValue,
    zoneSide: "Player" | "Opponent" | 'Both'
) => {
    const duel = YGOPlayer.FindFirstAncestorWhichIsA('Folder') as DuelFolder
    const SZones = ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5']
    const MZones = ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5']
    const allZones = [...SZones, ...MZones]

    const takenFieldZones = getFilteredCards(duel, {
        location: (zoneType === 'Both'
            ? allZones
            : zoneType === 'MZone'
            ? MZones
            : SZones) as Location[],
        controller: [YGOPlayer]
    }).map((card) => card.location.Value)

    const emptyFieldZones = (zoneType === 'Both' ? allZones : zoneType === 'SZone' ? SZones : MZones)
        .filter((zone) => !takenFieldZones.includes(zone as MZone | SZone))
        .map((zone) => {
            return {
                [zone as MZone | SZone]: {
                    opponent: zoneSide === 'Both' || zoneSide === "Opponent",
                    player: zoneSide === 'Both' || zoneSide === "Player"
                }
            }
        })

    return JSON.stringify(emptyFieldZones)
}
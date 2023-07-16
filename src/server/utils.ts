import type { CardFolder, Position, SZone, Zone } from './types'
import { ServerScriptService, Workspace } from '@rbxts/services'
import Object from '@rbxts/object-utils'
import { Location, MZone } from 'shared/types'
import { JSON } from 'shared/utils'
import changedOnce from 'shared/lib/changedOnce'
import { Duels } from './ygo/Duels'
import type { Duel } from './ygo/Duel'
import { YPlayer } from './ygo/Player'
import { Card } from './ygo/Card'

const duels = ServerScriptService.WaitForChild('instances').WaitForChild('duels') as Folder
const replicatedStorage = game.GetService('ReplicatedStorage')
const cards = replicatedStorage.WaitForChild('cards') as Folder

export const getDuel = (player: Player, duelOnly?: boolean) => {
    for (const [d, duel] of Duels) {
        if (string.match(d, `|${player.Name}`) || string.match(d, `${player.Name}|`)) {
            const players = [
                duel.player1,
                duel.player2,
            ]
            const p = players.find((p) => p.player === player)!
            const o = players.find((p) => p.player !== player)!
            return [duel, p, o] as [Duel, YPlayer, YPlayer]
        }
    }
}

export const getCards = (duel: Duel) => {
    const cards1 = duel.player1.cards.get()
    const cards2 = duel.player2.cards.get()
    return [...cards1, ...cards2]
}

export const getCard = (duel: Duel, uid: string) => {
    const cards1 = duel.player1.cards.get()
    const cards2 = duel.player2.cards.get()
    const cards = [...cards1, ...cards2]

    return cards.find((c) => c.uid === uid)
}

export const getCardInfo = (name: string) => {
    const cardPart = cards.FindFirstChild(name, true);
    return cardPart as unknown as CardFolder;
}

export interface CardFilter {
    location?: Location[]
    controller?: YPlayer[]
    uid?: string[]
    type?: string[]
    position?: Position[]
    race?: string[]
    name?: string[]
}

export const getFilteredCards = (duel: Duel, cardFilter: CardFilter) => {
    const cards = getCards(duel)
    return cards.filter((card) =>
        Object.entries(cardFilter).every(([key, values]) => {
            if(key === "type") {
                return values.some((value) => card.type.get().match(value as string).size() > 0)
            }
            if(key === "name" || key === "uid") {
                return values.some((value) => card[key] === value)
            }
            return values.some((value) => card[key].get() === value)
        })
    )
}

export type Action = {
    action: string
    summonedCards?: Card[]
    acivatedCards?: Card[]
}

export const pickZone = async (player: YPlayer) => {
    player.selectableZones.set(getEmptyFieldZones('MZone', player, 'Player'))
    const zone = player.selectedZone.changedOnce()
    player.selectableZones.set([])
    player.selectedZone.set("")
    return zone as Zone;
}

export const pickZoneSync = (player: YPlayer) => {
    player.selectableZones.set(getEmptyFieldZones('MZone', player, 'Player'))
    while (true) {
        if(player.selectedZone.get() !== "") {
            const selectedZone = player.selectedZone.get()
            player.selectedZone.set("")
            player.selectableZones.set([])
            return selectedZone as Zone;
        }
        wait()
    }
}

export const pickPosition = async (player: YPlayer, card: Card) => {
    player.selectPositionCard.set(card.uid)
    const position = player.selectedPosition.changedOnce()
    player.selectedPosition.set("")
    player.selectPositionCard.set("")
    return position as Position;
}

export const pickPositionSync = (player: YPlayer, card: Card) => {
    player.selectPositionCard.set(card.uid)
    while (true) {
        if(player.selectedPosition.get() !== "") {
            const position = player.selectedPosition.get()
            player.selectedPosition.set("")
            player.selectPositionCard.set("")
            return position as Position;
        }
        wait()
    }
}

export const pickTargets = (player: YPlayer, n: number, targettables: Card[]) => {
    player.targets.set([])
    player.targettableCards.set(targettables)
    const duel = player.getDuel();
    let pickedTargets: Card[] = [];
    const connection = player.targets.event.Connect((newTargets) => {
        const targets = (newTargets as unknown as Card[]).map(target => getCard(duel, target.uid)!);
        if (targets.size() === n) {
            connection.Disconnect()
            pickedTargets = (newTargets as unknown as Card[])
        }
    })
    while (connection.Connected) {
        wait()
    }
    player.targettableCards.set([])
    return pickedTargets
}

export const addTarget = (player: YPlayer, target: Card) => {
    player.targets.get().push(target)
}

export const stringifyCards = (cards: Card[]) => {
    return cards.map(c => c.uid).join(',')
}

export const parseCards = (duel: Duel, cardsString: string) => {
    const cardUidArray = cardsString.split(",").filter(c => c !== "")
    return cardUidArray.map(uid => getCard(duel, uid)!)
}

export type SelectableZone = {
    [key in MZone | SZone]: {
        opponent: boolean
        player: boolean
    }
}

const getFieldZonePart = (player: "Opponent" | "Player", part: MZone | SZone) => Workspace.Field3D.Field[player].Field[part] // Field contains all the MZones and SZones parts.

export function getEmptyFieldZones(
    zoneType: 'MZone' | 'SZone' | 'Both',
    YGOPlayer: YPlayer,
    zoneSide: "Player" | "Opponent" | 'Both',
    getPart?: boolean
) {
    const duel = YGOPlayer.getDuel()
    const SZones: SZone[] = ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5']
    const MZones: MZone[] = ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5']
    const allZones: Location[] = [...SZones, ...MZones]

    const takenFieldZones = getFilteredCards(duel, {
        location: (zoneType === 'Both'
            ? allZones
            : zoneType === 'MZone'
            ? MZones
            : SZones) as Location[],
        controller: [YGOPlayer]
    }).map((card) => card.location.get())

    const emptyFieldZones = (zoneType === 'Both' ? allZones : zoneType === 'SZone' ? SZones : MZones)
        .filter((zone) => !takenFieldZones.includes(zone))
        .map((zone) => {
            if (getPart) {
                return getFieldZonePart(zoneSide === 'Both' ? "Player" : zoneSide, zone as MZone | SZone);
            } else {
                return {
                    [zone]: {
                        opponent: zoneSide === 'Both' || zoneSide === "Opponent",
                        player: zoneSide === 'Both' || zoneSide === "Player"
                    }
                }
            }
        })

    return emptyFieldZones;
}
import type { CardFolder, DuelFolder, PlayerValue, Position, SZone, Zone } from './types'
import { ServerScriptService, Workspace } from '@rbxts/services'
import Object from '@rbxts/object-utils'
import { Location, MZone } from 'shared/types'
import { JSON } from 'shared/utils'
import changedOnce from 'shared/lib/changedOnce'

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
    return cards.FindFirstChild(name, true) as CardFolder
}

export interface CardFilter {
    location?: Location[]
    controller?: PlayerValue[]
    uid?: string[]
    type?: string[]
    position?: Position[]
    race?: string[]
    Name?: string[]
}

export const getFilteredCards = (duel: DuelFolder, cardFilter: CardFilter) => {
    const cards = getCards(duel)
    return cards.filter((card) =>
        Object.entries(cardFilter).every(([key, values]) => {
            if(key === "type") {
                return values.some((value) => card.type.Value.match(value as string).size() > 0)
            }
            if(key === "Name") {
                return values.some((value) => card[key] === value)
            }
            return values.some((value) => card[key].Value === value)
        })
    )
}

type Action = {
    action: string
    summonedCards?: CardFolder[]
    acivatedCards?: CardFolder[]
}

type EncodedAction = {
    action: string
    summonedCards?: string
    acivatedCard?: string
}

export const clearAction = (player: PlayerValue) => {
    setAction(player, { action: "None" })
}

export const setAction = (player: PlayerValue, action: Action) => {
    const encodedAction = action as EncodedAction
    if(encodedAction.summonedCards) {
        encodedAction.summonedCards = stringifyCards(action.summonedCards!)
    }
    if(encodedAction.acivatedCard) {
        encodedAction.acivatedCard = stringifyCards(action.acivatedCards!)
    }
    player.action.Value = JSON.stringify(encodedAction)
}


export const getAction = (player: PlayerValue, forceAction?: string) => {
    const encodedAction = JSON.parse(forceAction ?? player.action.Value) as EncodedAction
    const action = encodedAction as Action
    if(action.summonedCards) {
        action.summonedCards = parseCards(player.Parent as DuelFolder, encodedAction.summonedCards!)
    }
    if(action.acivatedCards) {
        action.acivatedCards = parseCards(player.Parent as DuelFolder, encodedAction.acivatedCard!)
    }
    return action as Action
}

export const pickZone = async (player: PlayerValue) => {
    player.selectableZones.Value = getEmptyFieldZones('MZone', player, 'Player')
    const zone = await changedOnce(player.selectedZone.Changed)
    player.selectableZones.Value = "[]"
    player.selectedZone.Value = ""
    return zone as Zone;
}

export const pickZoneSync = (player: PlayerValue) => {
    player.selectableZones.Value = getEmptyFieldZones('MZone', player, 'Player')
    while (true) {
        if(player.selectedZone.Value !== "") {
            const selectedZone = player.selectedZone.Value
            player.selectedZone.Value = ""
            player.selectableZones.Value = "[]"
            return selectedZone as Zone;
        }
        wait()
    }
}

export const pickPosition = async (player: PlayerValue, card: CardFolder) => {
    player.selectPositionCard.Value = card.uid.Value
    const position = await changedOnce(player.selectedPosition.Changed)
    player.selectedPosition.Value = ""
    player.selectPositionCard.Value = ""
    return position as Position;
}

export const pickPositionSync = (player: PlayerValue, card: CardFolder) => {
    player.selectPositionCard.Value = card.uid.Value
    while (true) {
        if(player.selectedPosition.Value !== "") {
            const position = player.selectedPosition.Value
            player.selectedPosition.Value = ""
            player.selectPositionCard.Value = ""
            return position as Position;
        }
        wait()
    }
}

export const pickTargets = (player: PlayerValue, n: number, targettables: string) => {
    player.targets.Value = ""
    player.targettableCards.Value = targettables
    const duel = player.FindFirstAncestorWhichIsA('Folder') as DuelFolder;
    let pickedTargets: string = "";
    const connection = player.targets.Changed.Connect((newTargets) => {
        const targets = newTargets.split(",").map(target => getCard(duel, target)!);
        if (targets.size() === n) {
            connection.Disconnect()
            pickedTargets = newTargets
        }
    })
    while (connection.Connected) {
        wait()
    }
    player.targettableCards.Value = ""
    return pickedTargets
}

export const getTargettables = (player: PlayerValue, targettablesString?: string) => {
    const duel = player.FindFirstAncestorWhichIsA('Folder') as DuelFolder
    if(targettablesString) {
        const targettables = targettablesString.split(",").map(target => getCard(duel, target)!);
        return targettables
    }
    const targettables = player.targettableCards.Value.split(",").map(target => getCard(duel, target)!);
    return targettables
}

export const getTargets = (player: PlayerValue, targetsString?: string) => {
    const duel = player.FindFirstAncestorWhichIsA('Folder') as DuelFolder
    if(targetsString) {
        const targets = targetsString.split(",").map(target => getCard(duel, target)!);
        return targets
    }
    const targets = player.targets.Value.split(",").map(target => getCard(duel, target)!);
    return targets
}

export const addTarget = (player: PlayerValue, target: CardFolder) => {
    const duel = player.FindFirstAncestorWhichIsA('Folder') as DuelFolder
    const targets = getTargets(player)
    targets.push(target)
    setTargets(player, targets)
}

export const removeTarget = (player: PlayerValue, target: CardFolder) => {
    const duel = player.FindFirstAncestorWhichIsA('Folder') as DuelFolder
    const targets = getTargets(player).filter(t => t !== target)
    setTargets(player, targets)
}

export const setTargets = (player: PlayerValue, targets: CardFolder[]) => {
    player.targets.Value = stringifyCards(targets)
}

export const stringifyCards = (cards: CardFolder[]) => {
    return cards.map(c => c.uid.Value).join(',')
}

export const parseCards = (duel: DuelFolder, cardsString: string) => {
    const cardUidArray = cardsString.split(",").filter(c => c !== "")
    return cardUidArray.map(uid => getCard(duel, uid)!)
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


const getFieldZonePart = (player: "Opponent" | "Player", part: MZone | SZone) => Workspace.Field3D.Field[player].Field[part] // Field contains all the MZones and SZones parts.

export function getEmptyFieldZones(
    zoneType: 'MZone' | 'SZone' | 'Both',
    YGOPlayer: PlayerValue,
    zoneSide: "Player" | "Opponent" | 'Both'
): string;

export function getEmptyFieldZones(
    zoneType: 'MZone' | 'SZone' | 'Both',
    YGOPlayer: PlayerValue,
    zoneSide: "Player" | "Opponent" | 'Both',
    getPart: true
): unknown[];

export function getEmptyFieldZones(
    zoneType: 'MZone' | 'SZone' | 'Both',
    YGOPlayer: PlayerValue,
    zoneSide: "Player" | "Opponent" | 'Both',
    getPart?: boolean
): string | unknown[] {
    const duel = YGOPlayer.FindFirstAncestorWhichIsA('Folder') as DuelFolder
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
    }).map((card) => card.location.Value)

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

    if (getPart) {
        return emptyFieldZones;
    } else {
        return JSON.stringify(emptyFieldZones);
    }
}
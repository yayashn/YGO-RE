import type { CardFolder, DuelFolder, PlayerValue, Position, SZone, Zone } from './types'
import { ServerScriptService } from '@rbxts/services'
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
    canChangePosition?: boolean[]
    type?: string[]
    position?: Position[]
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

export const pickZone = async (player: PlayerValue) => {
    player.selectableZones.Value = getEmptyFieldZones('MZone', player, 'Player')
    const zone = await changedOnce(player.selectedZone.Changed)
    player.selectableZones.Value = "[]"
    player.selectedZone.Value = ""
    return zone as Zone;
}

export const pickPosition = async (player: PlayerValue, card: CardFolder) => {
    player.selectPositionCard.Value = card.uid.Value
    const position = await changedOnce(player.selectedPosition.Changed)
    player.selectedPosition.Value = ""
    player.selectPositionCard.Value = ""
    return position as Position;
}

export const pickTargets = (player: PlayerValue, n: number) => {
    const duel = player.FindFirstAncestorWhichIsA('Folder') as DuelFolder;
    let pickedTargets: string = "";
    const connection = player.targets.Changed.Connect((newTargets) => {
        const targets = newTargets.split(",").map(target => getCard(duel, target)!);
        if (targets.size() === n) {
            pickedTargets = newTargets
            connection.Disconnect()
        }
    })
    while (connection.Connected) {
        wait()
    }
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

export const getOpponent = (player: PlayerValue) => {
    const duel = player.FindFirstAncestorWhichIsA('Folder') as DuelFolder
    const opponent = duel.FindFirstChild(
        player.Name === 'player1' ? 'player2' : 'player1'
    ) as PlayerValue
    return opponent
}

export const addAttackFloodgate = (player: PlayerValue, cause: string) => {
    const floodgates = player.canAttack.Value ? player.canAttack.Value.split(",") : [];
    floodgates.push(cause);
    player.canAttack.Value = floodgates.join(",");
}

export const removeAttackFloodgate = (player: PlayerValue, cause: string) => {
    player.canAttack.Value = player.canAttack.Value.split(",").filter(f => f !== cause).join(",");
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
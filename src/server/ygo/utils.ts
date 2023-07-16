import Object from "@rbxts/object-utils"
import { Position } from "server/types"
import { Location, MZone, SZone } from "shared/types"
import type { Duel } from "./Duel"
import { Workspace } from "@rbxts/services"
import { YPlayer } from "./Player"

export interface CardFilter {
    location?: Location[]
    controller?: YPlayer[]
    uid?: string[]
    type?: string[]
    position?: Position[]
    race?: string[]
    name?: string[]
}

const getCards = (duel: Duel) => {
    const cards1 = duel.player1.cards.get()
    const cards2 = duel.player2.cards.get()
    return [...cards1, ...cards2]
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
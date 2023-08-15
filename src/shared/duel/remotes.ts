import Net, { Definitions } from "@rbxts/net";
import type { CardAction, CardPublic, Location, Phase, SelectableZone } from "server/duel/types";

export const DuelRemotes = Net.CreateDefinitions({
    phaseChanged: Definitions.ServerToClientEvent<[phase: Phase]>(),
    turnPlayerChanged: Definitions.ServerToClientEvent<[player: Player]>(),
    handlePhaseClick: Definitions.ClientToServerEvent<[phase: Phase]>(),
    getCards: Definitions.ServerFunction<() => CardPublic[]>(),
    duelChanged: Definitions.ServerToClientEvent(),
    surrender: Definitions.ClientToServerEvent(),
    viewZone: Definitions.ServerFunction<(zone: Location, isOpponent: boolean) => CardPublic[]>(),
})

export const PlayerRemotes = Net.CreateDefinitions({
    lpChanged: Definitions.ServerToClientEvent<[lp: { playerLP: number, opponentLP: number }]>(),
    selectableZonesChanged: Definitions.ServerToClientEvent<[zones: SelectableZone[]]>(),
    pickZone: Definitions.ClientToServerEvent<[location: Location, playerType: "opponent" | "player"]>(),
    showMenu: Definitions.ServerAsyncFunction<() => boolean>(),
    closeMenu: Definitions.ServerToClientEvent(),
    targettableCardsChanged: Definitions.ServerToClientEvent<[cards: CardPublic[]]>(),
    targettedCardsChanged: Definitions.ServerToClientEvent<[cards: CardPublic[]]>(),
    getTargettedCards: Definitions.ServerAsyncFunction<() => CardPublic[]>(),
    handleCardClick: Definitions.ServerAsyncFunction<(card: CardPublic) => CardAction[] | false>(),
    playerChanged: Definitions.ServerToClientEvent(),
})

export const CardRemotes = Net.CreateDefinitions({
    cardChanged: Definitions.ServerToClientEvent<[card: CardPublic]>(),
    doAction: Definitions.ClientToServerEvent<[card: CardPublic, action: string]>(),
    getActions: Definitions.ServerFunction<(card: CardPublic) => string[]>(),
})
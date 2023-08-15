import Net, { Definitions } from "@rbxts/net";
import type { CardPublic, Location } from "server/duel/types";
import type { CardTemplate, PlayerData } from "server/types";

const Remotes = Net.CreateDefinitions({
    showField: Definitions.ServerToClientEvent<[bool: boolean]>(),
    moveCard3D: Definitions.ServerToClientEvent<[card2D: SurfaceGui, location: Location, isOpponent?: boolean]>(),
    attackCard3D: Definitions.ServerToClientEvent<[isOpponent: boolean, zone1: Location, zone2?: Location, cleanUp?: boolean]>(),

    getProfile: Definitions.ServerFunction<() => PlayerData>(),
    saveDeck: Definitions.ServerFunction<(deckName: string, mainDeck: CardTemplate[], extraDeck: CardTemplate[]) => boolean>(),
    equipDeck: Definitions.ClientToServerEvent<[deckName: string]>(),
    createDeck: Definitions.ClientToServerEvent<[deckName: string]>(),

    buyPack: Definitions.ServerFunction<(packName: string) => CardTemplate[] | false>(),
    alertPack: Definitions.ClientToServerEvent<[packName: string]>(),

    navigate: Definitions.ClientToServerEvent<[value: string]>(),
    profileChanged: Definitions.ServerToClientEvent<[data: PlayerData]>(),
});

export = Remotes;
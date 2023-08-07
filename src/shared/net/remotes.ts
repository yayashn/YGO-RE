import Net, { Definitions } from "@rbxts/net";
import type { CardPublic, Location } from "server/duel/types";
import type { CardTemplate, PlayerData } from "server/types";

const Remotes = Net.CreateDefinitions({
    showField: Definitions.ServerToClientEvent<[bool: boolean]>(),
    moveCard3D: Definitions.ServerToClientEvent<[card2D: SurfaceGui, location: Location, isOpponent?: boolean]>(),
    attackCard3D: Definitions.ServerToClientEvent<[isOpponent: boolean, zone1: Location, zone2?: Location, cleanUp?: boolean]>(),

    getProfile: Definitions.ServerFunction<(player: Player) => PlayerData>(),
    saveDeck: Definitions.ServerFunction<(deckName: string, mainDeck: CardTemplate[], extraDeck: CardTemplate[]) => void>(),
    equipDeck: Definitions.ClientToServerEvent<[deckName: string]>(),

    navigate: Definitions.ClientToServerEvent<[value: string]>(),
    profileChanged: Definitions.ServerToClientEvent<[data: PlayerData]>(),
});

export = Remotes;
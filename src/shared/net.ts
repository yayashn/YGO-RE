import Net, { Definitions } from "@rbxts/net";
import type { Card } from "server/duel/card";
import { Location } from "server/duel/types";

const Remotes = Net.CreateDefinitions({
    showField: Definitions.ServerToClientEvent<[bool: boolean]>(),
    createCard3D: Definitions.ServerToClientEvent<[card2D: SurfaceGui, location: Location, isOpponent?: boolean]>(),
    moveCard3D: Definitions.ServerToClientEvent<[card2D: SurfaceGui, location: Location, isOpponent?: boolean]>(),
    attackCard3D: Definitions.ServerToClientEvent<[isOpponent: boolean, zone1: Location, zone2?: Location, cleanUp?: boolean]>(),
});

export = Remotes;
import Remotes from "shared/net/remotes";
import packs from "./packs";
import { buyPack } from "server/profile-service/functions/buyPack";

Remotes.Server.Get("buyPack").SetCallback((player, packName) => {
    return buyPack(player, packName)
})

Remotes.Server.Get("alertPack").Connect((player, packName) => {
    packs[packName].alert(player)
})
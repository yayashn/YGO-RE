import { PlayerData } from "server/types";
import Remotes from "shared/net/remotes";

const profileChangedClient = Remotes.Server.Get("profileChanged");
export const profileChanged = (player: Player, playerData: PlayerData) =>{
    profileChangedClient.SendToPlayer(player, playerData);
}
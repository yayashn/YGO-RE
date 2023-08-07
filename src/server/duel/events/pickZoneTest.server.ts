import { DuelRemotes, PlayerRemotes } from "shared/duel/remotes";
import { getDuel } from "../duel";
import { getFilteredCards } from "../utils";

PlayerRemotes.Server.Get("pickZone").Connect((player, zone) => {
    const duel = getDuel(player)!;
    const yPlayer = duel.getPlayer(player)!;
   // yPlayer.pickZone(zone);
})
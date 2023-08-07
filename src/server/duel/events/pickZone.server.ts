import { PlayerRemotes } from "shared/duel/remotes";
import { getDuel } from "../duel";

PlayerRemotes.Server.Get("pickZone").Connect((player, zone, playerType) => {
    const duel = getDuel(player)!;
    const yPlayer = duel.getPlayer(player);

    if(yPlayer.selectableZones.get().find(z => z.zone === zone && z[playerType.lower() as "player"])) {
        yPlayer.selectedZone.set(zone);
    }
})
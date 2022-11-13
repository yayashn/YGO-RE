import { bindable, getPlayer, remote } from "shared/utils";

const player = getPlayer(script);

bindable("startDuel").Event.Connect((opponent: Player) => {
    (remote("showField") as RemoteEvent).FireClient(player);
})
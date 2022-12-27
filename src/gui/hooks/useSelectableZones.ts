import { useEffect, useState } from "@rbxts/roact-hooked";
import { Zone } from "server/ygo";
import useYGOPlayer from "./useYGOPlayer";

const httpService = game.GetService("HttpService");

export type SelectableZone = {
    [key in Zone]: {
      opponent: boolean;
      player: boolean;
    }
}
  
export default () => {
    const [selectableZones, setSelectableZones] = useState<SelectableZone[]>([]);
    const player = useYGOPlayer();

    const includesZone = (zoneName: Zone, zoneSide: "Player" | "Opponent" | "Both") => {
        const zone = selectableZones.find((zone) => zone[zoneName] !== undefined);
        if(zone) {
            if(zoneSide === "Both") {
                return zone[zoneName].opponent === true && zone[zoneName].player === true;
            } else {
                return zone[zoneName][zoneSide.lower() as "opponent" | "player"] === true;
            }
        }
        return false;
    }

    useEffect(() => {
        if(!player) return;
        player.selectableZones.Changed.Connect((newValue) => {
            setSelectableZones(httpService.JSONDecode(newValue) as SelectableZone[]);
        })
    }, [player])

    return [selectableZones, includesZone] as [SelectableZone[], typeof includesZone];
}
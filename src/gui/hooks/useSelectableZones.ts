import { useEffect, useState } from "@rbxts/roact-hooked";
import { getDuel } from "server/duel/duel";
import { Location, SelectableZone } from "server/duel/types";

const p = script.FindFirstAncestorWhichIsA("Player")!;
  
export default () => {
    const [selectableZones, setSelectableZones] = useState<SelectableZone[]>([]);
    const duel = getDuel(p)!;
    const player = duel.getPlayer(p);

    const includesZone = (zoneName: Location, zoneSide: "Player" | "Opponent" | "Both") => {
        const zone = selectableZones.find((zone) => zone.zone === zoneName);
        if(zone) {
            if(zoneSide === "Both") {
                return zone.opponent === true && zone.player === true;
            } else {
                return zone[zoneSide.lower() as "opponent" | "player"] === true;
            }
        }
        return false;
    }

    useEffect(() => {
        if(!player) return;
        const connection = player.selectableZones.changed((newValue) => {
            setSelectableZones(newValue as unknown as SelectableZone[]);
        })

        return () => {
            connection.Disconnect();
        }
    }, [player])

    return [selectableZones, includesZone] as [SelectableZone[], typeof includesZone];
}
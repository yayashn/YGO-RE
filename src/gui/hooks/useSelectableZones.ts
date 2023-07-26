import { useCallback, useEffect, useState } from "@rbxts/roact-hooked";
import { getDuel } from "server/duel/duel";
import { Location, SelectableZone } from "server/duel/types";

const p = script.FindFirstAncestorWhichIsA("Player")!;
  
export default () => {
    const [selectableZones, setSelectableZones] = useState<SelectableZone[]>([]);
    const duel = getDuel(p)!;
    const player = duel.getPlayer(p);

    const includesZone = useCallback((zoneName: Location, zoneSide: "Player" | "Opponent" | "Both") => {
        const zone = selectableZones.find((zone) => zone.zone === zoneName);
        if(zone) {
            if(zoneSide === "Both") {
                return zone.opponent === true && zone.player === true;
            } else {
                return zone[zoneSide.lower() as "opponent" | "player"] === true;
            }
        }
        return false;
    }, [selectableZones])

    useEffect(() => {
        if(!player) return;
        const connection = player.selectableZones.changed((newValue: SelectableZone[]) => {
            setSelectableZones(newValue);
        })

        return () => {
            connection.Disconnect();
        }
    }, [player])

    return [selectableZones, includesZone] as [SelectableZone[], typeof includesZone];
}
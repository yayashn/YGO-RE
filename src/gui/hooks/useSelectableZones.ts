import { useEventListener } from "shared/hooks/useEventListener";
import { useCallback, useState } from "@rbxts/roact";
import { PlayerRemotes } from "shared/duel/remotes";
import { Location, SelectableZone } from "server/duel/types";

const selectableZoneChanged = PlayerRemotes.Client.Get("selectableZonesChanged")

export default function useSelectableZones() {
    const [value, setValue] = useState<SelectableZone[]>([])

    useEventListener(selectableZoneChanged, (value) => {
        setValue(value)
    })

    const includesZone = useCallback((zoneName: Location, zoneSide: "Player" | "Opponent" | "Both") => {
        const zone = value.find((zone) => zone.zone === zoneName);
        if(zone) {
            if(zoneSide === "Both") {
                return zone.opponent === true && zone.player === true;
            } else {
                return zone[zoneSide.lower() as "opponent" | "player"] === true;
            }
        }
        return false;
    }, [value])

    return [value, includesZone] as const
}
import { useEffect, useState } from "@rbxts/roact-hooked";
import type { PlayerValue, PositionValue, LocationValue, ControllerValue } from "server/ygo";

const player = script.FindFirstAncestorWhichIsA("Player")!;

interface UseShowInfo {
    position: PositionValue,
    controller: ControllerValue,
    location: LocationValue
}

export default (card: UseShowInfo) => {
    const [showInfo, setShowInfo] = useState<boolean>(false);

    useEffect(() => {
        const onChange = () => {
            const position = card.position.Value;
            const controller = card.controller.Value;
            const location = card.location.Value;

            if(position.match("FaceUp")) {
                setShowInfo(true);
            } else {
                if(["Hand", "MZone", "SZone", "GZone", "BZone", "FZone", "EZone"].some(zone => !!location.match(zone))) {
                    setShowInfo(player === controller.Value);
                } else {
                    setShowInfo(false);
                }
            }
        }

        const connections = [card.location, card.position, card.controller].map((value) => {
            return value.Changed.Connect(onChange)
        })

        return () => {
            connections.forEach((connection) => {
                connection.Disconnect()
            })
        }
    }, [])

    return showInfo;
}
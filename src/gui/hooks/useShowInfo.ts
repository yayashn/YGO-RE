import { useEffect, useState } from "@rbxts/roact-hooked";
import { Card } from "server/ygo/Card";

const player = script.FindFirstAncestorWhichIsA("Player")!;


export default (card: Card) => {
    const [showInfo, setShowInfo] = useState<boolean>(false);

    useEffect(() => {
        const onChange = () => {
            const position = card.position.get();
            const controller = card.controller.get();
            const location = card.location.get();

            if(position.match("FaceUp")) {
                setShowInfo(true);
            } else {
                if(["Hand", "MZone", "SZone", "GZone", "BZone", "FZone", "EZone"].some(zone => !!location.match(zone))) {
                    setShowInfo(player === controller.player);
                } else {
                    setShowInfo(false);
                }
            }
        }

        const connections = [card.location, card.position, card.controller].map((value) => {
            return value.event.Connect(onChange)
        })

        return () => {
            connections.forEach((connection) => {
                connection.Disconnect()
            })
        }
    }, [])

    return showInfo;
}
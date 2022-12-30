import { useEffect, useState } from "@rbxts/roact-hooked";
import { getCardInfo } from "server/utils";
import type { CardFolder } from "server/ygo";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default (card: CardFolder) => {
    const [showArt, setShowArt] = useState(false);

    useEffect(() => {
        const onChange = () => {
            const position = card.position.Value;
            const controller = card.controller.Value;
            const location = card.location.Value;
            const art = (getCardInfo(card.Name) as CardFolder).art.Image;

            if(position.match("FaceUp")) {
                setShowArt(true);
            } else {
                if(location === "Hand") {
                    setShowArt(player === controller.Value);
                } else {
                    setShowArt(false);
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

    return showArt;
}
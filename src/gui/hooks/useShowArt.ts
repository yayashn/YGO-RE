import { useEffect, useState } from "@rbxts/roact-hooked";
import type { CardFolder } from "server/ygo";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default (card: CardFolder) => {
    const [showArt, setShowArt] = useState(false);

    useEffect(() => {
        const onChange = () => {
            const position = card.position.Value;
            const controller = card.controller.Value;
            const location = card.location.Value;
            
            if(position.match("FaceUp").size() > 0) {
                setShowArt(true);
            } else {
                if(location !== "Deck") {
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
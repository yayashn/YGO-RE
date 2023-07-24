import { useEffect, useState } from "@rbxts/roact-hooked";
import { Card } from "server/duel/card";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default (card: Card) => {
    const [showArt, setShowArt] = useState(false);

    useEffect(() => {
        const onChange = () => {
            const position = card.position.get();
            const controller = card.controller.get();
            const location = card.location.get();
            
            if(position.match("FaceUp").size() > 0) {
                setShowArt(true);
            } else {
                if(location !== "Deck") {
                    setShowArt(player === controller);
                } else {
                    setShowArt(false);
                }
            }
        }

        const connections = [card.location, card.position, card.controller].map((value) => {
            return value.changed(onChange);
        })

        return () => {
            connections.forEach((connection) => {
                connection.Disconnect()
            })
        }
    }, [])

    return showArt;
}
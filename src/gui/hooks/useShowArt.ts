import { useState, useEffect } from "@rbxts/roact";
import { Players } from "@rbxts/services";
import { CardPublic } from "server/duel/types";

const player = Players.LocalPlayer

export default (card: CardPublic) => {
    const [showArt, setShowArt] = useState(false);

    useEffect(() => {
        const position = card.position;
        const controller = card.controller;
        const location = card.location;
        
        if(position.match("FaceUp").size() > 0) {
            setShowArt(true);
        } else {
            if(location !== "Deck") {
                setShowArt(player === controller);
            } else {
                setShowArt(false);
            }
        }
    }, [card])

    return showArt;
}
import { useState, useEffect } from "@rbxts/roact-hooked";
import { Duel } from "server/ygo/Duel";
import { duelAdded } from "server/ygo/Duel";
import { Duels } from "server/ygo/Duels";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default () => {
    const [duel, setDuel] = useState<Duel>()

    useEffect(() => {
        const duelChanged = () => {
            let duelFound;
            for(const [duelName, duelGame] of Duels) {
                if(string.match(duelName, `|${player.Name}`) || string.match(duelName, `${player.Name}|`)) {
                    duelFound = duelGame;
                    break;
                }
            }
            setDuel(duelFound);
        }

        const connections = [duelAdded.Event.Connect(duelChanged)];
        duelChanged()

        return () => {
            connections.forEach((connection) => {
                connection.Disconnect();
            })
        }
    }, [])

    return duel;
}
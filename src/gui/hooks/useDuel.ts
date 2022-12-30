import { useState, useEffect } from "@rbxts/roact-hooked";
import { DuelFolder } from "server/ygo";

const serverStorage = game.GetService("ServerStorage");
const duels = serverStorage.WaitForChild("duels")!;
const player = script.FindFirstAncestorWhichIsA("Player")!;

export default () => {
    const [duel, setDuel] = useState<DuelFolder>()

    useEffect(() => {
        const duelChanged = () => {
            let duelFound;
            for(const d of duels.GetChildren() as DuelFolder[]) {
                if(string.match(d.Name, `|${player.Name}`) || string.match(d.Name, `${player.Name}|`)) {
                    duelFound = d;
                    break;
                }
            }
            setDuel(duelFound);
        }

        const connections = [duels.ChildAdded.Connect(duelChanged), duels.ChildRemoved.Connect(duelChanged)];
        duelChanged()

        return () => {
            connections.forEach((connection) => {
                connection.Disconnect();
            })
        }
    }, [])

    return duel;
}

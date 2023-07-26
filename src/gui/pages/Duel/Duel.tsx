import Roact from "@rbxts/roact"
import { useEffect, withHooks } from "@rbxts/roact-hooked"
import Cards from "./Cards"
import Field from "./Field";
import Phases from "./Phases";
import { getDuel } from "server/duel/duel";
import useDuelStat from "gui/hooks/useDuelStat";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(() => {
    const duel = getDuel(player)!;
    const yPlayer = duel.getPlayer(player);
    const duelChanged = useDuelStat<"changed", number>(duel, 'changed');
    const playerChanged = useDuelStat<"changed", number>(duel, 'changed');

    useEffect(() => {
        yPlayer.handleFloodgates();
    }, [duelChanged, playerChanged])

    return (
        <Roact.Fragment>
            <frame 
            BackgroundTransparency={1}
            Size={new UDim2(1,0,1,0)}>
                
            </frame>
            <Phases/>
            <Field/>
            <Cards/>
        </Roact.Fragment>
    )
})
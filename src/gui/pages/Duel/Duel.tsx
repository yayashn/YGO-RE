import Roact from "@rbxts/roact"
import { useEffect, withHooks } from "@rbxts/roact-hooked"
import Cards from "./Cards"
import Field from "./Field";
import Phases from "./Phases";
import { getDuel } from "server/duel/duel";
import useDuelStat from "gui/hooks/useDuelStat";
import CardInfo from "./CardInfo";
import CardSearch from "./CardSearch";
import usePlayerStat from "gui/hooks/usePlayerStat";
import { Card } from "server/duel/card";
import { includes } from "shared/utils";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(() => {
    const duel = getDuel(player)!;
    const yPlayer = duel.getPlayer(player);
    const duelChanged = useDuelStat<"changed", number>(duel, 'changed');
    const playerChanged = useDuelStat<"changed", number>(duel, 'changed');
    const targettableCards = usePlayerStat<"targettableCards", Card[]>(yPlayer, 'targettableCards');
    const allTargettableCardsVisible = !targettableCards.some(card => !["MZone", "SZone", "FZone"].some(zone => includes(card.location.get(), zone)))

    useEffect(() => {
        yPlayer.handleFloodgates();
    }, [duelChanged, playerChanged])

    return (
        <Roact.Fragment>
            <CardInfo/>
            <Phases/>
            <Field/>
            <Cards/>
            {!allTargettableCardsVisible && <CardSearch/>}
        </Roact.Fragment>
    )
})
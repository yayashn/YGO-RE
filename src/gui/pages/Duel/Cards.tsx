import Roact from "@rbxts/roact"
import { withHooks } from "@rbxts/roact-hooked"
import useCards from "gui/hooks/useCards"
import { getDuel } from "server/duel/duel";
import Card2D from "./Card2D";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(() => {
    const duel = getDuel(player)!;
    const playerCards = useCards(player);
    const opponentCards = useCards(duel.getOpponent(player).player);

    return (
        <Roact.Fragment>
            {playerCards.map((card) => {
                return (
                    <Card2D card={card} />
                )
            })}
            {opponentCards.map((card) => {
                return (
                    <Card2D card={card} />
                )
            })}
        </Roact.Fragment>
    )
})
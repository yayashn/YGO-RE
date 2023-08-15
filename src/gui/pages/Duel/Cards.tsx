import Roact from "@rbxts/roact"
import { DuelRemotes } from "shared/duel/remotes";
import Card2D from "./Card2D";

const getCards = DuelRemotes.Client.Get("getCards");

export default () => {
    const cards = getCards.CallServer();

    return (
        <Roact.Fragment>
            {cards?.map((card) => {
                return (
                    <Card2D c={card} />
                )
            })}
        </Roact.Fragment>
    )
}
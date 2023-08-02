import Roact from "@rbxts/roact"
import { useEffect, withHooks } from "@rbxts/roact-hooked"
import Cards from "./Cards"
import Field from "./Field";
import Phases from "./Phases";
import { Duel, getDuel } from "server/duel/duel";
import useDuelStat from "gui/hooks/useDuelStat";
import CardInfo from "./CardInfo";
import CardSearch from "./CardSearch";
import usePlayerStat from "gui/hooks/usePlayerStat";
import { Card } from "server/duel/card";
import { includes } from "shared/utils";
import { useShownCards } from "./useShownCards";
import { Location } from "server/duel/types";
import { getFilteredCards } from "server/duel/utils";
import confirm from "server/popups/confirm";
import { YPlayer } from "server/duel/player";
import { ZoneButtons } from "./ZoneButtons";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const field = game.Workspace.Field3D.Field.Player
const fieldOpponent = game.Workspace.Field3D.Field.Opponent

export default withHooks(() => {
    const duel = getDuel(player)!;
    const yPlayer = duel.getPlayer(player);
    const targettableCards = usePlayerStat<"targettableCards", Card[]>(yPlayer, 'targettableCards');
    const allTargettableCardsVisible = !targettableCards.some(card => !["MZone", "SZone", "FZone", "Hand"].some(zone => includes(card.location.get(), zone)))
    const [shownCards, setShownCards] = useShownCards()

    return (
        <Roact.Fragment>
            <HandleFloodgates duel={duel} player={yPlayer}/>
            <CardInfo />
            <Phases />
            <Field />
            <Cards />
            {(!allTargettableCardsVisible || shownCards !== undefined) && <CardSearch />}
            {
                ["Top", "Bottom", "Front", "Back", "Left", "Right"].map((face) => {
                    return (
                        <Roact.Fragment>
                            {[field, fieldOpponent].map((f) => {
                                return (
                                    <ZoneButtons
                                        duel={duel}
                                        setShownCards={setShownCards}
                                        zone="Deck"
                                        f={f}
                                        face={face}
                                    />
                                )
                            })}
                        </Roact.Fragment>
                    )
                })
            }
        </Roact.Fragment>
    )
})

interface HandleFloodgatesProps {
    duel: Duel,
    player: YPlayer,
}

const HandleFloodgates = withHooks(({duel, player}: HandleFloodgatesProps) => {
    const duelChanged = useDuelStat<"changed", number>(duel, 'changed');
    const playerChanged = useDuelStat<"changed", number>(duel, 'changed');
    
    useEffect(() => {
        player.handleFloodgates();
    }, [duelChanged, playerChanged])

    return <Roact.Fragment/>;
});

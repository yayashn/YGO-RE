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
import { useGlobalState } from "shared/useGlobalState";
import { useShownCards } from "./useShownCards";
import { Location } from "server/duel/types";
import { getFilteredCards } from "server/duel/utils";
import confirm from "server/popups/confirm";
import alert from "server/popups/alert";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const field = game.Workspace.Field3D.Field.Player
const fieldOpponent = game.Workspace.Field3D.Field.Opponent

export default withHooks(() => {
    const duel = getDuel(player)!;
    const yPlayer = duel.getPlayer(player);
    const duelChanged = useDuelStat<"changed", number>(duel, 'changed');
    const playerChanged = useDuelStat<"changed", number>(duel, 'changed');
    const targettableCards = usePlayerStat<"targettableCards", Card[]>(yPlayer, 'targettableCards');
    const allTargettableCardsVisible = !targettableCards.some(card => !["MZone", "SZone", "FZone", "Hand"].some(zone => includes(card.location.get(), zone)))
    const [shownCards, setShownCards] = useShownCards()

    useEffect(() => {
        yPlayer.handleFloodgates();
    }, [duelChanged, playerChanged])

    return (
        <Roact.Fragment>
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
                                    <Roact.Fragment>
                                        {["EZone", "GZone", "BZone", "Deck"].map((zone, i) => {
                                            return <surfacegui AlwaysOnTop Key={zone} Face={face as "Top"} Adornee={f[zone as "EZone"]}>
                                                <textbutton
                                                    BackgroundTransparency={1}
                                                    Size={new UDim2(1, 0, 1, 0)}
                                                    Event={{
                                                        MouseButton1Click: async () => {
                                                            const yPlayer = duel.getPlayer(player);
                                                            const yOpponent = duel.getOpponent(player);
                                                            const controller = f.Name === "Player" ? yPlayer : yOpponent;

                                                            if(zone === "Deck") {
                                                                const surrender = await confirm("Would you like to surrender?", player)
                                                                if(surrender === "YES") {
                                                                    duel.endDuel(yOpponent, "Surrendered")
                                                                }
                                                            } else {
                                                                setShownCards(getFilteredCards(duel, {
                                                                    location: [zone as Location],
                                                                    controller: [controller.player],
                                                                }))
                                                            }
                                                        }
                                                    }}
                                                />
                                            </surfacegui>
                                        })}
                                    </Roact.Fragment>
                                )
                            })}
                        </Roact.Fragment>
                    )
                })
            }
        </Roact.Fragment>
    )
})
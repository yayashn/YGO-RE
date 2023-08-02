import Roact from "@rbxts/roact";
import { withHooks, useCallback, useMemo } from "@rbxts/roact-hooked";
import { Card } from "server/duel/card";
import { Location } from "server/duel/types";
import { getFilteredCards } from "server/duel/utils";
import confirm from "server/popups/confirm";
import { Duel } from "server/duel/duel";

const field = game.Workspace.Field3D.Field.Player
const fieldOpponent = game.Workspace.Field3D.Field.Opponent

interface ZoneButtonsProps {
    duel: Duel;
    setShownCards: Callback
    zone: string;
    f: typeof field;
    face: string;
}

const player = script.FindFirstAncestorWhichIsA("Player")!;

export const ZoneButtons = withHooks(({ duel, setShownCards, zone, f, face }: ZoneButtonsProps) => {
    const handleClick = useCallback(async () => {
        const yPlayer = duel.getPlayer(player);
        const yOpponent = duel.getOpponent(player);
        const controller = f.Name === "Player" ? yPlayer : yOpponent;

        if(zone === "Deck") {
            const surrender = await confirm("Would you like to surrender?", player)
            if(surrender === "YES") {
                duel.endDuel(yOpponent, "Surrendered")
            }
        } else {
            const cardsToShow = getFilteredCards(duel, {
                location: [zone as Location],
                controller: [controller.player],
            })
            setShownCards(cardsToShow.size() > 0 ? cardsToShow : undefined)
        }
    }, [duel, setShownCards, zone, f]);

    return useMemo(() => (
        <Roact.Fragment>
            {["EZone", "GZone", "BZone", "Deck"].map((zone, i) => {
                return <surfacegui AlwaysOnTop Key={zone} Face={face as "Top"} Adornee={f[zone as "EZone"]}>
                    <textbutton
                        BackgroundTransparency={1}
                        Size={new UDim2(1, 0, 1, 0)}
                        Event={{
                            MouseButton1Click: handleClick
                        }}
                    />
                </surfacegui>
            })}
        </Roact.Fragment>
    ), [handleClick]);
});

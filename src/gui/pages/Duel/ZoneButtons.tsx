import Roact, { useCallback, useMemo } from '@rbxts/roact'
import { Players } from '@rbxts/services'
import { Location } from 'server/duel/types'
import { DuelRemotes, PlayerRemotes } from 'shared/duel/remotes'
import { useAtom } from 'shared/jotai'
import confirm from 'shared/popups/confirm'
import { shownCardsAtom } from './CardSearch'

const player = Players.LocalPlayer
const field = game.Workspace.Field3D.Field.Player
const fieldOpponent = game.Workspace.Field3D.Field.Opponent

export default function Zones() {
    return (
        <Roact.Fragment>
            {['Top', 'Bottom', 'Front', 'Back', 'Left', 'Right'].map((face) => {
                return (
                    <Roact.Fragment>
                        {[field, fieldOpponent].map((f) => {
                            return (
                                <ZoneButtons
                                    zone={f.Name}
                                    f={f}
                                    face={face}
                                />
                            )
                        })}
                    </Roact.Fragment>
                )
            })}
        </Roact.Fragment>
    )
}

interface ZoneButtonsProps {
    f: typeof field;
    zone: string;
    face: string;
}

const surrender = DuelRemotes.Client.Get("surrender");
const viewZone = DuelRemotes.Client.Get("viewZone");

export const ZoneButtons = ({ zone, face, f }: ZoneButtonsProps) => {
    const [shwownCards, setShownCards] = useAtom(shownCardsAtom)

    const handleClick = useCallback(async (z: Location) => {
        const isOpponent = f.Name === "Opponent"
        if(z === "Deck") {
            const ff = await confirm("Would you like to surrender?", player)
            if(ff === "YES") {
                surrender.SendToServer()
            }
        } else {
            const cards = viewZone.CallServer(z as Location, isOpponent)
            setShownCards(cards)
        }
    }, []);

    return useMemo(() => (
        <Roact.Fragment>
            {["EZone", "GZone", "BZone", "Deck"].map((z, i) => {
                return <surfacegui AlwaysOnTop key={z+face} Face={face as "Top"} Adornee={f[z as "Deck"]}>
                    <textbutton
                        BackgroundTransparency={1}
                        Size={new UDim2(1, 0, 1, 0)}
                        Event={{
                            MouseButton1Click: () => {
                                handleClick(z as Location)
                            }
                        }}
                    />
                </surfacegui>
            })}
        </Roact.Fragment>
    ), [handleClick]);
}
import Roact, { useEffect } from "@rbxts/roact";
import { Players } from "@rbxts/services";
import useLP from "gui/hooks/useLP";
import usePhase from "gui/hooks/usePhase";
import useTurnPlayer from "gui/hooks/useTurnPlayer";
import { Phase } from "server/duel/types";
import { black } from "shared/colours";
import Flex from "shared/components/Flex";
import { DuelRemotes } from "shared/duel/remotes";

const phasesPart = game.Workspace.Field3D.Phases;
const player = Players.LocalPlayer

const handlePhaseClick = DuelRemotes.Client.Get("handlePhaseClick");

export default function Phases() {
    const phase = usePhase()
    const turnPlayer = useTurnPlayer()

    return (
        <billboardgui
            Active={true}
            Size={new UDim2(1000, 0, 20, 0)}
            Adornee={phasesPart}>
            <frame
                BackgroundTransparency={1}
                Size={new UDim2(1, 0, 1, 0)}
            >
                <Flex gap={new UDim(0, 5)} alignItems="center" justifyContent="center"
                />
                {(["DP", "SP", "MP1", "BP", "MP2", "EP"] as Phase[]).map((phaseName, i) => {
                    return (
                        <textbutton
                            BackgroundTransparency={.2}
                            BackgroundColor3={black}
                            TextColor3={phase === phaseName ? (turnPlayer === player ? Color3.fromRGB(0, 128, 255) : Color3.fromRGB(254, 17, 14)) : Color3.fromRGB(255, 255, 255)}
                            Size={new UDim2(0, 50, 1, 0)}
                            LayoutOrder={i}
                            Event={{
                                MouseButton1Click: () => {
                                    handlePhaseClick.SendToServer(phaseName)
                                }
                            }}
                            BorderSizePixel={0}
                            Text={phaseName} >
                                <uicorner CornerRadius={new UDim(0, 5)} />
                            </textbutton>
                    )
                })}
            </frame>
        </billboardgui>
    )
}
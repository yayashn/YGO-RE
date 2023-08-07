import Roact, { useEffect } from "@rbxts/roact";
import { Players } from "@rbxts/services";
import useLP from "gui/hooks/useLP";
import usePhase from "gui/hooks/usePhase";
import useTurnPlayer from "gui/hooks/useTurnPlayer";
import { Phase } from "server/duel/types";
import Flex from "shared/components/Flex";
import { DuelRemotes } from "shared/duel/remotes";

const phasesPart = game.Workspace.Field3D.Phases;
const player = Players.LocalPlayer

const handlePhaseClick = DuelRemotes.Client.Get("handlePhaseClick");

export default function Phases() {
    const { playerLP, opponentLP } = useLP();
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
                <textlabel
                    BackgroundColor3={new Color3(6 / 255, 52 / 255, 63 / 255)}
                    TextColor3={Color3.fromRGB(0, 128, 255)}
                    Size={new UDim2(0, 100, 2, 0)}
                    BorderColor3={new Color3(26 / 255, 101 / 255, 110 / 255)}
                    Text={`${playerLP}`}
                    Font={Enum.Font.ArialBold}
                    BorderSizePixel={1}
                    TextYAlignment={Enum.TextYAlignment.Center}
                    LineHeight={0.84}
                    TextSize={27}
                />
                {(["DP", "SP", "MP1", "BP", "MP2", "EP"] as Phase[]).map((phaseName, i) => {
                    return (
                        <textbutton
                            BackgroundColor3={new Color3(6 / 255, 52 / 255, 63 / 255)}
                            TextColor3={phase === phaseName ? (turnPlayer === player ? Color3.fromRGB(0, 128, 255) : Color3.fromRGB(254, 17, 14)) : Color3.fromRGB(255, 255, 255)}
                            Size={new UDim2(0, 50, 1, 0)}
                            LayoutOrder={i}
                            BorderColor3={phase === phaseName ? (turnPlayer === player ? Color3.fromRGB(0, 128, 255) : Color3.fromRGB(254, 17, 14)) : new Color3(26 / 255, 101 / 255, 110 / 255)}
                            Event={{
                                MouseButton1Click: () => {
                                    handlePhaseClick.SendToServer(phaseName)
                                }
                            }}
                            Text={phaseName} />
                    )
                })}
                <textlabel
                    BackgroundColor3={new Color3(6 / 255, 52 / 255, 63 / 255)}
                    TextColor3={Color3.fromRGB(254, 17, 14)}
                    Size={new UDim2(0, 100, 2, 0)}
                    BorderColor3={new Color3(26 / 255, 101 / 255, 110 / 255)}
                    Text={`${opponentLP}`}
                    Font={Enum.Font.ArialBold}
                    BorderSizePixel={1}
                    LayoutOrder={100}
                    TextYAlignment={Enum.TextYAlignment.Center}
                    LineHeight={0.84}
                    TextSize={27}
                />
            </frame>
        </billboardgui>
    )
}
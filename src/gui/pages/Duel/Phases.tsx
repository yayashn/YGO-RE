import Roact from "@rbxts/roact";
import { useEffect, useState, withHooks } from "@rbxts/roact-hooked";
import Flex from "gui/components/Flex";
import useDuelStat from "gui/hooks/useDuelStat";
import { getDuel, type Duel } from "server/duel/duel";
import { Phase } from "server/duel/types";

const phasesPart = game.Workspace.Field3D.Phases;
const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(() => {
    const duel = getDuel(player)!;
    const phase = useDuelStat<"phase", Phase>(duel, "phase");
    const YGOPlayer = duel.getPlayer(player);
    const YGOOpponent = duel.getOpponent(player);
    const [playerLP, setPlayerLp] = useState(8000)
    const [opponentLP, setOpponentLp] = useState(8000)

    useEffect(() => {
        if (!YGOPlayer || !YGOOpponent) return;
        const connections = [
            YGOPlayer.lifePoints.changed((newLp) => {
                setPlayerLp(newLp)
            }),
            YGOOpponent.lifePoints.changed((newLp) => {
                setOpponentLp(newLp)
            })
        ]

        setPlayerLp(YGOPlayer.lifePoints.get())
        setOpponentLp(YGOOpponent.lifePoints.get())

        return () => {
            connections.forEach((connection) => connection.Disconnect())
        }
    }, [YGOPlayer, YGOOpponent])

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
                            TextColor3={phase === phaseName ? (YGOPlayer === duel.turnPlayer.get() ? Color3.fromRGB(0, 128, 255) : Color3.fromRGB(254, 17, 14)) : Color3.fromRGB(255, 255, 255)}
                            Size={new UDim2(0, 50, 1, 0)}
                            LayoutOrder={i}
                            BorderColor3={phase === phaseName ? (YGOPlayer === duel.turnPlayer.get() ? Color3.fromRGB(0, 128, 255) : Color3.fromRGB(254, 17, 14)) : new Color3(26 / 255, 101 / 255, 110 / 255)}
                            Event={{
                                MouseButton1Click: () => {
                                    if (duel!.turnPlayer.get() !== YGOPlayer) return;
                                    if (duel.gameState.get() !== "OPEN") return;
                                    if (duel.battleStep.get() === "DAMAGE") return;
                                    if (phase === "MP1") {
                                        if (phaseName === "BP") {
                                            if (duel!.turn.get() <= 1) {
                                                return
                                            }
                                            duel!.handlePhase("BP")
                                        } else if (phaseName === "EP") {
                                            duel!.handlePhase("EP")
                                        }
                                    } else if (phase === "MP2") {
                                        if (phaseName === "EP") {
                                            duel!.handlePhase("EP")
                                        }
                                    } else if (phase === "BP") {
                                        if (phaseName === "EP" || phaseName === "MP2") {
                                            duel!.handlePhase("MP2")
                                        }
                                    }
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
})
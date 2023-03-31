import Roact from "@rbxts/roact";
import { useEffect, useState, withHooks } from "@rbxts/roact-hooked";
import usePhase from "gui/hooks/usePhase";
import { Text, Div, Button } from "shared/rowindcss/index";
import { getDuel } from "server/utils";
import type { Phase } from "server/types";

const phasesPart = game.Workspace.Field3D.Phases;
const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(() => {
    const [duel, YGOPlayer, YGOOpponent] = getDuel(player)!;
    const phase = usePhase();
    const [playerLP, setPlayerLp] = useState(8000)
    const [opponentLP, setOpponentLp] = useState(8000)
    
    useEffect(() => {
        if(!YGOPlayer || !YGOOpponent) return;
        const connections = [
            YGOPlayer.lifePoints.Changed.Connect((newLp) => {
                setPlayerLp(newLp)
            }),
            YGOOpponent.lifePoints.Changed.Connect((newLp) => {
                setOpponentLp(newLp)
            })
        ]

        setPlayerLp(YGOPlayer.lifePoints.Value)
        setOpponentLp(YGOOpponent.lifePoints.Value)

        return () => {
            connections.forEach((connection) => connection.Disconnect())
        }
    }, [YGOPlayer, YGOOpponent])

    return (
        <billboardgui 
        Active={true}
        Size={new UDim2(1000,0,20,0)}
        Adornee={phasesPart}>
            <Div className="flex items-center justify-center w-full h-full gap-[5px]">
                <Text className="border-[rgb(6,229,254)] border-2 bg-gray-700 h-[200%] w-[100px] font-bold rounded-lg text-white text-center"
                    Text={`${playerLP}`}/>
                {(["DP", "SP", "MP1", "BP", "MP2", "EP"] as Phase[]).map((phaseName, i) => {
                    return (
                        <textbutton 
                        BackgroundColor3={phase === phaseName ? Color3.fromRGB(0, 255, 0) : Color3.fromRGB(255, 0, 0)}
                        Size={new UDim2(0, 50, 1, 0)}
                        LayoutOrder={i}
                        Event={{
                            MouseButton1Click: () => {
                                if(duel!.turnPlayer.Value !== YGOPlayer) return;
                                if(duel.gameState.Value !== "OPEN") return;
                                if(phase === "MP1") {
                                    if(phaseName === "BP") {
                                        if(duel!.turn.Value <= 1) {
                                            return
                                        }
                                        duel!.handlePhases.Fire("BP")
                                    } else if(phaseName === "EP") {
                                        duel!.handlePhases.Fire("EP")
                                    }
                                } else if(phase === "MP2") {
                                    if(phaseName === "EP") {
                                        duel!.handlePhases.Fire("EP")
                                    }
                                } else if(phase === "BP") {
                                    if(phaseName === "EP" || phaseName === "MP2") {
                                        duel!.handlePhases.Fire("MP2")
                                    }
                                }
                            }
                        }}
                        Text={phaseName} />
                    )
                })}
                <Text className="border-[rgb(254,17,14)] border-2 bg-gray-700 h-[200%] w-[100px] font-bold rounded-lg text-white text-center order-[90]"
                    Text={`${opponentLP}`}/>
            </Div>
        </billboardgui>
    )
})
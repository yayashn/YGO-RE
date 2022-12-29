import Roact from "@rbxts/roact";
import { useEffect, useState, withHooks } from "@rbxts/roact-hooked";
import { getDuel } from "server/utils";
import { Phase } from "server/ygo";

const phasesPart = game.Workspace.Field3D.Phases;
const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(() => {
    const [duel, YGOPlayer] = getDuel(player)!;
    const [phase, setPhase] = useState<Phase>();
    
    useEffect(() => {
        duel.phase.Changed.Connect(() => {
            setPhase(duel.phase.Value)
        });
    }, [])

    return (
        <billboardgui 
        Active={true}
        Size={new UDim2(1000,0,20,0)}
        Adornee={phasesPart}>
            <uilistlayout Padding={new UDim(0,5)} HorizontalAlignment="Center" FillDirection="Horizontal"/>
            {(["DP", "SP", "MP1", "BP", "MP2", "EP"] as Phase[]).map((phaseName, i) => {
                return (
                    <textbutton 
                    BackgroundColor3={phase === phaseName ? Color3.fromRGB(0, 255, 0) : Color3.fromRGB(255, 0, 0)}
                    Size={new UDim2(0, 50, 1, 0)}
                    LayoutOrder={i}
                    Event={{
                        MouseButton1Click: () => {
                            if(duel!.turnPlayer.Value !== YGOPlayer) return;
                            if(phase === "MP1") {
                                if(phaseName === "BP") {
                                    duel!.handlePhases.Fire("BP")
                                } else if(phaseName === "EP") {
                                    duel!.handlePhases.Fire("EP")
                                }
                            } else if(phase === "MP2") {
                                if(phaseName === "EP") {
                                    duel!.handlePhases.Fire("EP")
                                }
                            }
                        }
                    }}
                    Text={phaseName} />
                )
            })}
        </billboardgui>
    )
})
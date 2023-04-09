import Roact, { Binding } from '@rbxts/roact'
import { useEffect, useState, withHooks } from '@rbxts/roact-hooked'
import { Players, ServerScriptService } from '@rbxts/services'

const player = script.FindFirstAncestorWhichIsA('Player')
const DEV = Players.GetChildren().size() === 0
const playersFolder = ServerScriptService.FindFirstChild("instances")!.FindFirstChild("players") as Folder;
let playerFolder: Folder;
let dpValue: IntValue;
try {
    playerFolder = playersFolder.WaitForChild(player!.Name) as Folder;
    dpValue = playerFolder!.WaitForChild("dp") as IntValue
} catch {
    
}

export default withHooks(() => {
    const [dp, setDP] = useState<number>(-1)

    useEffect(() => {
        if (!DEV && !player) {
            return
        }

       const connection = dpValue.Changed.Connect((newDP) => {
            setDP(newDP)
       })

       setDP(dpValue.Value)

        return () => {
            connection.Disconnect()
        }
    }, [dp])

    return (
        <frame LayoutOrder={1} BackgroundTransparency={1} Size={new UDim2(0, 97, 0, 15)}>
            <frame
                BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                BorderSizePixel={0}
                Size={new UDim2(1, 0, 1, 0)}
                Position={new UDim2(0, 30, 0, 0)}
            >
                <uipadding PaddingRight={new UDim(0, 10)} />
                <uistroke Thickness={3} LineJoinMode={Enum.LineJoinMode.Bevel} />
                <textlabel
                    Text={`${dp} DP`}
                    Font={Enum.Font.GothamBlack}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled
                    TextXAlignment={Enum.TextXAlignment.Right}
                    TextYAlignment={Enum.TextYAlignment.Top}
                    Position={new UDim2(1, 0, 0, 0)}
                    AnchorPoint={new Vector2(1, 0)}
                    BackgroundTransparency={1}
                    Size={new UDim2(1, 0, 1, 0)}
                />
            </frame>
        </frame>
    )
})

import Roact from '@rbxts/roact'

const player = script.FindFirstAncestorWhichIsA("Player")

export default () => {
    return (
        <frame
            LayoutOrder={1}
            BackgroundColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={0}
            Size={new UDim2(0, 127, 0, 15)}
        >
            <uipadding PaddingRight={new UDim(0, 10)} />
            <uistroke Thickness={3} LineJoinMode={Enum.LineJoinMode.Bevel} />
            <textlabel
                Text={player ? player.Name : "Player"}
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
    )
}

import Roact from '@rbxts/roact'

export default () => {
    return (
        <frame
            LayoutOrder={2}
            Size={new UDim2(0, 70, 0, 0)}
            AutomaticSize="Y"
            BackgroundTransparency={1}
        >
            <uilistlayout />
            <imagelabel Size={new UDim2(0, 70, 0, 70)}>
                <uistroke Thickness={10} LineJoinMode={Enum.LineJoinMode.Bevel} />
                <uipadding
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                    PaddingBottom={new UDim(0, 10)}
                    PaddingTop={new UDim(0, 10)}
                />
            </imagelabel>
        </frame>
    )
}

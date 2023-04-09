import Roact from "@rbxts/roact";
import MenuButton from "./MenuButton";
import Name from "./Name";
import DP from "./DP";
import Avatar from "./Avatar";
import Menu from "./Menu";

export default () => {
    return (
        <Roact.Fragment><uipadding
            PaddingLeft={new UDim(0, 10)}
            PaddingRight={new UDim(0, 10)}
            PaddingBottom={new UDim(0, 10)}
            PaddingTop={new UDim(0, 10)} /><frame
                Size={new UDim2(0, 0, 0, 0)}
                Position={new UDim2(1, 0, 0, 0)}
                AnchorPoint={new Vector2(1, 0)}
                AutomaticSize="XY"
                BackgroundTransparency={1}
            >
                <uilistlayout
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Right}
                    VerticalAlignment={Enum.VerticalAlignment.Top}
                    Padding={new UDim(0, 10)} />
                <uipadding PaddingTop={new UDim(0, 20)} PaddingRight={new UDim(0, 20)} />
                <Avatar/>
                <frame
                    LayoutOrder={1}
                    Size={new UDim2(0, 120, 0, 0)}
                    BackgroundTransparency={1}
                    AutomaticSize={Enum.AutomaticSize.Y}
                >
                    <frame Position={new UDim2(0, 0, 0, -7)}>
                        <uilistlayout
                            SortOrder={Enum.SortOrder.LayoutOrder}
                            Padding={new UDim(0, 10)} />
                        <Name/>
                        <DP/>
                        <Menu/>
                    </frame>
                </frame>
            </frame></Roact.Fragment>
    )
}
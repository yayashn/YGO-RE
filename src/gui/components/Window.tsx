import Roact from "@rbxts/roact";
import theme from "shared/theme";
import Flex from "../../shared/components/Flex";
import { useNavigate } from "gui/router";
import { withHooks } from "@rbxts/roact-hooked";
import Padding from "shared/components/Padding";

interface WindowProps extends Roact.PropsWithChildren {
    title?: string;
    size?: UDim2;
    buttons?: Roact.Element[];
}

export default withHooks((props: WindowProps) => {
    const navigate = useNavigate();

    return (
        <frame
        AutomaticSize={Enum.AutomaticSize.XY}
        BackgroundColor3={theme.colours.primary}
        BackgroundTransparency={0.2}
        BorderSizePixel={0}
        Size={props.size || new UDim2(.7, 0, 0, 500)}
        ClipsDescendants
        >
            <Flex flexDirection="column" />
            <uiaspectratioconstraint AspectRatio={4/3} />
            <uisizeconstraint MaxSize={new Vector2(math.huge, 500)} />
            <frame 
            BackgroundColor3={theme.colours.primary}
            BackgroundTransparency={1}
            BorderSizePixel={0}
            Size={new UDim2(1,0,0.1,0)}>
                <frame
                Size={new UDim2(0, 0, 1, 0)}
                BackgroundTransparency={1}
                AutomaticSize={Enum.AutomaticSize.X}
                >
                    <Flex gap={new UDim(0, 10)}/>
                    {props.buttons}
                </frame>
                <textlabel 
                Position={new UDim2(0.5, 0, 0.5, 0)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                Font={Enum.Font.Jura}
                Text={props.title} 
                TextScaled={true}
                Size={new UDim2(0.5, 0, 1, 0)}
                BackgroundTransparency={1}
                TextColor3={theme.colours.white}>
                    <Padding PaddingBlock={new UDim(0, 5)} />
                </textlabel>
                <textbutton 
                Event={{
                    MouseButton1Click: () => {
                        navigate("/");
                    }
                }}
                Text="×"
                TextColor3={theme.colours.white}
                Font={Enum.Font.Roboto}
                BackgroundTransparency={1}
                TextScaled={true}
                AnchorPoint={new Vector2(1, 0)}
                Size={new UDim2(0, 50, 1, 0)}
                Position={new UDim2(1, 0, 0, 0)}
                >
                    <uiaspectratioconstraint AspectRatio={1} />
                </textbutton>
            </frame>

            <frame 
            BorderSizePixel={0}
            BackgroundTransparency={1}
            Size={new UDim2(1,0,.9,0)}>
                <Padding Padding={new UDim(0,5)}/>
                {props[Roact.Children]}
            </frame>
        </frame>
    )
})
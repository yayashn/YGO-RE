import Roact from "@rbxts/roact";
import { withHooks } from "@rbxts/roact-hooked";
import { Players } from "@rbxts/services";
import Flex from "shared/components/Flex";
import Padding from "shared/components/Padding";
import type { Card } from "server/duel/card";
import theme from "shared/theme";
import { createGlobalState, useGlobalState } from "shared/useGlobalState";

export const hoveredCardStore = createGlobalState<Card | undefined>(undefined)

const DEV = Players.GetChildren().size() === 0;

export default withHooks(() => {
    const [hoveredCard, setHoveredCard] = useGlobalState(hoveredCardStore);

    return (
        <frame
        BackgroundTransparency={0.2}
        BackgroundColor3={new Color3(0,0,0)}
        Size={new UDim2(.25,0,1,0)}
        BorderSizePixel={0}
        >
            <Flex flexDirection="column"/>
            <uisizeconstraint MaxSize={new Vector2(270,math.huge)}/>
            <imagelabel
                Image={hoveredCard ? hoveredCard.art : "rbxassetid://3955072236"}
                BorderSizePixel={0}
                Size={new UDim2(1,0,0.5,0)}
            >
                <uiaspectratioconstraint AspectRatio={52.15/83}/>
                <Padding PaddingBottom={new UDim(0, 3)}/>
            </imagelabel>
            {(hoveredCard || DEV) && <Roact.Fragment>
                <textlabel
                    Size={new UDim2(1,0,0,0)}
                    TextSize={20}
                    AutomaticSize={Enum.AutomaticSize.Y}
                    TextColor3={theme.colours.white}
                    Text={hoveredCard?.name.get()}
                    TextXAlignment={"Left"}
                    BackgroundTransparency={1}
                    Font={Enum.Font.Jura}
                    TextStrokeColor3={theme.colours.white}
                    TextStrokeTransparency={0}
                >
                    <Padding 
                    PaddingInline={new UDim(0, 10)}
                    PaddingBlock={new UDim(0, 3)}/>
                </textlabel>
                <textlabel
                    Size={new UDim2(1,0,0,0)}
                    TextSize={14}
                    AutomaticSize={Enum.AutomaticSize.Y}
                    TextColor3={theme.colours.white}
                    TextWrap
                    Text={`[${hoveredCard?.type.get()}] ${hoveredCard?.race.get()}/${hoveredCard?.attribute.get().upper()}${hoveredCard?.level.get() ? '/'+hoveredCard.level.get()+'★' : ''}`}
                    TextXAlignment={"Left"}
                    BackgroundTransparency={1}
                    Font={Enum.Font.Jura}
                >
                    <Padding 
                    PaddingInline={new UDim(0, 10)}
                    PaddingBlock={new UDim(0, 3)}/>
                </textlabel>
                {(hoveredCard?.atk.get() !== undefined) && <textlabel
                    Size={new UDim2(1,0,0,0)}
                    TextSize={14}
                    AutomaticSize={Enum.AutomaticSize.Y}
                    TextColor3={theme.colours.white}
                    Text={`${hoveredCard.getAtk()}/${hoveredCard.getDef()}`}
                    TextXAlignment={"Left"}
                    BackgroundTransparency={1}
                    Font={Enum.Font.Jura}
                >
                    <Padding 
                    PaddingInline={new UDim(0, 10)}
                    PaddingBlock={new UDim(0, 3)}/>
                </textlabel>}
                <textlabel
                    Size={new UDim2(1,0,0,0)}
                    TextSize={14}
                    AutomaticSize={Enum.AutomaticSize.Y}
                    TextColor3={theme.colours.white}
                    Text={hoveredCard?.desc.get()}
                    TextXAlignment={"Left"}
                    BackgroundTransparency={1}
                    Font={Enum.Font.Jura}
                    TextWrap
                    TextYAlignment={"Top"}
                >
                    <Padding 
                    PaddingInline={new UDim(0, 10)}
                    PaddingBlock={new UDim(0, 3)}/>
                </textlabel>
            </Roact.Fragment>}
        </frame>
    )
})
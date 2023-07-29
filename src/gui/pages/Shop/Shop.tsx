import Roact from "@rbxts/roact";
import { withHooks } from "@rbxts/roact-hooked";
import Flex from "shared/components/Flex";
import Window from "gui/components/Window";
import usePlayerData from "gui/hooks/usePlayerData";
import theme from "shared/theme";
import { useNavigate } from "gui/router";
import { Dictionary as Object } from "@rbxts/sift";
import Padding from "shared/components/Padding";
import prompt from "server/popups/prompt";
import { buyPack, getProfile } from "server/profile-service/profiles";
import alert from "server/popups/alert";
import PackOpen, { showPackOpenStore } from "./PackOpen";
import { useGlobalState } from "shared/useGlobalState";

const gap = 5;
const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(() => {
    const navigate = useNavigate();
    const playerData = usePlayerData();
    const decks = playerData ? Object.entries(playerData.decks) : [];
    const [showPackOpen, setShowPackOpen] = useGlobalState(showPackOpenStore)

    return (
        <Window title="SHOP">
            <scrollingframe
                BorderSizePixel={0}
                BackgroundTransparency={1}
                ScrollBarThickness={1}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                Size={new UDim2(1, 0, .9, 0)}>
                <uigridlayout
                    CellSize={new UDim2(.5, -gap, .5, -gap)}
                    CellPadding={new UDim2(0, gap, 0, gap)}
                    VerticalAlignment={Enum.VerticalAlignment.Top}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                />
                <Padding Padding={new UDim(0, gap)} />
                <imagelabel
                    Size={new UDim2(1, 0, 1, 0)}
                    BackgroundColor3={theme.colours.secondary}
                    BorderSizePixel={0}
                    Image='rbxassetid://13064039998'
                    ScaleType={Enum.ScaleType.Crop}>
                    <Padding Padding={new UDim(0, 20)} />
                    <Flex flexDirection="column" alignItems="center" justifyContent="end" />
                    <textbutton
                        Event={{
                            MouseButton1Click: async () => {
                                const newPack = buyPack(player, "LOB");
                                if(newPack){
                                    setShowPackOpen(newPack);
                                } else {
                                    await alert("Cannot purchase pack.", player);
                                }
                            }
                        }}
                        Size={new UDim2(1, 0, .4, 0)}
                        BackgroundColor3={theme.colours.secondary}
                        TextScaled
                        BorderSizePixel={0}
                        Font={Enum.Font.Jura}
                        Text="1000 DP">
                        <uiaspectratioconstraint AspectRatio={16 / 9} />
                        <Padding Padding={new UDim(.1)} />
                    </textbutton>
                </imagelabel>
                <imagelabel
                    Size={new UDim2(1, 0, 1, 0)}
                    BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                    ImageTransparency={0.8}
                    BorderSizePixel={0}
                    Image='rbxassetid://13064040480'
                    ScaleType={Enum.ScaleType.Crop}>
                    <Padding Padding={new UDim(0, 20)} />
                    <Flex flexDirection="column" alignItems="center" justifyContent="end" />
                    <textlabel
                        Size={new UDim2(1, 0, .4, 0)}
                        BackgroundColor3={theme.colours.primary}
                        TextScaled
                        TextColor3={theme.colours.white}
                        BorderSizePixel={0}
                        Font={Enum.Font.Jura}
                        Text="COMING SOON">
                        <uiaspectratioconstraint AspectRatio={16 / 9} />
                        <Padding Padding={new UDim(.1)} />
                    </textlabel>
                </imagelabel>
            </scrollingframe>
        </Window>
    )
})
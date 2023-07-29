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
import { getProfile } from "server/profile-service/profiles";
import alert from "server/popups/alert";

const gap = 5;
const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(() => {
    const navigate = useNavigate();
    const playerData = usePlayerData();
    const decks = playerData ? Object.entries(playerData.decks) : [];

    return (
        <Window title="DECK LIST"
        >
            <scrollingframe 
            BorderSizePixel={0}
            BackgroundTransparency={1}
            ScrollBarThickness={1}
            AutomaticCanvasSize={Enum.AutomaticSize.Y}
            Size={new UDim2(1,0,.9,0)}>
                <uigridlayout
                CellSize={new UDim2(0,103,0,103)}
                CellPadding={new UDim2(0,gap,0,gap)}
                VerticalAlignment={Enum.VerticalAlignment.Top}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                />
                <Padding Padding={new UDim(0,gap)}/>
                <textbutton 
                    Size={new UDim2(1,0,1,0)}
                    BackgroundColor3={theme.colours.secondary}
                    BorderSizePixel={0}
                    TextScaled
                    Event={{
                        MouseButton1Click: async () => {
                            const deckName = await prompt("Enter deck name", player);
                            if(deckName === "***CANCEL***") return;
                            if(decks.find(([name]) => {return name === deckName;})) {
                                await alert("Deck name already exists", player);
                                return;
                            }
                            if(deckName === "") {
                                return;
                            }
                            if (deckName) {
                                const profile = getProfile(player);
                                profile!.Data.decks[deckName] = {
                                    deck: [],
                                    extra: []
                                };
                                navigate("/deck/"+deckName);
                            }
                        }
                    }}
                    Font={Enum.Font.Jura}
                    Text={'+'}>
                        <uiaspectratioconstraint AspectRatio={1}/>
                        <Padding Padding={new UDim(0,20)}/>
                    </textbutton>
                {decks.map(([deckName, deck]) => {
                    return <textbutton 
                    Size={new UDim2(1,0,1,0)}
                    BackgroundColor3={theme.colours.secondary}
                    BorderSizePixel={0}
                    TextScaled
                    Event={{
                        MouseButton1Click: () => {
                            navigate("/deck/"+deckName);
                        }
                    }}
                    Font={Enum.Font.Jura}
                    Text={deckName+''}>
                        <uiaspectratioconstraint AspectRatio={1}/>
                        <Padding Padding={new UDim(0,20)}/>
                    </textbutton>
                })}
            </scrollingframe>
        </Window>
    )
})
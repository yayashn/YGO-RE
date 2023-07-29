import Roact from "@rbxts/roact";
import { withHooks } from "@rbxts/roact-hooked";
import usePlayerStat from "gui/hooks/usePlayerStat";
import type { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import Flex from "shared/components/Flex";
import Padding from "shared/components/Padding";
import theme from "shared/theme";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(() => {
    const duel = getDuel(player)!;
    const yPlayer = duel.getPlayer(player);
    const targettableCards = usePlayerStat<"targettableCards", Card[]>(yPlayer, 'targettableCards');

    return (
        <frame
            BackgroundTransparency={1}
            Size={new UDim2(1, 0, 1, 0)}>
            <Flex flexDirection='column' justifyContent='center' alignItems='center' />
            <scrollingframe
                ScrollBarThickness={2}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundColor3={theme.colours.primary}
                Size={new UDim2(0, 400, 0, 200)}
                BackgroundTransparency={.2}
                BorderSizePixel={0}
            >
                <Padding Padding={new UDim(0, 20)} />
                <uigridlayout
                    CellPadding={new UDim2(0, 10, 0, 10)}
                    FillDirection={Enum.FillDirection.Horizontal}
                    CellSize={new UDim2(0, 52.15, 0, 83)}
                />
                {targettableCards.map((card) => {
                    return <imagebutton
                        Image={card.art}
                        BorderSizePixel={0}
                        Size={new UDim2(0, 52.15, 0, 83)}
                        Event={{
                            MouseButton1Click: () => {
                                if(!yPlayer.targets.get().includes(card)) {
                                    yPlayer.targets.set([...yPlayer.targets.get(), card])
                                } else {
                                    yPlayer.targets.set(yPlayer.targets.get().filter((c) => c !== card))
                                }
                            }
                        }}
                    >
                        <textlabel
                            BackgroundTransparency={1}
                            Size={new UDim2(1,0,1,-5)}
                            TextYAlignment={Enum.TextYAlignment.Bottom}
                            TextXAlignment={Enum.TextXAlignment.Center}
                            Text={card.location.get()}
                            Font={Enum.Font.Jura}
                            TextSize={14}
                            TextColor3={theme.colours.white}
                            TextStrokeColor3={theme.colours.white}
                            TextStrokeTransparency={0}
                        />
                    </imagebutton>
                })}
            </scrollingframe>
        </frame>
    )
})
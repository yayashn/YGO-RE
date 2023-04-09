import Roact from '@rbxts/roact'
import colours from 'gui/colours'
import { useGlobalState } from 'shared/useGlobalState'
import { Players } from '@rbxts/services'
import { deckStore } from './Store'
import { useEffect, useState, withHooks } from '@rbxts/roact-hooked'
import Object from '@rbxts/object-utils'
import prompt from 'server/gui/prompt'

const DEV = Players.GetChildren().size() === 0

const player = script.FindFirstAncestorWhichIsA("Player")
const getDecks = player?.WaitForChild("getDecks") as BindableFunction
const addDeck = player?.WaitForChild("addDeck") as BindableEvent

const defaultList = [
    "default",

]

export default withHooks(() => {
    const [deckState, setDeckState] = useGlobalState(deckStore)
    const [deckList, setDeckList] = useState<string[]>([])
    const [addDeckHack, setAddDeckHack] = useState(0)

    useEffect(() => {
        if(DEV) {
            setDeckList(defaultList)
        }
        if(!DEV) {
            try {
                setDeckList((Object.keys(getDecks.Invoke()) ?? []) as string[])
            } catch {
                setDeckList([])
            }
        }
    }, [deckState, addDeckHack])

    if(!DEV && !player) {
        return
    }

    return (
        <scrollingframe
            Size={new UDim2(1, 0, 1, 0)}
            BorderSizePixel={0}
            BackgroundTransparency={1}
            ScrollBarThickness={4}
            CanvasSize={new UDim2(0, 0, 0, 0)}
            AutomaticCanvasSize={Enum.AutomaticSize.Y}
        >
            <uigridlayout
                CellPadding={new UDim2(0, 50, 0, 50)}
                CellSize={new UDim2(0, 75, 0, 75)}
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />
            <uipadding
                PaddingLeft={new UDim(0, 30)}
                PaddingRight={new UDim(0, 30)}
                PaddingTop={new UDim(0, 30)}
                PaddingBottom={new UDim(0, 100)}
            />
            <textbutton 
            Event={{
                MouseButton1Click: async () => {
                    if(DEV) return;
                    const input = await prompt(player!, "Enter deck name");
                    if(!input) return;
                    addDeck.Fire(input)
                    setAddDeckHack(addDeckHack => addDeckHack + 1)
                }
            }}
            AutomaticSize="XY"
            Text="" LayoutOrder={-1} BorderSizePixel={0}>
                <uiaspectratioconstraint AspectRatio={1} />
                <frame
                    Size={new UDim2(0, 100, 0, 100)}
                    BorderSizePixel={0}
                    BackgroundTransparency={0}
                    BackgroundColor3={colours.outline}
                >
                    <uistroke
                        Color={colours.outline}
                        Thickness={5}
                        LineJoinMode={Enum.LineJoinMode.Miter}
                    />
                </frame>
                <textlabel
                    Text="+"
                    Size={new UDim2(0, 100, 0, 100)}
                    BackgroundTransparency={1}
                    TextYAlignment={Enum.TextYAlignment.Center}
                    TextXAlignment={Enum.TextXAlignment.Center}
                    TextStrokeColor3={colours.outline}
                    Font={Enum.Font.SourceSansBold}
                    BackgroundColor3={colours.background}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled
                />
            </textbutton>
            {deckList.map((deckListName, i) => {
                return (
                    <textbutton
                        Event={{
                            MouseButton1Click: () => {
                                setDeckState(deckListName)
                            }
                        }}
                        Text=""
                        LayoutOrder={i}
                        BorderSizePixel={0}
                        AutomaticSize="XY"
                    >
                        <uiaspectratioconstraint AspectRatio={1} />
                        <frame
                            Size={new UDim2(0, 100, 0, 100)}
                            BorderSizePixel={0}
                            BackgroundTransparency={0}
                        >
                            <uistroke
                                Color={colours.outline}
                                Thickness={5}
                                LineJoinMode={Enum.LineJoinMode.Miter}
                            />
                        </frame>
                        <textlabel
                            Text={deckListName}
                            Size={new UDim2(0, 100, 0, 100)}
                            BackgroundTransparency={1}
                            Position={new UDim2(0, 0, 0, 0)}
                            AnchorPoint={new Vector2(0, 0)}
                            TextYAlignment={Enum.TextYAlignment.Bottom}
                            TextStrokeColor3={colours.outline}
                            Font={Enum.Font.SourceSansBold}
                            TextSize={20}
                        />
                    </textbutton>
                )
            })}
        </scrollingframe>
    )
})

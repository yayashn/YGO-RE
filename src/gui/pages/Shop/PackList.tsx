import Roact from '@rbxts/roact'
import colours from 'shared/colours'
import Pack from './Pack'
import { withHooks } from '@rbxts/roact-hooked'
import { useGlobalState } from 'shared/useGlobalState'
import { showPackOpenStore } from './Store'
import { CardFolder } from 'server/types'
import alert from 'server/gui/alert'

const player = script.FindFirstAncestorWhichIsA("Player")
const buyCards = player?.WaitForChild("buyCards") as BindableFunction

export default withHooks(() => {
    const [showPackOpen, setShowPackOpen] = useGlobalState(showPackOpenStore)

    return (
        <Roact.Fragment>
            <scrollingframe 
            AutomaticCanvasSize={Enum.AutomaticSize.Y}
            CanvasSize={new UDim2(0, 0, 0, 0)}
            ScrollBarThickness={5}
            BorderSizePixel={0}
            LayoutOrder={1}
            BackgroundTransparency={1} Size={new UDim2(1, 0, 0.9, 0)}>
                <uigridlayout
                    CellPadding={new UDim2(0, 50, 0, 50)}
                    CellSize={new UDim2(0, 285, 0, 200)}
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
                <uipadding
                    PaddingLeft={new UDim(0, 30)}
                    PaddingRight={new UDim(0, 30)}
                    PaddingTop={new UDim(0, 30)}
                    PaddingBottom={new UDim(0, 30)}
                />
                <Pack
                    icon='rbxgameasset://Images/avatar-89631139'
                    text='Legend of Blue Eyes White Dragon'
                    cost={1000}
                    onClick={async () => {
                        const purchaseSuccess: CardFolder[] = buyCards.Invoke("LOB")
                        if (purchaseSuccess) {
                            setShowPackOpen(purchaseSuccess)
                        } else {
                            await alert(player!, "You don't have enough money to buy this pack!")
                        }
                    }}
                />
                <textbutton Text="" BorderSizePixel={5} BorderColor3={colours.outline}>
                    <imagelabel
                        BackgroundTransparency={1}
                        Size={new UDim2(1, 0, 1, 0)}
                        ScaleType="Crop"
                        Image="rbxgameasset://Images/avatar-25833572"
                    ></imagelabel>
                    <frame
                        Size={new UDim2(1, 0, 1, 0)}
                        BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                        BackgroundTransparency={0.3}
                    />
                    <textlabel
                        Text="COMING SOON!"
                        Size={new UDim2(1, 0, 0, 0)}
                        AutomaticSize="Y"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        BackgroundTransparency={1}
                        Position={new UDim2(0, 0, .8, 0)}
                        AnchorPoint={new Vector2(0, 1)}
                        TextSize={24}
                        Font={Enum.Font.GothamBold}
                    />
                </textbutton>
            </scrollingframe>
        </Roact.Fragment>
    )
})

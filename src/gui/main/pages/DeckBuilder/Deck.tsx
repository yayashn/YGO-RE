import Roact from "@rbxts/roact";
import { Div, Img } from "shared/rowindcss";
import { getCardData } from "shared/utils";
import DeckBuilderContext from "./DeckBuilderContext";
import { useContext, withHooks } from "@rbxts/roact-hooked";

const player = script.FindFirstAncestorWhichIsA("Player")!
const removeCardFromDeck = player.WaitForChild("removeCardFromDeck") as BindableEvent

export default withHooks(() => {
    const {
        useDeck: [deck],
        refreshCards
    } = useContext(DeckBuilderContext)
    return (
        <Div className="w-[70%] h-[100%] flex flex-col gap-[3%] z-50">
            <Div className="w-full h-[76%] bg-gray-800 z-50 overflow-y">
                <uigridlayout CellSize={new UDim2(.1,0,.277,0)} CellPadding={new UDim2(0,0,0,0)}/>
                {deck.map((card) => {
                    const art = (getCardData(card.name)!.FindFirstChild("art") as ImageButton).Image
                    return <imagebutton Event={{
                        MouseButton1Click: () => {
                            removeCardFromDeck.Fire(card)
                            refreshCards()
                        }
                    }}
                    ZIndex={90} Image={art}/>  
                })}
            </Div>
            <Div className="w-full h-[21%] bg-gray-800 z-50">
                <uigridlayout CellSize={new UDim2(.1,0,1,0)} CellPadding={new UDim2(0,0,0,0)}/>
            </Div>
        </Div>
    )
})
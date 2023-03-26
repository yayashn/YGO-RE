import Roact from "@rbxts/roact";
import { Button, Div, Img, Input, Text } from "shared/rowindcss";
import { getCardData } from "shared/utils";
import colours from "../../colours";
import { useContext, useEffect, useState, withHooks } from "@rbxts/roact-hooked";
import { ReplicatedStorage, ServerStorage } from "@rbxts/services";
import Object from "@rbxts/object-utils";
import { Card } from "server/profile/profileTemplate";
import DeckBuilderContext from "./DeckBuilderContext";

const cardSearchInput = ReplicatedStorage.FindFirstChild("remotes")!.FindFirstChild("cardSearchInput") as RemoteEvent
const cardSearchScript = ServerStorage.FindFirstChild("cardSearch") as LocalScript
const player = script.FindFirstAncestorWhichIsA("Player")!
const addCardToDeck = player.WaitForChild("addCardToDeck") as BindableEvent

export default withHooks(() => {
    const inputRef = Roact.createRef<TextBox>();
    const [input, setInput] = useState<string>("")
    const { 
        useCards: [cards, setCards],
        useDeck: [deck, setDeck],
        refreshCards
    } = useContext(DeckBuilderContext)

    const parsedCards = Object.entries((() => {
        const listCards: Record<string, {
            amount: number,
            card: Card
        }> = {}
        cards.forEach(card => {
            if(listCards[card.name]) {
                listCards[card.name].amount++
            } else {
                listCards[card.name] = {
                    amount: 1,
                    card: card
                }
            }
        })

        deck.forEach(card => {
            if(listCards[card.name]) {
                listCards[card.name].amount--
            }
        })

        return listCards
    })())

    useEffect(() => {
        if(inputRef.getValue()) {
            const cardSearchScriptClone = cardSearchScript.Clone()
            cardSearchScriptClone.Parent = inputRef.getValue()
            cardSearchInput.OnServerEvent.Connect((p, text) => {
                if(p !== player) return
                setInput(text as string)
            })
        }
    }, [inputRef])

    return (
        <Div className="h-full w-[28%] h-[100%] z-50 flex flex-col">
            <Input placeholder="Search" ref={inputRef} 
            className={`w-full h-[5%] bg-[${colours.primary}] z-50 font-bold text-white text-center`}/>
            <Div className="bg-gray-800 w-full h-[95%] z-50 flex flex-col overflow-y">
                {parsedCards.map(([cardName, {amount, card}]) => {
                    if(!(cardName.lower().match(input.lower()).size() > 0)) return <Roact.Fragment/>
                    const cardData = getCardData(cardName)!
                    const art = (cardData.FindFirstChild("art") as ImageButton).Image

                    return (
                        <Button 
                        Event={{
                            MouseButton1Click: () => {
                                addCardToDeck.Fire(card)
                                refreshCards()
                            }
                        }}
                        className="w-full h-[20%] flex z-50 hover:bg-gray-500">
                            <imagelabel 
                            ImageTransparency={amount === 0 ? 0.5 : 0}
                            LayoutOrder={-1} Size={new UDim2(0.25,0,1,0)}
                            ZIndex={90} Image={art}/>
                            <Div className="w-[75%] flex flex-col h-full">
                                <Text className="text-white w-[75%] h-[25%] font-bold z-50 p-[5%]" Text={cardName}/>
                                <Text className="text-white w-[75%] h-[25%] font-bold z-50 p-[5%]" Text={`x${amount}`}/>
                            </Div>
                        </Button>
                    )
                })}
            </Div>
        </Div>
    )
})
import Roact from "@rbxts/roact"
import { Div, Button, Text, Input } from "../../rowindcss/index"
import colours from "../colours"
import { useEffect, useRef, useState } from "@rbxts/roact-hooked"
import type { ProfileTemplate, Card } from "server/profile/profileTemplate"
import { getCardData } from "shared/utils"
import Object from "@rbxts/object-utils"
import { ReplicatedStorage, ServerStorage } from "@rbxts/services"

const player = script.FindFirstAncestorWhichIsA("Player")!
const getDeck = player.WaitForChild("getDeck") as BindableFunction
const getCards = player.WaitForChild("getCards") as BindableFunction
const addCardToDeck = player.WaitForChild("addCardToDeck") as BindableEvent
const removeCardFromDeck = player.WaitForChild("removeCardFromDeck") as BindableEvent
const cardSearchInput = ReplicatedStorage.FindFirstChild("remotes")!.FindFirstChild("cardSearchInput") as RemoteEvent
const cardSearchScript = ServerStorage.FindFirstChild("cardSearch") as LocalScript

export default () => {
    const ref = useRef<Frame>()
    const inputRef = useRef<TextBox>()
    const [input, setInput] = useState<string>("")
    const [cards, setCards] = useState<Card[]>([])
    const [deck, setDeck] = useState<Card[]>([])

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

    const refreshCards = () => {
        setCards(getCards.Invoke())
        setDeck(getDeck.Invoke())
    }

    useEffect(() => {
        refreshCards()
    }, [])

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
        <Div ref={ref} className={`w-11/12 h-11/12 max-w-[1000px] aspect-[16/9] bg-[${colours.primary}] top-1/2 left-1/2 origin-center 
         rounded-[2%] px-[0.3%] py-[0.5%]`}>
            <Div className={`w-[15%] h-[10%] rounded-[20%] z-20 bg-[${colours.primary}] top-[-7%] left-[-0.3%] overflow-hidden`}>
                <Div className="bg-gray-900 w-[96%] h-[95%] top-[6%] left-[2%] rounded-[20%] px-[10%] z-[90]">
                    <Button Event={{
                        MouseButton1Click: () => {
                            ref.getValue()!.Visible = false
                        }
                    }}
                    className="h-1/2 aspect-[1] bg-red-600 rounded-[100%] text-white left-[-5%] top-[15%] z-[90] text-center" Text="×"/>
                </Div>
            </Div>
            <Div className="w-full h-full bg-gray-900 rounded-[2%] flex flex-col items-center p-[2%] gap-[2%] z-30">
                <Text className="text-white uppercase w-full h-[8%] font-bold z-50 text-center" Text="Deck Builder"/>
                <Div className="w-full h-[88%] flex gap-[2%] z-50">
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
                    <Div className="h-full w-[28%] h-[100%] z-50 flex flex-col">
                        <Input placeholder="Search" ref={inputRef} 
                        className={`w-full h-[5%] bg-[${colours.primary}] z-50 font-bold text-white text-center`}/>
                        <Div className="bg-gray-800 w-full h-[95%] z-50 flex flex-col overflow-y">
                            {parsedCards.map(([cardName, {amount, card}]) => {
                                if(!(cardName.lower().match(input.lower()).size() > 0)) return <Roact.Fragment/>
                                const cardData = getCardData(cardName)!
                                const art = (cardData.FindFirstChild("art") as ImageButton).Image

                                return (
                                    <Div className="w-full h-[20%] flex z-50">
                                        <imagebutton 
                                        ImageTransparency={amount === 0 ? 0.5 : 0}
                                        Event={{
                                            MouseButton1Click: () => {
                                                addCardToDeck.Fire(card)
                                                refreshCards()
                                            }
                                        }}
                                        Key="-1" Size={new UDim2(0.25,0,1,0)}
                                        ZIndex={90} Image={art}/>
                                        <Div className="w-[75%] flex flex-col h-full">
                                            <Text className="text-white w-[75%] h-[25%] font-bold z-50 p-[5%]" Text={cardName}/>
                                            <Text className="text-white w-[75%] h-[25%] font-bold z-50 p-[5%]" Text={`x${amount}`}/>
                                        </Div>
                                    </Div>
                                )
                            })}
                        </Div>
                    </Div>
                </Div>
            </Div>
        </Div>
    )
}
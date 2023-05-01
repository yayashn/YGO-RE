import Roact from '@rbxts/roact'
import colours from 'shared/colours'
import { useGlobalState } from 'shared/useGlobalState'
import { Players, ReplicatedStorage, ServerScriptService, ServerStorage } from '@rbxts/services'
import { deckStore } from './Store'
import { useEffect, useRef, useState, withHooks } from '@rbxts/roact-hooked'
import Object from '@rbxts/object-utils'
import { Card } from 'server/profile/profileTemplate'
import { getCardData, includes } from 'shared/utils'
import { CardFolder } from 'server/types'

const DEV = Players.GetChildren().size() === 0
const player = script.FindFirstAncestorWhichIsA('Player')
const getDeck = player?.WaitForChild('getDeck') as BindableFunction
const getCards = player?.WaitForChild('getCards') as BindableFunction

const cardSearchInput = ReplicatedStorage.FindFirstChild('remotes')!.FindFirstChild(
    'cardSearchInput'
) as RemoteEvent
const cardSearchScript = ServerStorage.FindFirstChild('cardSearch') as LocalScript
const addCardToDeck = player?.WaitForChild('addCardToDeck') as BindableEvent
const removeCardFromDeck = player?.WaitForChild('removeCardFromDeck') as BindableEvent

let playersFolder: Folder;
let playerFolder: Folder;
let dpValue: IntValue;
try {
    playersFolder = ServerScriptService.FindFirstChild("instances")!.FindFirstChild('players') as Folder
    playerFolder = playersFolder.FindFirstChild(player!.Name) as Folder
    dpValue = playerFolder.WaitForChild('dp') as IntValue
} catch {

}

const defaultCards = [
    { name: 'Skull Servant' },
    { name: 'Skull Servant' },
    { name: 'Skull Servant' },
    { name: 'Basic Insect' },
    { name: 'Basic Insect' },
    { name: 'Basic Insect' },
    { name: 'Dark Gray' },
    { name: 'Dark Gray' },
    { name: 'Dark Gray' },
    { name: 'Nemuriko' },
    { name: 'Nemuriko' },
    { name: 'Nemuriko' },
    { name: 'Flame Manipulator' },
    { name: 'Flame Manipulator' },
    { name: 'Flame Manipulator' },
    { name: 'Monster Egg' },
    { name: 'Monster Egg' },
    { name: 'Monster Egg' },
    { name: 'Firegrass' },
    { name: 'Firegrass' },
    { name: 'Firegrass' },
    { name: 'Petit Angel' },
    { name: 'Petit Angel' },
    { name: 'Petit Angel' },
    { name: 'Petit Dragon' },
    { name: 'Petit Dragon' },
    { name: 'Petit Dragon' },
    { name: 'Hinotama Soul' },
    { name: 'Hinotama Soul' },
    { name: 'Hinotama Soul' },
    { name: 'Sparks' },
    { name: 'Sparks' },
    { name: 'Sparks' },
    { name: 'Red Medicine' },
    { name: 'Red Medicine' },
    { name: 'Red Medicine' },
    { name: 'Kurama' },
    { name: 'Kurama' },
    { name: 'Kurama' },
    { name: 'Spike Seadra' }
]

export default withHooks(() => {
    const [deckState, setDeckState] = useGlobalState(deckStore)

    const [deck, setDeck] = useState(
        DEV
            ? defaultCards
            : (getDeck.Invoke(deckState).deck as {
                  name: string
              }[]) || []
    )

    const [extra, setExtra] = useState(
        DEV
            ? defaultCards
            : (getDeck.Invoke(deckState).deck as {
                  name: string
              }[]) || []
    )

    const [cards, setCards] = useState(
        DEV
            ? defaultCards
            : (getCards.Invoke().deck as {
                  name: string
              }[]) || []
    )

    const inputRef = useRef<TextBox>()
    const [input, setInput] = useState<string>('')

    useEffect(() => {
        if (!DEV && inputRef.getValue()) {
            const cardSearchScriptClone = cardSearchScript.Clone()
            cardSearchScriptClone.Parent = inputRef.getValue()
            const connection = cardSearchInput.OnServerEvent.Connect((p, text) => {
                if (p !== player) return
                setInput(text as string)
            })

            return () => {
                cardSearchScriptClone.Destroy()
                connection.Disconnect()
            }
        }
    }, [inputRef])

    const refreshCards = () => {
        if (DEV) return
        setCards(getCards.Invoke(deckState))
        setDeck(getDeck.Invoke(deckState).deck)
        setExtra(getDeck.Invoke(deckState).extra)
    }

    useEffect(() => {
        refreshCards()
        const connection = dpValue.Changed.Connect(() => {
            refreshCards()
        })

        return () => {
            connection.Disconnect()
        }
    }, [])

    const parsedCards = Object.entries(
        (() => {
            const listCards: Record<
                string,
                {
                    amount: number
                    card: Card
                }
            > = {}
            cards.forEach((card) => {
                if (listCards[card.name]) {
                    listCards[card.name].amount++
                } else {
                    listCards[card.name] = {
                        amount: 1,
                        card: card
                    }
                }
            })

            deck.forEach((card) => {
                if (listCards[card.name]) {
                    listCards[card.name].amount--
                }
            })

            extra.forEach((card) => {
                if (listCards[card.name]) {
                    listCards[card.name].amount--
                }
            })

            return listCards
        })()
    )

    if(!player && !DEV) return <Roact.Fragment/>

    return (
        <frame Size={new UDim2(1, 0, 1, 0)} BorderSizePixel={0} BackgroundTransparency={1}>
            <uilistlayout FillDirection={Enum.FillDirection.Horizontal} />
            <frame Size={new UDim2(0.7, 0, 1, 0)} BackgroundTransparency={1}>
                <uipadding
                    PaddingTop={new UDim(0, 10)}
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                />
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    Padding={new UDim(0, 10)}
                />
                <scrollingframe
                    BackgroundColor3={colours.background}
                    BorderColor3={colours.outline}
                    Size={new UDim2(1, 0, 0.7, 0)}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    ScrollBarThickness={5}
                >
                    <uigridlayout CellSize={new UDim2(0, 100 * 0.61, 0, 150 * 0.61)} />
                    {deck.map((card) => {
                        try {
                            const cardData = getCardData(card.name) as CardFolder
                            print(cardData, card.name)
                            const art = cardData.art.Image
                            return (
                                <imagebutton
                                    Event={{
                                        MouseButton1Click: () => {
                                            if (DEV) return
                                            removeCardFromDeck.Fire(card, deckState, includes(cardData.type.Value, "Fusion"))
                                            refreshCards()
                                        }
                                    }}
                                    ZIndex={90}
                                    Image={art}
                                />
                            )                            
                        } catch {
                            print("Error loading card: " + card.name)
                            return <Roact.Fragment/>
                        }
                    })}
                </scrollingframe>
                <scrollingframe
                    BackgroundColor3={colours.background}
                    BorderColor3={colours.outline}
                    Size={new UDim2(1, 0, 0.3, -50)}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    ScrollBarThickness={5}
                >
                    <uigridlayout CellSize={new UDim2(0, 100 * 0.61, 0, 150 * 0.61)} />
                    {extra.map((card) => {
                        try {
                            const cardData = getCardData(card.name) as CardFolder
                            print(cardData, card.name)
                            const art = (cardData.FindFirstChild('art') as ImageButton)
                            .Image
                        return (
                            <imagebutton
                                Event={{
                                    MouseButton1Click: () => {
                                        if (DEV) return
                                        removeCardFromDeck.Fire(card, deckState, true)
                                        refreshCards()
                                    }
                                }}
                                ZIndex={90}
                                Image={art}
                            />
                        )
                        } catch {
                            print("Error loading card: " + card.name)
                            return <Roact.Fragment/>
                        }
                    })}
                </scrollingframe>
            </frame>
            <frame Size={new UDim2(0.3, 0, 1, 0)} BackgroundTransparency={1}>
                <uipadding
                    PaddingTop={new UDim(0, 10)}
                    PaddingBottom={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                />
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    Padding={new UDim(0, 10)}
                />
                <textbox
                    Ref={inputRef}
                    BackgroundColor3={colours.background}
                    BorderColor3={colours.outline}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    Size={new UDim2(1, 0, 0, 30)}
                    PlaceholderText={'Search'}
                    Text=""
                />
                <scrollingframe
                    BackgroundColor3={colours.background}
                    Size={new UDim2(1, 0, 1, -80)}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    ScrollBarThickness={5}
                    BorderSizePixel={0}
                >
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Vertical}
                        Padding={new UDim(0, 5)}
                    />
                    <uipadding PaddingRight={new UDim(0, 10)} PaddingTop={new UDim(0, 2)} />
                    {parsedCards.map(([cardName, { amount, card }]) => {
                        if (!DEV && !(cardName.lower().match(input.lower()).size() > 0))
                            return <Roact.Fragment />
                        const cardData = getCardData(cardName) as CardFolder
                        print(cardData, card.name)
                        const art = (cardData.FindFirstChild('art') as ImageButton).Image
                        return (
                            <textbutton
                                AutoButtonColor={amount !== 0}
                                Event={{
                                    MouseButton1Click: () => {
                                        if (DEV) {
                                            return
                                        }
                                        addCardToDeck.Fire(card, deckState, includes(cardData.type.Value, "Fusion"))
                                        refreshCards()
                                    }
                                }}
                                Text=""
                                BorderSizePixel={1}
                                BorderColor3={colours.outline}
                                BackgroundColor3={colours.background}
                                Size={new UDim2(1, 0, 0, 50)}
                                BackgroundTransparency={0}
                            >
                                <uilistlayout
                                    FillDirection={Enum.FillDirection.Horizontal}
                                    Padding={new UDim(0, 5)}
                                />
                                <imagelabel
                                    BorderSizePixel={0}
                                    Image={art}
                                    ImageTransparency={amount === 0 ? 0.5 : 0}
                                    BackgroundTransparency={1}
                                    Size={new UDim2(1, 0, 1, 0)}
                                >
                                    <uiaspectratioconstraint AspectRatio={59 / 86} />
                                </imagelabel>
                                <frame
                                    BackgroundTransparency={1}
                                    Size={new UDim2(1, 0, 1, 0)}
                                    ClipsDescendants
                                >
                                    <uilistlayout
                                        FillDirection={Enum.FillDirection.Vertical}
                                        HorizontalAlignment={Enum.HorizontalAlignment.Left}
                                        Padding={new UDim(0, 10)}
                                    />
                                    <uipadding
                                        PaddingTop={new UDim(0, 5)}
                                    />
                                    <textlabel
                                        BackgroundTransparency={1}
                                        Text={cardName}
                                        TextXAlignment={Enum.TextXAlignment.Left}
                                        TextColor3={Color3.fromRGB(255, 255, 255)}
                                        TextScaled={true}
                                        Size={new UDim2(1, 0, 0, 14)}
                                    />
                                    {<textlabel
                                        BackgroundTransparency={1}
                                        Text={`x${amount}`}
                                        TextXAlignment={Enum.TextXAlignment.Left}
                                        TextColor3={Color3.fromRGB(255, 255, 255)}
                                        TextScaled={true}
                                        Size={new UDim2(1, 0, 0, 14)}
                                    />}
                                </frame>
                            </textbutton>
                        )
                    })}
                </scrollingframe>
            </frame>
        </frame>
    )
})

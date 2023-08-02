import Roact from '@rbxts/roact'
import { useEffect, useRef, useState, withHooks } from '@rbxts/roact-hooked'
import Flex from 'shared/components/Flex'
import Window from 'gui/components/Window'
import usePlayerData from 'gui/hooks/usePlayerData'
import theme from 'shared/theme'
import { useNavigate, useRoute } from 'gui/router'
import { Dictionary as Object } from '@rbxts/sift'
import getCardData from 'shared/utils'
import {
    equipDeck,
    getProfile,
    saveDeck,
} from 'server/profile-service/profiles'
import TextboxServer from 'server/popups/TextboxServer'
import alert from 'server/popups/alert'
import ResetCanvasPosition from 'server-storage/client-components/ResetCanvasPosition/ResetCanvasPosition'
import { CardTemplate } from 'server/types'

const gap = 5
const player = script.FindFirstAncestorWhichIsA('Player')!

export default withHooks(() => {
    const navigate = useNavigate()
    const playerData = getProfile(player)?.Data
    const route = useRoute()
    const decks = playerData ? Object.entries(playerData.decks) : []
    const deckName = route.split('/').pop()!;
    const [mainDeck, setMainDeck] = useState(playerData?.decks[deckName].deck || [])
    const [extraDeck, setExtraDeck] = useState(playerData?.decks[deckName].extra || [])
    const [cards, setCards] = useState(playerData!.cards);
    const [search, setSearch] = useState('')
    const searchFrame = useRef<ScrollingFrame>()
    const [isSaved, setIsSaved] = useState(true)

    useEffect(() => {
        if (!searchFrame.getValue()) return
        searchFrame.getValue()!.CanvasPosition = new Vector2(0, 0)
    }, [search])

    const addCardToMainDeck = (card: CardTemplate) => {
        if (mainDeck.size() >= 60) return
        if(mainDeck.filter((c) => c.name === card.name).size() === 3) return
        setMainDeck([...mainDeck, card])
    }

    const addCardToExtraDeck = (card: CardTemplate) => {
        if (extraDeck.size() >= 15) return
        if(extraDeck.filter((c) => c.name === card.name).size() === 3) return
        setExtraDeck([...extraDeck, card])   
    }

    const removeCardFromMainDeck = (card: CardTemplate) => {
        for(let i = 0; i < mainDeck.size(); i++) {
            if(mainDeck[i].name === card.name) {
                mainDeck.remove(i)
                break
            }
        }
        setMainDeck([...mainDeck])
    }

    const removeCardFromExtraDeck = (card: CardTemplate) => {
        for(let i = 0; i < extraDeck.size(); i++) {
            if(extraDeck[i].name === card.name) {
                extraDeck.remove(i)
                break
            }
        }
        setExtraDeck([...extraDeck])
    }

    useEffect(() => {
        setIsSaved(false)
    }, [mainDeck, extraDeck])

    if (!deckName) {
        return <Roact.Fragment />
    }

    const deck = (decks.find(([name]) => name === deckName) || [])[1]
    const isEquipped = playerData?.equipped.deck === deckName

    return (
        <Window
            title="DECK"
            buttons={[
                <textbutton
                    Event={{
                        MouseButton1Click: () => {
                            navigate('/decklist/')
                        }
                    }}
                    Text="←"
                    TextColor3={theme.colours.white}
                    Font={Enum.Font.Code}
                    BackgroundTransparency={1}
                    TextScaled={true}
                    AnchorPoint={new Vector2(0, 0)}
                    Size={new UDim2(0, 50, 1, 0)}
                    Position={new UDim2(0, 0, 0, 0)}
                >
                    <uiaspectratioconstraint AspectRatio={1} />
                </textbutton>,
                <textbutton
                    Event={{
                        MouseButton1Click: () => {
                            if (isSaved) return
                            saveDeck(player, deckName, mainDeck, extraDeck)
                            setIsSaved(true)
                        }
                    }}
                    Text={isSaved ? 'SAVED' : 'SAVE'}
                    TextColor3={theme.colours.white}
                    Font={Enum.Font.Code}
                    BackgroundTransparency={1}
                    TextSize={14}
                    TextYAlignment={Enum.TextYAlignment.Center}
                    AnchorPoint={new Vector2(0, 0)}
                    Size={new UDim2(0, 100, 1, 0)}
                    Position={new UDim2(0, 0, 0, 0)}
                >
                    <uiaspectratioconstraint AspectRatio={1} />
                </textbutton>,
                <textbutton
                    Event={{
                        MouseButton1Click: () => {
                            if (isEquipped) return
                            equipDeck(player, deckName)
                        }
                    }}
                    Text={isEquipped ? 'EQUIPPED' : 'EQUIP'}
                    TextColor3={theme.colours.white}
                    Font={Enum.Font.Code}
                    BackgroundTransparency={1}
                    TextSize={14}
                    TextYAlignment={Enum.TextYAlignment.Center}
                    AnchorPoint={new Vector2(0, 0)}
                    Size={new UDim2(0, 100, 1, 0)}
                    Position={new UDim2(0, 0, 0, 0)}
                >
                    <uiaspectratioconstraint AspectRatio={1} />
                </textbutton>
            ]}
        >
            <Flex gap={new UDim(0, gap)} />
            <frame BorderSizePixel={0} BackgroundTransparency={1} Size={new UDim2(0.7, -gap, 1, 0)}>
                <Flex flexDirection="column" gap={new UDim(0, gap)} />
                <scrollingframe
                    BorderSizePixel={0}
                    ScrollBarThickness={1}
                    BackgroundTransparency={0.9}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    Size={new UDim2(1, 0, 1, -gap - 83)}
                >
                    <uigridlayout CellSize={new UDim2(0, 52.15, 0, 83)} />
                    {mainDeck.map((card) => {
                        const cardData = getCardData(card.name)
                        if (!cardData) {
                            alert(
                                `Card ${card.name} not found! Report this to the developer or in discord.`,
                                player
                            )
                        }

                        return (
                            <imagebutton
                                Event={{
                                    MouseButton1Click: () => {
                                        removeCardFromMainDeck(card)
                                    }
                                }}
                                Image={cardData?.art}
                            />
                        )
                    })}
                </scrollingframe>
                <scrollingframe
                    BorderSizePixel={0}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    ScrollBarThickness={1}
                    BackgroundTransparency={0.9}
                    Size={new UDim2(1, 0, 0, 83)}
                >
                    <uigridlayout CellSize={new UDim2(0, 52.15, 0, 83)} />
                    {extraDeck.map((card) => {
                        const cardData = getCardData(card.name)

                        return (
                            <imagebutton
                                Event={{
                                    MouseButton1Click: () => {
                                        removeCardFromExtraDeck(card)
                                    }
                                }}
                                Image={cardData?.art}
                            />
                        )
                    })}
                </scrollingframe>
            </frame>

            <frame BorderSizePixel={0} BackgroundTransparency={0.9} Size={new UDim2(0.3, 0, 1, 0)}>
                <Flex flexDirection="column" />
                <textbox
                    BackgroundTransparency={1}
                    PlaceholderText={'Search'}
                    Text=""
                    TextColor3={theme.colours.white}
                    PlaceholderColor3={theme.colours.white}
                    Size={new UDim2(1, 0, 0, 20)}
                >
                    <TextboxServer setTextboxState={setSearch} />
                </textbox>
                <scrollingframe
                    BorderSizePixel={0}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    ScrollBarThickness={1}
                    BackgroundTransparency={1}
                    Size={new UDim2(1, 0, 1, -20)}
                >
                    <Flex flexDirection="column" gap={new UDim(0, gap)} />
                    <ResetCanvasPosition src={search} player={player} />
                    {cards.map((card, i) => {
                        const cardData = getCardData(card.name)!
                        const cardType = cardData.type
                        const numberOfCardsInDeck = mainDeck
                            .filter((c) => c.name === card.name)
                            .size()
                        const numberOfCardsInExtra = extraDeck
                            .filter((c) => c.name === card.name)
                            .size()
                        const numberOfCardsInCards = cards
                            .filter((c) => c.name === card.name)
                            .size()
                        const numberOfCardsAvailable =
                            numberOfCardsInCards -
                            (cardType.match('Fusion').size() > 0
                                ? numberOfCardsInExtra || 0
                                : numberOfCardsInDeck || 0)
                        const textColour = theme.rarities[(card.rarity || 'common') as 'common']

                        for (let j = 0; j < i; j++) {
                            const card2 = cards[j]
                            if (card2.name === card.name) {
                                return <Roact.Fragment />
                            }
                        }

                        if (search !== '' && card.name.lower().match(search.lower()).size() === 0) {
                            return <Roact.Fragment />
                        }

                        return (
                            <textbutton
                                Event={{
                                    MouseButton1Click: () => {
                                        if (numberOfCardsAvailable > 0) {
                                            if(cardType.match('Fusion').size() > 0) {
                                                addCardToExtraDeck(card)
                                            } else {
                                                addCardToMainDeck(card)
                                            }
                                        }
                                    }
                                }}
                                Text=""
                                BackgroundTransparency={1}
                                Size={new UDim2(1, 0, 0, 83)}
                            >
                                <Flex gap={new UDim(0, 5)} />
                                <uisizeconstraint MaxSize={new Vector2(math.huge, 83)} />
                                <imagelabel
                                    ImageTransparency={numberOfCardsAvailable > 0 ? 0 : 0.5}
                                    Size={new UDim2(0, 52.15, 0, 83)}
                                    Image={cardData?.art}
                                />
                                <frame
                                    BackgroundTransparency={1}
                                    Size={new UDim2(1, -52.15, 0, 83)}
                                >
                                    <Flex flexDirection="column" />
                                    <textlabel
                                        TextColor3={textColour}
                                        BackgroundTransparency={1}
                                        TextXAlignment={Enum.TextXAlignment.Left}
                                        Size={new UDim2(1, 0, 0, 20)}
                                        Text={cardData?.name}
                                    />
                                    {cardType.match('Monster').size() > 0 && (
                                        <Roact.Fragment>
                                            <textlabel
                                                TextColor3={textColour}
                                                BackgroundTransparency={1}
                                                TextXAlignment={Enum.TextXAlignment.Left}
                                                Size={new UDim2(1, 0, 0, 20)}
                                                Text={`Lv: ${cardData?.level}`}
                                            />
                                            <textlabel
                                                TextColor3={textColour}
                                                BackgroundTransparency={1}
                                                TextXAlignment={Enum.TextXAlignment.Left}
                                                Size={new UDim2(1, 0, 0, 20)}
                                                Text={`${cardData?.atk}/${cardData?.def}`}
                                            />
                                        </Roact.Fragment>
                                    )}
                                    <textlabel
                                        TextColor3={theme.colours.white}
                                        BackgroundTransparency={1}
                                        TextXAlignment={Enum.TextXAlignment.Left}
                                        Size={new UDim2(1, 0, 0, 20)}
                                        Text={`x${numberOfCardsAvailable}`}
                                    />
                                </frame>
                            </textbutton>
                        )
                    })}
                </scrollingframe>
            </frame>
        </Window>
    )
})

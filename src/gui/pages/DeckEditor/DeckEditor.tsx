import Roact, { useContext, useEffect, useRef, useState } from '@rbxts/roact'
import Flex from 'shared/components/Flex'
import {
    deckEditor,
    deck,
    mainDeckContainer,
    mainDeck,
    extraDeckContainer,
    extraDeck,
    cards,
    cardsSearch,
    cardScrollContainer,
    cardsScroll,
    cardsInfo,
    card,
    cardArt,
    cardInfo,
    cardName,
    cardText,
    cardsInfoScroll,
    cardsInfoText
} from './DeckEditor.styles'
import Padding from 'shared/components/Padding'
import Remotes from 'shared/net/remotes'
import usePlayerData from 'gui/hooks/usePlayerData'
import usePage from '../../hooks/usePage'
import getCardData, { includes } from 'shared/utils'
import theme from 'shared/theme'
import { CardTemplate } from 'server/types'
import alert from 'shared/popups/alert'
import { Players } from '@rbxts/services'
import useBreakpoint from 'gui/hooks/useBreakpoint'
import useButtons from 'gui/hooks/useButtons'
import { white } from 'shared/colours'
import Object from '@rbxts/object-utils'
import { debounce } from '@rbxts/set-timeout'

const player = Players.LocalPlayer
const saveDeck = Remotes.Client.Get('saveDeck')
const equipDeck = Remotes.Client.Get('equipDeck')

export default function DeckEditor() {
    const { md } = useBreakpoint()
    const inputRef = useRef<TextBox>()
    const [input, setInput] = useState<string>('')
    const [page] = usePage()
    const playerData = usePlayerData()
    const [mainDeckState, setMainDeck] = useState(
        playerData?.decks[page.deckName || '']?.deck || []
    )
    const [extraDeckState, setExtraDeck] = useState(
        playerData?.decks[page.deckName || '']?.extra || []
    )
    const [cardsState, setCards] = useState(playerData?.cards)
    const [buttons, setButtons] = useButtons()
    const [hoveredCard, setHoveredCard] = useState<Record<string, string | number>>()
    const cardsScrollRef = useRef<ScrollingFrame>()
    const [isSaved, setIsSaved] = useState(false)
    const uniqueCards = (() => {
        const cards: Record<string, CardTemplate> = {}
        for (const card of cardsState) {
            cards[card.name] = card
        }
        return Object.values(cards)
    })()
    const [cardsToLoad, setCardsToLoad] = useState(20)
    const [isEquipped, setIsEquipped] = useState(playerData.equipped.deck === page.deckName)

    useEffect(() => {
        setIsSaved(false)
    }, [cardsState])

    const addCardToMainDeck = (ca: CardTemplate) => {
        if (mainDeckState.size() >= 60) return
        if (mainDeckState.filter((c) => c.name === ca.name).size() === 3) return
        setMainDeck([...mainDeckState, ca])
    }

    const addCardToExtraDeck = (ca: CardTemplate) => {
        if (extraDeckState.size() >= 15) return
        if (extraDeckState.filter((c) => c.name === ca.name).size() === 3) return
        setExtraDeck([...extraDeckState, ca])
    }

    const removeCardFromMainDeck = (ca: CardTemplate) => {
        for (let i = 0; i < mainDeckState.size(); i++) {
            if (mainDeckState[i].name === ca.name) {
                mainDeckState.remove(i)
                break
            }
        }
        setMainDeck([...mainDeckState])
    }

    const removeCardFromExtraDeck = (ca: CardTemplate) => {
        for (let i = 0; i < extraDeckState.size(); i++) {
            if (extraDeckState[i].name === ca.name) {
                extraDeckState.remove(i)
                break
            }
        }
        setExtraDeck([...extraDeckState])
    }

    useEffect(() => {
        setIsSaved(false)
    }, [mainDeck, extraDeck])

    const onSave = () => {
        if (isSaved) return
        const saved = saveDeck.CallServer(page.deckName as string, mainDeckState, extraDeckState)
        setIsSaved(saved)
        if (!saved) {
            alert('Deck could not be saved', player)
        } else {
            alert('Deck saved', player)
        }
    }

    const onEquip = async () => {
        setIsEquipped(true)
        if (isEquipped) return
        equipDeck.SendToServer(page.deckName || '')
        await Promise.delay(0.5)
    }

    useEffect(() => {
        setButtons([
            {
                text: isEquipped ? 'Equipped' : 'Equip',
                onClick: () => onEquip()
            },
            {
                text: 'Save',
                onClick: () => onSave()
            }
        ])

        if (!inputRef.current || !cardsScrollRef.current) return

        const connection = inputRef.current.GetPropertyChangedSignal('Text').Connect(() => {
            setInput(inputRef.current!.Text)
            cardsScrollRef.current!.CanvasPosition = new Vector2(0, 0)
        })

        return () => connection.Disconnect()
    }, [inputRef, cardsScrollRef, mainDeckState, extraDeckState, page, isEquipped])

    useEffect(() => {
        setCardsToLoad(20)
    }, [input])

    return (
        <frame {...deckEditor} key="deck-editor">
            <Flex flexDirection="row" gap={new UDim(0, 10)} />
            <frame {...deck} {...(!md ? { Size: new UDim2(1, 0, 1, 0) } : {})} key="deck">
                <Flex flexDirection="column" gap={new UDim(0, 10)} />
                <frame {...mainDeckContainer} key="deck-main">
                    <uicorner CornerRadius={new UDim(0, 6)} />
                    <scrollingframe {...mainDeck} key="deck-main-scroll">
                        <uigridlayout CellSize={new UDim2(0, 421 / 6.4, 0, 614 / 6.4)} />
                        {mainDeckState.map((c, i) => {
                            const cardData = getCardData(c.name)!
                            return (
                                <imagebutton
                                    key={`${c.name}-${i}`}
                                    Image={cardData.art}
                                    Event={{
                                        MouseEnter: () => {
                                            setHoveredCard(cardData)
                                        },
                                        MouseButton1Click: () => {
                                            removeCardFromMainDeck(c)
                                        }
                                    }}
                                />
                            )
                        })}
                    </scrollingframe>
                </frame>
                <frame {...extraDeckContainer}>
                    <uicorner CornerRadius={new UDim(0, 6)} />
                    <scrollingframe {...extraDeck}>
                        <uigridlayout CellSize={new UDim2(0, 421 / 6.4, 0, 614 / 6.4)} />
                        {extraDeckState.map((c, i) => {
                            const cardData = getCardData(c.name)!
                            return (
                                <imagebutton
                                    key={`${c.name}-${i}`}
                                    Image={cardData.art}
                                    Event={{
                                        MouseEnter: () => {
                                            setHoveredCard(cardData)
                                        },
                                        MouseButton1Click: () => {
                                            removeCardFromExtraDeck(c)
                                        }
                                    }}
                                />
                            )
                        })}
                    </scrollingframe>
                </frame>
            </frame>
            <frame {...cards}>
                <Flex flexDirection="column" gap={new UDim(0, 10)} />
                <textbox {...cardsSearch} ref={inputRef} LayoutOrder={1}>
                    <uicorner CornerRadius={new UDim(0, 6)} />
                </textbox>
                <frame {...cardScrollContainer} LayoutOrder={2}>
                    <uicorner CornerRadius={new UDim(0, 6)} />
                    <scrollingframe
                        {...cardsScroll}
                        ref={cardsScrollRef}
                    >
                        <uicorner CornerRadius={new UDim(0, 323)} />
                        <Flex flexDirection="column" />
                        {uniqueCards
                            .filter(c => {
                                if (input === '') return true
                                return c.name.lower().match(input.lower()).size() > 0
                            })
                            .sort((a, b) => {
                                return a.name < b.name
                            })
                            .map((c, i) => {
                                if(i > cardsToLoad) return <Roact.Fragment />

                                const cardData = getCardData(c.name)!
                                const cardType = cardData.type
                                const numberOfCardsInDeck = mainDeckState
                                    .filter((ca) => ca.name === c.name)
                                    .size()
                                const numberOfCardsInExtra = extraDeckState
                                    .filter((ca) => ca.name === c.name)
                                    .size()
                                const numberOfCardsInCards = cardsState
                                    .filter((ca) => ca.name === c.name)
                                    .size()
                                const numberOfCardsAvailable =
                                    numberOfCardsInCards -
                                    (cardType.match('Fusion').size() > 0
                                        ? numberOfCardsInExtra || 0
                                        : numberOfCardsInDeck || 0)
                                
                                const textColour =
                                    theme.rarities[(c.rarity || 'common') as 'common']

                                return (
                                    <textbutton
                                        {...card}
                                        key={`${c.name}-${i}`}
                                        LayoutOrder={i}
                                        Event={{
                                            MouseEnter: () => {
                                                setHoveredCard(cardData)
                                            },
                                            MouseButton1Click: () => {
                                                if (cardType.match('Fusion').size() > 0) {
                                                    addCardToExtraDeck(c)
                                                } else {
                                                    addCardToMainDeck(c)
                                                }
                                            }
                                        }}
                                    >
                                        <Flex alignItems="center" />
                                        <imagelabel
                                            {...cardArt}
                                            Image={cardData.art}
                                            {...(numberOfCardsAvailable === 0
                                                ? { ImageTransparency: 0.5 }
                                                : {})}
                                        />
                                        <frame {...cardInfo}>
                                            <Flex flexDirection="column" gap={new UDim(0, 5)} />
                                            <Padding
                                                PaddingBlock={new UDim(0, 15)}
                                                PaddingLeft={new UDim(0, 10)}
                                            />
                                            <textlabel
                                                {...cardName}
                                                Text={cardData.name}
                                                TextColor3={textColour}
                                            />
                                            <textlabel
                                                {...cardText}
                                                Text={`[${cardData.type}] ${cardData.race}${
                                                    includes(cardData.type, 'Monster')
                                                        ? `\nLV: ${cardData.level}\n${cardData.atk}/${cardData.def}`
                                                        : ''
                                                }\n x${numberOfCardsAvailable}`}
                                            />
                                        </frame>
                                    </textbutton>
                                )
                            })}
                            {input === "" && <textbutton LayoutOrder={cardsState.size()+1}
                                Text="Load More"
                                Event={{
                                    MouseButton1Click: () => {
                                        setCardsToLoad(cardsToLoad + 20)
                                    }
                                }}
                                Size={new UDim2(1, 0, 0, 30)}
                                BackgroundTransparency={1}
                                TextColor3={white}
                            />}
                    </scrollingframe>
                </frame>
                <frame {...cardsInfo} LayoutOrder={3}>
                    <uicorner CornerRadius={new UDim(0, 6)} />
                    <scrollingframe {...cardsInfoScroll}>
                        <Padding Padding={new UDim(0, 10)} />
                        <Flex gap={new UDim(0, 15)} />
                        {hoveredCard && (
                            <textlabel
                                {...cardsInfoText}
                                Text={`${hoveredCard.name}\n[${hoveredCard.type}] ${
                                    hoveredCard.race
                                }${
                                    includes(hoveredCard.type as string, 'Monster')
                                        ? `\nLV: ${hoveredCard.level}\n${hoveredCard.atk}/${hoveredCard.def}`
                                        : ''
                                }\n${hoveredCard.desc}`}
                            />
                        )}
                    </scrollingframe>
                </frame>
            </frame>
        </frame>
    )
}

import Roact from '@rbxts/roact'
import { useEffect, useState, withHooks } from '@rbxts/roact-hooked'
import { motion } from 'shared/motion'
import { createGlobalState, useGlobalState } from 'shared/useGlobalState'
import pageState from 'gui/store/pageState'
import colours from 'gui/colours'
import DeckList from './DeckList'
import { deckStore, equippedDeckStore } from './Store'
import DeckEditor from './DeckEditor'
import { Players } from '@rbxts/services'

const deckList = [
    'Deck1',
    'Deck2',
    'Deck3',
    'Deck4',
    'Deck5',
    'Deck6',
    'Deck7',
    'Deck8',
    'Deck9',
    'Deck10',
    'Deck11',
    'Deck1',
    'Deck2',
    'Deck3',
    'Deck4',
    'Deck5',
    'Deck6',
    'Deck7',
    'Deck8',
    'Deck9',
    'Deck10',
    'Deck11'
]


const variants = {
    open: {
        Size: new UDim2(0.8, 0, 0.8, 0),
        BackgroundTransparency: 0
    },
    closed: {
        Size: new UDim2(0, 0, 0, 0),
        BackgroundTransparency: 1
    }
}

const player = script.FindFirstAncestorWhichIsA('Player')
const getEquippedDeck = player?.WaitForChild('getEquippedDeck') as BindableFunction
const setEquippedDeck = player?.WaitForChild('setEquippedDeck') as BindableEvent
const DEV = Players.GetChildren().size() === 0

export default withHooks(() => {
    const [page, setPage] = useGlobalState(pageState)
    const [deck, setDeck] = useGlobalState(deckStore)
    const [isEquipped, setIsEquipped] = useGlobalState(equippedDeckStore)

    useEffect(() => {
        const connection = setEquippedDeck.Event.Connect((deckName: string) => {
            setIsEquipped(deckName === deck)
        })

        setIsEquipped(deck === getEquippedDeck.Invoke())

        return () => {
            connection.Disconnect()
        }
    }, [deck])

    return (
        <motion.frame
            Position={new UDim2(0.5, 0, 0.5, 0)}
            AnchorPoint={new Vector2(0.5, 0.5)}
            Size={new UDim2(0, 0, 0, 0)}
            variants={variants}
            animate={page === 'DECK' ? 'open' : 'closed'}
            ClipsDescendants
            BorderSizePixel={2}
            BorderColor3={colours.outline}
            BackgroundColor3={colours.background}
            transition={{
                duration: 0.25,
                easingStyle: Enum.EasingStyle.Quad
            }}
        >
            <uiaspectratioconstraint AspectRatio={800 / 580} />
            <uisizeconstraint MaxSize={new Vector2(700, 500)} />
            <uilistlayout />
            <frame
                Size={new UDim2(1, 0, 0.1, 0)}
                BorderSizePixel={0}
                BackgroundColor3={colours.outline}
            >
                <uisizeconstraint MaxSize={new Vector2(700, 50)} />
                <textbutton
                    Text="×"
                    Size={new UDim2(0, 50, 1, 0)}
                    Position={new UDim2(1, 0, 0, 0)}
                    AnchorPoint={new Vector2(1, 0)}
                    BackgroundTransparency={1}
                    TextColor3={Color3.fromRGB(126, 0, 0)}
                    TextScaled
                    ZIndex={2}
                    Event={{
                        MouseButton1Click: () => {
                            setPage(undefined)
                        }
                    }}
                >
                    <uiaspectratioconstraint AspectRatio={1} />
                </textbutton>
                <textbutton
                    Text="DECK EDITOR"
                    Size={new UDim2(1, 0, .6, 0)}
                    Position={new UDim2(.5, 0, .5, 0)}
                    AnchorPoint={new Vector2(.5, .5)}
                    BackgroundTransparency={1}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled
                    Font={Enum.Font.SourceSansBold}
                />
                {deck !== undefined && (
                    <frame
                    Size={new UDim2(0, 200, 1, 0)}
                    Position={new UDim2(0, 0, 0, 0)}
                    BackgroundTransparency={1}
                    >
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Horizontal}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                            Padding={new UDim(0, -5)}
                        />
                        <textbutton
                            Text="←"
                            Font={Enum.Font.SourceSans}
                            Size={new UDim2(1, 0, 1, 0)}
                            Position={new UDim2(0, 0, 0, 0)}
                            BackgroundTransparency={1}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextScaled
                            LineHeight={1.2}
                            Event={{
                                MouseButton1Click: () => {
                                    setDeck(undefined)
                                }
                            }}
                        >
                            <uiaspectratioconstraint AspectRatio={1} />
                        </textbutton>
                        <textbutton
                            Text={isEquipped ? "✓" : ""}
                            Font={Enum.Font.Arcade}
                            Size={new UDim2(1, 0, .5, 0)}
                            Position={new UDim2(0, 0, 0, 0)}
                            BackgroundColor3={colours.outline}
                            BorderSizePixel={1}
                            BorderColor3={Color3.fromRGB(255, 255, 255)}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextScaled
                            LineHeight={1.1}
                            Event={{
                                MouseButton1Click: () => {
                                    setEquippedDeck.Fire(deck)
                                }
                            }}
                        >
                            <uiaspectratioconstraint AspectRatio={1} />
                        </textbutton>
                    </frame>
                )}
            </frame>
            {deck === undefined && <DeckList/>}
            {deck !== undefined && <DeckEditor/>}
        </motion.frame>
    )
})

import Roact from "@rbxts/roact"
import { Div, Button, Text } from "../../../rowindcss/index"
import colours from "../../colours"
import { useEffect, useRef, useState, withHooks } from "@rbxts/roact-hooked"
import type { Card } from "server/profile/profileTemplate"
import DeckBuilderContext from "./DeckBuilderContext"
import Cards from "./Cards"
import Deck from "./Deck"
import Window from "gui/main/components/Window"

const player = script.FindFirstAncestorWhichIsA("Player")!
const getDeck = player.WaitForChild("getDeck") as BindableFunction
const getCards = player.WaitForChild("getCards") as BindableFunction

export default withHooks(() => {
    const [cards, setCards] = useState<Card[]>([])
    const [deck, setDeck] = useState<Card[]>([])

    const refreshCards = () => {
        setCards(getCards.Invoke())
        setDeck(getDeck.Invoke())
    }

    useEffect(() => {
        refreshCards()
    }, [])

    return (
        <DeckBuilderContext.Provider value={{
            useDeck: [deck, setDeck],
            useCards: [cards, setCards],
            refreshCards: refreshCards
        }}>
            <Window page="Deck Builder">
                <Div className="w-full h-[88%] flex gap-[2%] z-50">
                    <Deck/>
                    <Cards/>
                </Div>
            </Window>
        </DeckBuilderContext.Provider>
    )
})
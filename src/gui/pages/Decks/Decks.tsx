import Roact, { useEffect, useRef, useState } from '@rbxts/roact'
import Flex from 'shared/components/Flex'
import Padding from 'shared/components/Padding'
import { includes } from 'shared/utils'
import { decks, topContainer, deckSearch, createButton, deckScroll, deck, deckName, deckButtons, deckButton } from './Deck.styles'
import Remotes from 'shared/net/remotes'
import usePlayerData from 'gui/hooks/usePlayerData'
import { Dictionary as Object } from '@rbxts/sift'
import alert from 'shared/popups/alert'
import prompt from 'shared/popups/prompt'
import useButtons from 'gui/hooks/useButtons'
import usePage from 'gui/hooks/usePage'

const player = script.FindFirstAncestorWhichIsA("Player")!;
const createDeck = Remotes.Client.Get("createDeck");

export default function Decks() {
    const [page, setPage] = usePage()
    const searchRef = useRef<TextBox>()
    const [search, setSearch] = useState('')
    const scrollRef = useRef<ScrollingFrame>()
    const playerData = usePlayerData();
    const deckList = playerData ? Object.entries(playerData.decks) : [];
    const [buttons, setButtons] = useButtons()

    useEffect(() => {
        setButtons([])
    }, [])

    useEffect(() => {
        if (!searchRef.current || !scrollRef.current) return
        const connection = searchRef.current.GetPropertyChangedSignal('Text').Connect(() => {
            setSearch(searchRef.current?.Text ?? '')
            scrollRef.current!.CanvasPosition = new Vector2(0, 0)
        })

        return () => {
            connection.Disconnect()
        }
    }, [searchRef, scrollRef])

    return (
        <frame {...decks}>
            <Flex flexDirection="column" gap={new UDim(0, 10)} />
            <frame {...topContainer}>
                <Flex alignItems='center' gap={new UDim(0,10)}/>
                <textbox {...deckSearch} ref={searchRef}>
                    <uicorner CornerRadius={new UDim(0, 8)} />
                </textbox>
                <textbutton {...createButton} Text="Create"
                    Event={{
                        MouseButton1Click: async () => {
                            const deckName = await prompt("Enter deck name", player);
                            if(deckName === "***CANCEL***") return;
                            if(deckList.find(([name]) => {return name === deckName;})) {
                                await alert("Deck name already exists", player);
                                return;
                            }
                            if(deckName === "") {
                                return;
                            }
                            if (deckName) {
                                createDeck.SendToServer(deckName);
                                setPage({
                                    name: "Deck Editor",
                                    deckName: deckName
                                })
                            }
                        }
                    }}
                >
                    <Padding PaddingInline={new UDim(0, 11)} />
                    <uicorner CornerRadius={new UDim(0, 6)} />
                </textbutton>
            </frame>
            <scrollingframe ref={scrollRef} {...deckScroll}>
                <Flex flexDirection="column" gap={new UDim(0, 5)} />
                {deckList.map(([name]) => {
                    if (!includes((name as string).lower(), search.lower())) return <Roact.Fragment />
                    return (
                        <frame {...deck}>
                            <Flex alignItems="center" justifyContent="start" />
                            <Padding PaddingInline={new UDim(0, 11)} />
                            <uicorner CornerRadius={new UDim(0, 8)} />
                            <textlabel {...deckName} Text={name as string} />
                            <frame {...deckButtons}>
                                <Flex
                                    alignItems="center"
                                    justifyContent="end"
                                    gap={new UDim(0, 10)}
                                />
                                <textbutton
                                    {...deckButton}
                                    Event={{
                                        MouseButton1Click: () => {
                                            setPage({
                                                name: 'Deck Editor',
                                                deckName: name as string
                                            })
                                        }
                                    }}
                                    Text="Edit"
                                >
                                    <Padding PaddingInline={new UDim(0, 11)} />
                                    <uicorner CornerRadius={new UDim(0, 6)} />
                                </textbutton>
                               
                            </frame>
                        </frame>
                    )
                })}
            </scrollingframe>
        </frame>
    )
}
import Roact from "@rbxts/roact";
import { useState, withHooks } from "@rbxts/roact-hooked";
import Flex from "gui/components/Flex";
import Window from "gui/components/Window";
import usePlayerData from "gui/hooks/usePlayerData";
import theme from "shared/theme";
import { useNavigate, useRoute } from "gui/router";
import { Dictionary as Object } from "@rbxts/sift";
import getCardData from "shared/utils";
import { addCardToDeck, removeCardFromDeck } from "server/profile-service/profiles";
import TextboxServer from "server/popups/TextboxServer";

const gap = 5;
const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(() => {
    const navigate = useNavigate();
    const playerData = usePlayerData();
    const route = useRoute();
    const decks = playerData ? Object.entries(playerData.decks) : [];
    const deckName = route.split("/").pop();
    const [search, setSearch] = useState("");

    if (!deckName) {
        return <Roact.Fragment />
    }

    const deck = decks.find(([name]) => name === deckName)![1];
    const cards = playerData ? playerData.cards : [];

    return (
        <Window title="DECK"
            buttons={[
                <textbutton
                    Event={{
                        MouseButton1Click: () => {
                            navigate("/decklist/");
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
                </textbutton>
            ]}
        >
            <Flex gap={new UDim(0, gap)} />
            <frame
                BorderSizePixel={0}
                BackgroundTransparency={1}
                Size={new UDim2(.7, -gap, 1, 0)}>
                <Flex flexDirection="column" gap={new UDim(0, gap)} />
                <scrollingframe
                    BorderSizePixel={0}
                    ScrollBarThickness={1}
                    BackgroundTransparency={.9}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    Size={new UDim2(1, 0, 1, -gap - 83)}>
                    <uigridlayout
                        CellSize={new UDim2(0, 52.15, 0, 83)}
                    />
                    {deck.deck.map((card) => {
                        const cardData = getCardData(card.name);

                        return (
                            <imagebutton 
                            Event={{
                                MouseButton1Click: () => {
                                    removeCardFromDeck(player, card, deckName)
                                }
                            }}
                            Image={cardData?.art} />
                        )
                    })}
                </scrollingframe>
                <scrollingframe
                    BorderSizePixel={0}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    ScrollBarThickness={1}
                    BackgroundTransparency={.9}
                    Size={new UDim2(1, 0, 0, 83)}>
                    <uigridlayout
                        CellSize={new UDim2(0, 52.15, 0, 83)}
                    />
                    {deck.extra.map((card) => {
                        const cardData = getCardData(card.name);

                        return (
                            <imagebutton 
                            Event={{
                                MouseButton1Click: () => {
                                    removeCardFromDeck(player, card, deckName)
                                }
                            }}
                            Image={cardData?.art} />
                        )
                    })}
                </scrollingframe>
            </frame>

            <frame
                BorderSizePixel={0}
                BackgroundTransparency={.9}
                Size={new UDim2(.3, 0, 1, 0)}
            >
                <Flex flexDirection="column" />
                <textbox 
                BackgroundTransparency={1}
                PlaceholderText={"Search"}
                Text=""
                TextColor3={theme.colours.white}
                PlaceholderColor3={theme.colours.white}
                Size={new UDim2(1,0,0,20)}>
                    <TextboxServer setTextboxState={setSearch}/>
                </textbox>
                <scrollingframe
                BorderSizePixel={0}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                ScrollBarThickness={1}
                BackgroundTransparency={1}
                Size={new UDim2(1, 0, 1, -20)}>
                <Flex flexDirection="column" gap={new UDim(0, gap)} />

                {cards.map((card, i) => {
                    const cardData = getCardData(card.name)!;
                    const cardType = cardData.type;
                    const numberOfCardsInDeck = deck.deck.filter((c) => c.name === card.name).size();
                    const numberOfCardsInExtra = deck.extra.filter((c) => c.name === card.name).size();
                    const numberOfCardsInCards = cards.filter((c) => c.name === card.name).size();
                    const numberOfCardsAvailable = numberOfCardsInCards - (cardType.match("Fusion").size() > 0 ? numberOfCardsInExtra : numberOfCardsInDeck);

                    for (let j = 0; j < i; j++) {
                        const card2 = cards[j];
                        if (card2.name === card.name) {
                            return <Roact.Fragment />
                        }
                    }

                    if (search !== "" && card.name.lower().match(search.lower()).size() === 0) {
                        return <Roact.Fragment />
                    }

                    return (
                        <textbutton
                            Event={{
                                MouseButton1Click: () => {
                                    if(numberOfCardsAvailable > 0) {
                                        addCardToDeck(player, card, deckName)
                                    }
                                }
                            }}
                            Text=""
                            BackgroundTransparency={1}
                            Size={new UDim2(1, 0, 0, 83)}>
                            <Flex gap={new UDim(0, 5)} />
                            <uisizeconstraint MaxSize={new Vector2(math.huge, 83)} />
                            <imagelabel
                                ImageTransparency={numberOfCardsAvailable > 0 ? 0 : .5}
                                Size={new UDim2(0, 52.15, 0, 83)}
                                Image={cardData?.art} />
                            <frame
                                BackgroundTransparency={1}
                                Size={new UDim2(1, -52.15, 0, 83)}>
                                <Flex flexDirection="column" />
                                <textlabel
                                    TextColor3={theme.colours.white}
                                    BackgroundTransparency={1}
                                    TextXAlignment={Enum.TextXAlignment.Left}
                                    Size={new UDim2(1, 0, 0, 20)}
                                    Text={cardData?.name} />
                                {cardType.match("Monster").size() > 0 &&
                                    <Roact.Fragment>
                                        <textlabel
                                            TextColor3={theme.colours.white}
                                            BackgroundTransparency={1}
                                            TextXAlignment={Enum.TextXAlignment.Left}
                                            Size={new UDim2(1, 0, 0, 20)}
                                            Text={`Lv: ${cardData?.level}`} />
                                        <textlabel
                                            TextColor3={theme.colours.white}
                                            BackgroundTransparency={1}
                                            TextXAlignment={Enum.TextXAlignment.Left}
                                            Size={new UDim2(1, 0, 0, 20)}
                                            Text={`${cardData?.atk}/${cardData?.def}`} />
                                    </Roact.Fragment>
                                }
                                <textlabel
                                    TextColor3={theme.colours.white}
                                    BackgroundTransparency={1}
                                    TextXAlignment={Enum.TextXAlignment.Left}
                                    Size={new UDim2(1, 0, 0, 20)}
                                    Text={`x${numberOfCardsAvailable}`} />
                            </frame>
                        </textbutton>
                    )
                })}
            </scrollingframe>
            </frame>
        </Window>
    )
})
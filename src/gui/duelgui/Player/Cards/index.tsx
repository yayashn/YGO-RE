import Roact from "@rbxts/roact";
import { useEffect, withHooks } from "@rbxts/roact-hooked";
import Card from "../Cards/Card";
import { useGlobalState } from "gui/hooks/useGlobalState";
import { cardsState } from "gui/duelgui/State/cardState";
import { YGOLocation } from "shared/types";
import { getPlayer } from "shared/utils";

const player = getPlayer(script);

export class YGOCard {
    name: string;
    location: YGOLocation;
    owner: Player;
    control: Player;
    position: "atk" | "def";
    face: "up" | "down";

    constructor(name: string, location: YGOLocation) {
      this.name = name;
      this.location = location;
      this.owner = player;
      this.control = player;
      this.position = "atk";
      this.face = "down";
    }
}

export default withHooks(() => {
    const [cards, setCards] = useGlobalState<YGOCard[]>(cardsState);

    useEffect(() => {
        const card: YGOCard = new YGOCard("Dark Magician", "Deck");
        setCards([card])
    }, [])

    useEffect(() => {
        wait(3)
        if(cards.size() > 0) {
            cards[0].location = "Hand";
        }
    }, [cards])

    return (
        <surfacegui Key="CardsPlayer">
            {cards.map((_, index) => {
                return <Card index={index} />
            })}
        </surfacegui>
    )
})
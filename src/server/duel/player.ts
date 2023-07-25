import { getEquippedDeck } from "server/profile-service/profiles";
import { Card } from "./card";
import { Subscribable } from "shared/Subscribable";
import { HttpService } from "@rbxts/services";
import { Location, SelectableZone } from "./types";

export class YPlayer {
    player: Player;
    cards = new Subscribable<Card[]>([]);
    floodgates = new Subscribable<string[]>([]);
    responses = new Subscribable<Card[]>([]);
    targets = new Subscribable<Card[]>([]);
    lifePoints = new Subscribable(8000);
    selectableZones = new Subscribable<SelectableZone[]>([]);
    selectedZone = new Subscribable<Location | undefined>(undefined);
    action = new Subscribable<{
        action: string,
    } | undefined>(undefined);
    targettableCards = new Subscribable<Card[]>([]);
    targettedCards = new Subscribable<Card[]>([]);

    constructor(player: Player) {
        const equippedDeck = getEquippedDeck(player);

        this.player = player;
        this.cards.set(equippedDeck.deck.map((card, i) => new Card(card.name, player, i)));
        this.cards.set([...this.cards.get(), ...equippedDeck.extra.map((card, i) => new Card(card.name, player, i))]);
    }

    shuffle() {
        const deck = this.cards.get().filter(
            (card) => card.location.get() === 'Deck'
        )
        for (let i = deck.size() - 1; i > 0; i--) {
            const ran = new Random().NextNumber()
            const j = math.floor(ran * (i + 1))
            ;[deck[i], deck[j]] = [deck[j], deck[i]]
        }
        for (let i = 0; i < deck.size(); i++) {
            deck[i].order.set(i)
        }
    }

    draw(n: number) {
        for (let i = 0; i < n; i++) {
            let deck = this.cards.get().filter(
                (card) => card.location.get() === 'Deck'
            )
            const topCard = deck.find((card) => card.order.get() === 0)
            if (!topCard) {
                //end duel
                return
            }
            topCard.location.set('Hand')
            deck = this.cards.get().filter(
                (card) => card.location.get() === 'Deck'
            )
            deck.forEach((_, x) => {
                deck[x].order.set(deck[x].order.get() - 1)
            })
            wait(0.3)
        }
    }

    addFloodgate(floodgate: string) {
        const floogatedUid = HttpService.GenerateGUID(false);
        this.floodgates.set([
            ...this.floodgates.get(),
            `${floodgate}-${floogatedUid}`
        ]);

        return () => {
            this.floodgates.set(this.floodgates.get().filter((floodgate) => {
                const [floodgateName, uid] = floodgate.split("-");
                return uid !== floogatedUid;
            }));
        }
    }

    getFloodgate(floodgateString: string, floodgateUid?: string) {
        return this.floodgates.get().find((floodgate) => {
            const [floodgateName, uid] = floodgate.split("-");
            return floodgateName.match(`^${floodgateString}`).size() > 0 && (floodgateUid ? uid === floodgateUid : true);
        });
    }

    removeFloodgate(floodgateString: string, floodgateUid?: string) {
        this.floodgates.set(this.floodgates.get().filter((floodgate) => {
            const [floodgateName, uid] = floodgate.split("-");
            return !(floodgateName.match(`^${floodgateString}`).size() > 0 && (floodgateUid ? uid === floodgateUid : true));
        }));
    }
}
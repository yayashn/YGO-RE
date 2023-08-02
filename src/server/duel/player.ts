import { getEquippedDeck } from "server/profile-service/profiles";
import { Card } from "./card";
import { Subscribable } from "shared/Subscribable";
import { Location, Position, SelectableZone } from "./types";
import { Floodgate } from "./floodgate";
import { getDuel } from "./duel";
import { getCards } from "./utils";
import debounce from "shared/debounce";

export class YPlayer {
    changed = new Subscribable(0);
    player: Player;
    cards = new Subscribable<Card[]>([]);
    floodgates = new Subscribable<Floodgate[]>([]);
    targets = new Subscribable<Card[]>([]);
    lifePoints = new Subscribable(8000, () => {
        if(this.lifePoints.get() <= 0) {
            const duel = getDuel(this.player);
            const opponent = duel!.getOpponent(this.player);
            duel!.endDuel(opponent, 'Lifepoints reduced to 0.');
        }
    });
    selectableZones = new Subscribable<SelectableZone[]>([]);
    selectedZone = new Subscribable<Location | undefined>(undefined);
    targettableCards = new Subscribable<Card[]>([]);
    targettedCards = new Subscribable<Card[]>([]);
    selectedPosition = new Subscribable<Position | undefined>(undefined);
    selectedPositionCard = new Subscribable<Card | undefined>(undefined);

    constructor(player: Player) {
        const equippedDeck = getEquippedDeck(player);

        this.player = player;
        this.cards.set(equippedDeck.deck.map((card, i) => new Card(card.name, player, i)));
        this.cards.set([...this.cards.get(), ...equippedDeck.extra.map((card, i) => new Card(card.name, player, i))]);
    }

    onChanged = debounce(() => {
        this.changed.set(this.changed.get() + 1);
    })

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

    changeLifePoints(n: number) {
        this.lifePoints.set(this.lifePoints.get() + n);
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

    addFloodgate(floodgateName: string, expiryCondition: () => boolean, card?: Card) {
        const floodgate = new Floodgate(floodgateName, expiryCondition, card);
        this.floodgates.set([
            ...this.floodgates.get(),
            floodgate
        ]);
    }

    getFloodgates(floodgateString: string, card?: Card) {
        const floodgates = this.floodgates.get().filter((floodgate) => {
            return floodgate.name.match(`^${floodgateString}`).size() > 0 && (card ? card === floodgate.causedByCard : true);
        });
        return floodgates.size() === 0 ? undefined : floodgates;
    }

    handleFloodgates() {
        this.floodgates.set(this.floodgates.get().filter(floodgate => !floodgate.expired()));
    }

    pickTargets(n: number, targettables: Card[]) {
        this.targets.set([])
        this.targettableCards.set(targettables)
        let pickedTargets: Card[] = [];
        const connection = this.targets.changed((targets: Card[]) => {
            if (targets.size() === n) {
                connection.Disconnect()
                pickedTargets = targets
            }
        })
        while (connection.Connected) {
            wait()
        }
        this.targettableCards.set([])
        return pickedTargets
    }

    pickZone(zones: SelectableZone[] = []) {
        this.selectableZones.set(zones)
        this.selectedZone.wait()
        const selectedZone = this.selectedZone.get()
        this.selectedZone.set(undefined)
        this.selectableZones.set([])
        return selectedZone as Location
    }

    handleTarget(target: Card) {
        const targets = this.targets.get()
        if (this.targettableCards.get().includes(target)) {
            if(!targets.includes(target)) {
                this.targets.set([...targets, target])
            } else {
                this.targets.set(targets.filter((t) => t !== target))
            }
        }
    }
}
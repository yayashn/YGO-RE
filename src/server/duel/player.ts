import { Card } from "./card";
import { Subscribable } from "shared/Subscribable";
import { ChainedEffect, Location, PendingEffect, Position, SelectableZone } from "./types";
import { Floodgate } from "./floodgate";
import { getDuel } from "./duel";
import { getFilteredCards, getPublicCard } from "./utils";
import { PlayerRemotes } from "shared/duel/remotes";
import { getEquippedDeck } from "server/profile-service/functions/getEquippedDeck";
import confirm from "server/popups/confirm";
import confirmSync from "server/popups/confirmSync";

export class YPlayer {
    changed = new Subscribable(0);
    player: Player;
    cards = new Subscribable<Card[]>([]);
    floodgates = new Subscribable<Floodgate[]>([]);
    targets = new Subscribable<Card[]>([], (cards: Card[]) => {
        PlayerRemotes.Server.Get("targettedCardsChanged").SendToPlayers([this.player], cards.map(card => {
            return getPublicCard(this.player, card)
        }))   
    });
    lifePoints = new Subscribable(8000, (newLP) => {
        const duel = getDuel(this.player);
        const opponent = duel!.getOpponent(this.player);
        PlayerRemotes.Server.Get("lpChanged").SendToPlayer(this.player, {
            playerLP: newLP,
            opponentLP: opponent.lifePoints.get(),
        })
        PlayerRemotes.Server.Get("lpChanged").SendToPlayer(opponent.player, {
            playerLP: opponent.lifePoints.get(),
            opponentLP: newLP,
        })
        if(this.lifePoints.get() <= 0) {
            const opponent = duel!.getOpponent(this.player);
            duel!.endDuel(opponent, 'Lifepoints reduced to 0.');
        }
    });
    selectableZones = new Subscribable<SelectableZone[]>([], () => {
        PlayerRemotes.Server.Get("selectableZonesChanged").SendToPlayer(this.player, this.selectableZones.get())
    });
    selectedZone = new Subscribable<Location | undefined>(undefined);
    targettableCards = new Subscribable<Card[]>([], (cards: Card[]) => {
        PlayerRemotes.Server.Get("targettableCardsChanged").SendToPlayers([this.player], cards.map(card => {
            return getPublicCard(this.player, card)
        }))
    });
    targettedCards = new Subscribable<Card[]>([], (cards: Card[]) => {
        PlayerRemotes.Server.Get("targettedCardsChanged").SendToPlayers([this.player], cards.map(card => {
            return getPublicCard(this.player, card)
        }))
    });
    selectedPosition = new Subscribable<Position | undefined>(undefined);
    selectedPositionCard = new Subscribable<Card | undefined>(undefined);
    inflictedBattleDamage = new Subscribable(0);

    constructor(player: Player) {
        const equippedDeck = getEquippedDeck(player);

        this.player = player;
        this.cards.set(equippedDeck.deck.map((card, i) => new Card(card.name, player, i)));
        this.cards.set([...this.cards.get(), ...equippedDeck.extra.map((card, i) => new Card(card.name, player, i))]);
    }

    onChanged = () => {
        this.changed.set(this.changed.get() + 1);
    }
    

    async shuffle() {
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

    async draw(n: number) {
        for (let i = 0; i < n; i++) {
            let deck = this.cards.get().filter(
                (card) => card.location.get() === 'Deck'
            )
            const topCard = deck.find((card) => card.order.get() === 0)
            if (!topCard) {
                //end duel
                const duel = getDuel(this.player);
                const opponent = duel!.getOpponent(this.player);
                duel?.endDuel(opponent, 'No cards left in deck.');
                return
            }
            topCard.location.set('Hand')
            deck = this.cards.get().filter(
                (card) => card.location.get() === 'Deck'
            )
            deck.forEach((_, x) => {
                deck[x].order.set(deck[x].order.get() - 1)
            })
            await Promise.delay(0.3)
        }
    }

    addFloodgate(floodgateName: string, expiryCondition: () => boolean, card?: Card, value?: unknown) {
        const floodgate = new Floodgate(floodgateName, expiryCondition, card, value);
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

    hasFloodgate(floodgateString: string) {
        return this.getFloodgates(floodgateString) !== undefined;
    }

    handleFloodgates() {
        this.floodgates.set(this.floodgates.get().filter(floodgate => !floodgate.expired()));
    }

    pickTargets(n: number, targettables: Card[], minimum = n) {
        const duel = getDuel(this.player)!;
        const currentBusy = duel.busy.get()
        duel.busy.set(false)
        this.targets.set([])
        this.targettableCards.set(targettables)
        let pickedTargets: Card[] = [];
        const connection = this.targets.changed((targets: Card[]) => {
            if (targets.size() >= minimum) {
                if(targets.size() < n) { 
                    const pickAnother = confirmSync(`Pick another target?`, this.player);
                    if(pickAnother === "YES") {
                        return;
                    }
                }
                connection.Disconnect()
                pickedTargets = targets
            }
        })
        while (connection.Connected) {
            wait()
        }
        this.targettedCards.set([])
        this.targettableCards.set([])
        duel.busy.set(currentBusy)
        return pickedTargets
    }    

    async pickEffects(pendingEffects: PendingEffect[], mandatory = true) {
        const duel = getDuel(this.player)!;
        const currentBusy = duel.busy.get()
        duel.busy.set(false)
        this.targets.set([])
        this.targettableCards.set(pendingEffects.map((pendingEffect) => pendingEffect.card))
        let pickedTargets: PendingEffect[] = [];

        let activate: "YES" | "NO" = "YES";

        if(!mandatory) {
            activate = await confirm(`Activate an effect?`, this.player);
        }
        
        if(activate === "YES") {
            const connection = this.targets.changed(async (targets: Card[]) => {
                pickedTargets = pendingEffects.filter((pendingEffect) => targets.includes(pendingEffect.card))
                if(pickedTargets.size() === pendingEffects.size()) {
                    connection.Disconnect()
                    return;
                }
                if(!mandatory) {
                    activate = await confirm(`Activate an effect?`, this.player);
                    if (activate === "NO") {
                        connection.Disconnect()
                        return;
                    }
                }
            })
            while (connection.Connected) {
                wait()
            }
        }
        
        this.targettedCards.set([])
        this.targettableCards.set([])
        duel.busy.set(currentBusy)
        return pickedTargets
    }

    pickZone(zones: SelectableZone[] = []) {
        const duel = getDuel(this.player)!;
        this.selectableZones.set(zones)
        this.selectedZone.wait()
        const selectedZone = this.selectedZone.get()
        this.selectedZone.set(undefined)
        this.selectableZones.set([])
        return selectedZone as Location
    }

    handleTarget(targetUid: string) {
        const duel = getDuel(this.player)!;
        const target = getFilteredCards(duel, {
            uid: [targetUid]
        })[0]
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
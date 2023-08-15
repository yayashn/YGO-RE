import { Card } from "./card";
import { Subscribable } from "shared/Subscribable";
import { Location, PendingEffect, Position, SelectableZone } from "./types";
import { Floodgate } from "./floodgate";
import { getDuel } from "./duel";
import { getFilteredCards, getPublicCard } from "./utils";
import { PlayerRemotes } from "shared/duel/remotes";
import { getEquippedDeck } from "server/profile-service/functions/getEquippedDeck";
import confirm from "server/popups/confirm";

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
        await Promise.delay(deck.size() * 0.03)
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
        const duel = getDuel(this.player)!;
        const currentBusy = duel.busy.get()
        duel.busy.set(false)
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
        duel.busy.set(currentBusy)
        return pickedTargets
    }

    async pickEffects(pendingEffects: PendingEffect[], optional: boolean = true) {
        const duel = getDuel(this.player)!;
        const currentBusy = duel.busy.get()
        duel.busy.set(false)
        this.targets.set([])
        const targettables = pendingEffects.map((pendingEffect) => pendingEffect.card)
        this.targettableCards.set(targettables)
        let pickedEffects: Record<number, PendingEffect> = {};
        let wantsToActivate: "YES" | "NO" = "YES";
        if(optional) {
            const wantsToActivatePrompt = confirm(`Activate an effect?`, this.player);
            wantsToActivate = await wantsToActivatePrompt
        }
        if(wantsToActivate === "YES") {
            const connection = this.targets.changed(async (targets: Card[]) => {
                if (optional ? targets.size() >= 1 : targets.size() === pendingEffects.size()) {
                    if(optional && targets.size() < pendingEffects.size()) {
                        const pickAnotherEffectPrompt = await confirm(`Activate another effect?`, this.player);
                        if (pickAnotherEffectPrompt === "YES") {
                            return
                        }
                    }
                    targets.forEach((target, i) => {
                        pickedEffects[i + 1] = {
                            card: target,
                            effect: pendingEffects.find((pendingEffect) => pendingEffect.card === target)!.effect
                        }
                    })
                    connection.Disconnect()
                }
            })
            while (connection.Connected) {
                wait()
            }
        }
        this.targettableCards.set([])
        duel.busy.set(currentBusy)
        return pickedEffects
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
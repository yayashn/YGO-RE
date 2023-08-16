import { Subscribable } from "shared/Subscribable";
import type { YPlayer } from "./player";
import { Action, CardFloodgate, ChainedEffect, Location, MZone, PendingEffect, Phase, SZone, SelectableZone } from "./types";
import { Dictionary as Object } from "@rbxts/sift";
import Remotes from "shared/net/remotes";
import { getCards, getFilteredCards } from "./utils";
import { getFieldZonePart, includes } from "shared/utils";
import type { Card } from "./card";
import waiting from "server/popups/waiting";
import { throttle } from "@rbxts/set-timeout";
import alert from "server/popups/alert";
import { DuelRemotes } from "shared/duel/remotes";
import confirmSync from "server/popups/confirmSync";
import { CardEffect } from "server-storage/card-effects";

export let duels: Map<string, Duel> = new Map();

export class Duel {
    changed = new Subscribable(0);
    player1: YPlayer;
    player2: YPlayer;
    phase: Subscribable<Phase> = new Subscribable<Phase>("DP", (p) => {
        DuelRemotes.Server.Get("phaseChanged").SendToPlayers([this.player1.player, this.player2.player], p);
    });
    turn = new Subscribable(0);
    gameState = new Subscribable<"OPEN" | "CLOSED">("OPEN");
    turnPlayer: Subscribable<YPlayer>;
    actor: Subscribable<YPlayer>;
    battleStep = new Subscribable('');
    damageStep = new Subscribable('');
    chain: Subscribable<Record<number, ChainedEffect>> = new Subscribable({});
    pendingEffects: Subscribable<PendingEffect[]> = new Subscribable([]);
    chainResolving = new Subscribable(false);
    speedSpell = new Subscribable(1);
    attackingCard = new Subscribable<Card | undefined>(undefined);
    defendingCard = new Subscribable<Card | undefined>(undefined);
    handlingResponses = false;
    action: Subscribable<Action[]> = new Subscribable([], () => {
        this.player1.handleFloodgates()
        this.player2.handleFloodgates()
    });
    cardFloodgates: Subscribable<Record<string, CardFloodgate[]>> = new Subscribable({});
    busy = new Subscribable(false);

    constructor(player1: YPlayer, player2: YPlayer) {
        this.player1 = player1;
        this.player2 = player2;
        
        duels.set(`${player1.player.UserId}:${player2.player.UserId}`, this);
        (this.player1.player.FindFirstChild("duel") as StringValue).Value = `${player1.player.UserId}:${player2.player.UserId}`;
        (this.player2.player.FindFirstChild("duel") as StringValue).Value = `${player1.player.UserId}:${player2.player.UserId}`;
        
        this.turnPlayer = new Subscribable<YPlayer>(this.player1, (p: YPlayer) => {
            DuelRemotes.Server.Get("turnPlayerChanged").SendToPlayers([this.player1.player, this.player2.player], p.player);
        });
        DuelRemotes.Server.Get("turnPlayerChanged").SendToPlayers([this.player1.player, this.player2.player], this.turnPlayer.get().player);
        this.actor = new Subscribable<YPlayer>(this.player1);

        Remotes.Server.Get("showField").SendToPlayers([player1.player, player2.player], true);

        this.handlePhase("DP");
        this.action.changed(() => {
            if(this.action.get() === undefined) return;
            if(this.speedSpell.get() === 1) return
            try {
                this.handleResponses(this.getOpponent(this.actor.get().player));
            }catch{}
        })
    }

    destroy() {
        Object.entries(this).forEach(([key, value]) => {
            (this[key] as unknown) = undefined;
        })
    }

    onChanged = throttle(() => {
        this.changed.set(this.changed.get() + 1);
        this.handleCardFloodgates();
    })

    getPlayerName(player: YPlayer) {
        return player === this.player1 ? "player1" : "player2";
    }

    setAction(action: Action) {
        this.action.set([...this.action.get(), action]);
    }

    getLastAction(): Action | undefined {
        return this.action.get()[this.action.get().size() - 1];
    }

    getAction(actionNames: string[]): Action | undefined {
        const actions = this.action.get();
        for (let i = actions.size() - 1; i >= 0; i--) {
            if (actionNames.includes(actions[i].action)) {
                return actions[i];
            }
        }
    }

    async endDuel(winner: YPlayer, message: string) {
        [this.player1, this.player2].forEach((player) => {
            (player.player.FindFirstChild("duel") as StringValue).Value = "";
            player.cards.set([])
        })
        duels.delete(`${this.player1.player.UserId}:${this.player2.player.UserId}`);

        Remotes.Server.Get("showField").SendToPlayers([this.player1.player, this.player2.player], false);

        const loser = this.getOpponent(winner.player);
        alert(`You lost the duel! Reason: ${message ? `${message}` : ''}`, loser.player);
        alert(`You won the duel! Reason: ${message ? `${message}` : ''}`, winner.player);
        this.destroy()
    }

    getOpponent(player: Player) {
        return player === this.player1.player ? this.player2 : this.player1;
    }

    getPlayer(player: Player) {
        return player === this.player1.player ? this.player1 : this.player2;
    }

    pickZone(player: YPlayer) {
        player.selectableZones.set(this.getEmptyFieldZones('MZone', player.player, 'Player'))
        const zone = player.selectedZone.wait()!;
        player.selectableZones.set([])
        player.selectedZone.set(undefined)
        return zone;
    }

    getResponses(player: YPlayer) {
        const activatableCards = getCards(this).filter(card => {
            return card.getController() === player && card.checkEffectConditions()
        })
        return activatableCards
    }

    addCardFloodgate(floodgateName: string, floodgate: CardFloodgate) {
        const floodgates = this.cardFloodgates.get();
        if (!floodgates[floodgateName]) {
            floodgates[floodgateName] = [];
        }
        floodgates[floodgateName].push(floodgate);
        this.cardFloodgates.refresh();
    }

    handleCardFloodgates = throttle(() => {
        const floodgates = this.cardFloodgates.get();
    
        for (const [floodgateName, floodgateArray] of pairs(floodgates)) {
            let newFloodgates = [];
            for (const floodgate of floodgateArray) {
                if (!floodgate.expiry()) {
                    newFloodgates.push(floodgate);
                }
            }
            if (newFloodgates.size() > 0) {
                floodgates[floodgateName] = newFloodgates;
            } else {
                delete floodgates[floodgateName];
            }
        }
    
        this.cardFloodgates.refresh();

        getCards(this).forEach(card => {
            card.handleFloodgates();
        });
    });

    handleResponses(player: YPlayer) {
        print(10)
        if(this.handlingResponses) return
        this.busy.set(true)
        this.handlingResponses = true
        
        this.speedSpell.set(this.speedSpell.get() === 1 ? 2 : this.speedSpell.get())
        this.gameState.set('CLOSED')
        let passes = 0;
        this.actor.set(player)
        this.handleCardFloodgates()
        
        while(passes < 2) {
            const numberOfResponses = this.getResponses(this.actor.get()).size()
            const chain = this.chain.get()

            if(numberOfResponses > 0) {
                const lastCardInChain = chain[Object.keys(chain).size() - 1]
                const chainStartMessage = `You have ${numberOfResponses} card/effect${
                    numberOfResponses > 1 ? 's' : ''
                } that can be activated. Activate?`
                const chainResponseMessage = `"${
                    lastCardInChain ? lastCardInChain.card.name : '?'
                }" is activated. Chain another card or effect?`

                const stopWaiting = waiting("Waiting for response...", this.getOpponent(this.actor.get().player).player)
                const response = confirmSync(
                    numberOfResponses >= 1
                        ? chainStartMessage
                        : chainResponseMessage || chainStartMessage,
                    this.actor.get().player,
                )

                if(response === "YES") {
                    passes = 0;
                    this.busy.set(false)
                    this.action.wait()
                    this.busy.set(true)
                } else if(response === "NO") {
                    passes++
                }
                stopWaiting()
            } else {
                passes++
            }

            if(passes < 2) {
                this.actor.set(this.getOpponent(this.actor.get().player))
            } else if(passes === 2) {
                this.actor.set(this.turnPlayer.get())
            }

        }
        this.handlingResponses = false
        this.resolveChain()
        this.busy.set(false)
    }

    resolveChain() {
        if (this.chainResolving.get() === true) return
        this.chainResolving.set(true)

        const chain = this.chain.get()
        let chainSize = Object.keys(chain).size()

        while(chainSize > 0) {
            const chainedEffect = chain[chainSize]
            if(!chainedEffect.negated) {
                chainedEffect.effect()
            }
            wait(1)
            chainedEffect.card.chainLink.set(0)
            if (!includes(chainedEffect.card.race.get(), 'Equip')) {
                chainedEffect.card.targets.set([])
            }
            chainSize--
        }

        // Remove non-continuous spell/trap cards from SZone, and reset activated
        for (const [_, { card }] of pairs(chain)) {
            if (includes(card.location.get(), "SZone") && 
                !card.hasFloodgate("CONTINUOUS") && 
                !includes(card.race.get(), "Continuous") && 
                !includes(card.race.get(), "Equip")) {
                card.toGraveyard();
            }
            card.activated.set(false);
        }
        
        this.chain.set({})
        this.gameState.set('OPEN')
        this.actor.set(this.turnPlayer.get())
        this.speedSpell.set(1)
        this.player1.targets.set([])
        this.player2.targets.set([])

        if (this.battleStep.get() === 'BATTLE' && this.attackingCard.get()) {
            if (this.attackingCard.get()?.attackNegated.get() === false) {
                this.attackingCard.get()?.attack(this.defendingCard.get())
            }
        }
        this.attackingCard.set(undefined)
        this.defendingCard.set(undefined)
        this.action.set([])
        this.handleCardFloodgates()
        this.chainResolving.set(false)
        this.handlePendingEffects()
    }

    handlingPendingEffects = false
    async handlePendingEffects() {
        if(this.handlingPendingEffects) return
        this.handlingPendingEffects = true
        const opponent = this.getOpponent(this.turnPlayer.get().player);
        [this.turnPlayer.get(), opponent].forEach((player) => {
            const mandatoryEffect = () => this.pendingEffects.get().filter((pendingEffect) => {
                return pendingEffect.card.controller.get() === player.player && !pendingEffect.effect.optional
            })
            const pickedMandatoryEffectsSize = mandatoryEffect().size();
            if(pickedMandatoryEffectsSize >= 2) {
                player.pickEffects(mandatoryEffect()).then(pickedMandatoryEffects => {
                    for(const i of $range(1, pickedMandatoryEffectsSize)) {
                        const pickedMandatoryEffect = pickedMandatoryEffects[i];
                        const cost = pickedMandatoryEffect.effect.cost;
                        if (cost) {
                            cost();
                        }
                        const target = pickedMandatoryEffect.effect.target;
                        if (target) {
                            target();
                        }
                        this.addToChain(pickedMandatoryEffect.card, () => pickedMandatoryEffect.effect.effect!(pickedMandatoryEffect.card), undefined, false);
                    }
                })
            } else if(pickedMandatoryEffectsSize === 1) {
                const pickedMandatoryEffects = mandatoryEffect();
                pickedMandatoryEffects[0];
                const cost = pickedMandatoryEffects[0].effect.cost;
                if (cost) {
                    cost();
                }
                const target = pickedMandatoryEffects[0].effect.target;
                if (target) {
                    target();
                }
                this.addToChain(pickedMandatoryEffects[0].card, () => pickedMandatoryEffects[0].effect.effect!(pickedMandatoryEffects[0].card), undefined, false);
            }
        })
        this.pendingEffects.set([])
        this.handleResponses(this.turnPlayer.get())
        this.handlingPendingEffects = false
    }

    addPendingEffect(effect: PendingEffect) {
        this.pendingEffects.set([...this.pendingEffects.get(), effect])
    }

    async addToChain(card: Card, effect: Callback, action: Action = {
        action: "ACTIVATE",
        cards: [],
        player: this.actor.get()
    }, handleResponses: boolean = true) {
        this.gameState.set('CLOSED')
        card.activated.set(true)
        const chainLink = Object.keys(this.chain.get()).size() + 1
        card.chainLink.set(chainLink)
        const newChain = {...this.chain.get()};
        newChain[chainLink] = {
            card,
            effect,
            negated: false
        }
        this.chain.set(newChain)
        this.setAction(action)
        this.getOpponent(card.controller.get()).targets.set([])
        if(handleResponses) {
            this.handleResponses(this.getOpponent(card.controller.get()))
        }
    }

    async handlePhase(p: Phase) {
        this.gameState.set('OPEN')
        if (p === 'DP') {
            this.turn.set(this.turn.get() + 1)
            this.player1.handleFloodgates()
            this.player2.handleFloodgates()
            await Promise.delay(0.15)
            if(this.turn.get() === 1) {
                this.turnPlayer.get().addFloodgate("CANNOT_ENTER_BP", () => {
                    return this.turn.get() !== 1
                })
            } else if (this.turn.get() >= 2) {
                this.turnPlayer.set(this.getOpponent(this.turnPlayer.get().player))
                this.actor.set(this.turnPlayer.get())
            }
            this.phase.set(p)
            await Promise.delay(0.15)
            if (this.turn.get() === 1) {
                const thread = [this.player1, this.player2].map((player) =>
                    coroutine.wrap(async () => {
                        await player.shuffle()
                        await Promise.delay(player.cards.get().size() * 0.04)
                        await player.draw(5)
                    })
                )
                thread[0]()
                thread[1]()
            } 
            await Promise.delay(1)
            this.turnPlayer.get().draw(1)
            this.handleResponses(this.turnPlayer.get())
            await Promise.delay(0.15)
            await this.handlePhase('SP') 
        } else if (p === 'SP') {
            this.phase.set(p)
            await Promise.delay(0.15)
            this.handleResponses(this.turnPlayer.get())
            await this.handlePhase('MP1')
        } else if (p === 'MP1') {
            this.phase.set(p)
            await Promise.delay(0.15)
        } else if (p === 'BP') {
            this.phase.set(p)
            await Promise.delay(0.15)
            this.battleStep.set('START')
            this.handleResponses(this.turnPlayer.get())
            this.battleStep.set('BATTLE')
        } else if (p === 'MP2') {
            this.phase.set(p)
            await Promise.delay(0.15)
        } else if (p === 'EP') {
            if (this.phase.get() === 'MP1' || this.phase.get() === 'MP2') {
                this.phase.set(p)
                await Promise.delay(0.15)
                this.handleResponses(this.turnPlayer.get())

                const cardsInHand = getFilteredCards(this, {
                    location: ['Hand'],
                    controller: [this.turnPlayer.get().player],
                })
                const numberOfCardsInHand = cardsInHand.size()
                const numberOfCardsToDiscard = numberOfCardsInHand - 6
                if(numberOfCardsToDiscard > 0) {
                    const cardsToDiscard =  this.turnPlayer.get().pickTargets(numberOfCardsToDiscard, cardsInHand)
                    cardsToDiscard.forEach((card) => {
                        card.destroy("Discard")
                    })
                }

                await this.handlePhase('DP')
            } else if (this.phase.get() === 'BP') {
                this.handleResponses(this.turnPlayer.get())
                await this.handlePhase('MP2')
            }
        }
        this.onChanged()
    }

    getEmptyFieldZonesVector(
        zoneType: 'MZone' | 'SZone' | 'Both',
        YGOPlayer: Player,
        zoneSide: "Player" | "Opponent" | 'Both',
    ): Vector3Value[] {
        const SZones: SZone[] = ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5']
        const MZones: MZone[] = ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5']
        const allZones: Location[] = [...SZones, ...MZones]
    
        const takenFieldZones = getFilteredCards(this, {
            location: (zoneType === 'Both'
                ? allZones
                : zoneType === 'MZone'
                ? MZones
                : SZones) as Location[],
            controller: [YGOPlayer]
        }).map((card) => card.location.get())
    
        const emptyFieldZones = (zoneType === 'Both' ? allZones : zoneType === 'SZone' ? SZones : MZones)
            .filter((zone) => !takenFieldZones.includes(zone))
            .map((zone) => getFieldZonePart(zoneSide === 'Both' ? "Player" : zoneSide, zone as MZone | SZone))
    
        return emptyFieldZones;
    }
    
    getEmptyFieldZones(
        zoneType: 'MZone' | 'SZone' | 'Both',
        YGOPlayer: Player,
        zoneSide: "Player" | "Opponent" | 'Both',
    ): SelectableZone[] {
        const SZones: SZone[] = ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5']
        const MZones: MZone[] = ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5']
        const allZones: Location[] = [...SZones, ...MZones]
    
        const takenFieldZones = getFilteredCards(this, {
            location: (zoneType === 'Both'
                ? allZones
                : zoneType === 'MZone'
                ? MZones
                : SZones) as Location[],
            controller: [YGOPlayer]
        }).map((card) => card.location.get())
    
        const emptyFieldZones = (zoneType === 'Both' ? allZones : zoneType === 'SZone' ? SZones : MZones)
            .filter((zone) => !takenFieldZones.includes(zone))
            .map((zone) => ({
                zone: zone,
                opponent: zoneSide === 'Both' || zoneSide === "Opponent",
                player: zoneSide === 'Both' || zoneSide === "Player"
            }))
    
        return emptyFieldZones;
    }
    
}

export function getDuel(player: Player) {
    const duel = duels.get((player.FindFirstChild("duel") as StringValue).Value);
    if (duel) {
        return duel;
    }
}
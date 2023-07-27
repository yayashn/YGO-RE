import { Subscribable } from "shared/Subscribable";
import type { YPlayer } from "./player";
import { ChainedEffect, Location, MZone, Phase, SZone, SelectableZone } from "./types";
import { Dictionary as Object } from "@rbxts/sift";
import Remotes from "shared/net";
import { getFilteredCards } from "./utils";
import confirm from "server/popups/confirm";
import { getFieldZonePart, includes } from "shared/utils";
import type { Card } from "./card";

export let duels: Record<string, Duel> = {}

export class Duel {
    changed = new Subscribable(0);
    player1: YPlayer;
    player2: YPlayer;
    phase: Subscribable<Phase> = new Subscribable<Phase>("DP", () => this.onChanged());
    turn = new Subscribable(0, () => this.onChanged());
    gameState = new Subscribable<"OPEN" | "CLOSED">("OPEN", () => this.onChanged());
    turnPlayer: Subscribable<YPlayer>;
    actor: Subscribable<YPlayer>;
    battleStep = new Subscribable('', () => this.onChanged());
    damageStep = new Subscribable('', () => this.onChanged());
    chain: Subscribable<Record<number, ChainedEffect>> = new Subscribable({}, () => this.onChanged());
    chainResolving = new Subscribable(false, () => this.onChanged());
    speedSpell = new Subscribable(0, () => this.onChanged());
    attackingCard = new Subscribable<Card | undefined>(undefined, () => this.onChanged());
    defendingCard = new Subscribable<Card | undefined>(undefined, () => this.onChanged());
    handlingResponses = new Subscribable(false, () => this.onChanged());

    constructor(player1: YPlayer, player2: YPlayer) {
        this.player1 = player1;
        this.player2 = player2;
        duels[`${player1.player.UserId}:${player2.player.UserId}`] = this;
        this.turnPlayer = new Subscribable<YPlayer>(this.player1, () => this.onChanged());
        this.actor = new Subscribable<YPlayer>(this.player1, () => this.onChanged());

        Remotes.Server.Get("showField").SendToPlayers([player1.player, player2.player], true);

        [player1, player2].forEach(async player => {
            const route = () => player.player.GetDescendants().find(descendant => descendant.IsA("StringValue") && descendant.Name === "route") as StringValue | undefined;
            while (route() === undefined) {
                await Promise.delay(0);
            }
            route()!.Value = "/duel/";
        })

        this.handlePhase("DP");
    }

    onChanged() {
        this.changed.set(this.changed.get() + 1);
    }

    endDuel() {
        duels = Object.fromEntries(Object.entries(duels).filter(([key, value]) => value !== this));
        Remotes.Server.Get("showField").SendToPlayers([this.player1.player, this.player2.player], false);
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

    async handleResponses(player: YPlayer) {
        this.handlingResponses.set(true)
        let passes = 0
        this.actor.set(player)

        while (passes < 2) {
            const numberOfResponses = this.turnPlayer.get().responses.get().size()
            const lastCardInChain = this.chain.get()[Object.keys(this.chain.get()).size() - 1]
            const chainStartMessage = `You have ${numberOfResponses} card/effect${numberOfResponses > 1 ? 's' : ''
                } that can be activated. Activate?`
            const chainResponseMessage = `"${lastCardInChain ? lastCardInChain?.card.name : '?'
                }" is activated. Chain another card or effect?`

            if (numberOfResponses > 0) {
                const response = await confirm(
                    numberOfResponses >= 1
                        ? chainStartMessage
                        : chainResponseMessage || chainStartMessage,
                    this.actor.get().player,
                )

                if (response === 'YES') {
                    passes = 0
                    this.actor.get().action.wait()
                    await Promise.delay(0.15)
                } else if (response === 'NO') {
                    passes++
                }
            } else {
                passes++
            }

            this.getOpponent(this.actor.get().player).action.set(undefined);
            if (passes < 2) {
                this.actor.set(this.getOpponent(this.actor.get().player))
            } else if (passes === 2) {
                this.actor.set(this.turnPlayer.get())
            }
        }
        this.handlingResponses.set(false)
        this.resolveChain()
    }

    resolveChain() {
        if (this.chainResolving.get() === true) return
        this.chainResolving.set(true)
        //from highest key to lowest key
        const chain = this.chain.get()
        for (let chainNumber = Object.keys(chain).size() - 1; chainNumber >= 0; chainNumber--) {
            const chainedEffect = chain[chainNumber + 1];

            if (!chainedEffect.negated && !chainedEffect.card.getFloodgates("EFFECTS_NEGATED")) {
                chainedEffect.effect()
            }
            wait(3)
            chainedEffect.card.chainLink.set(0)
            if (!includes(chainedEffect.card.race.get(), 'Equip')) {
                chainedEffect.card.targets.set([])
            }
        }

        // Remove non-continuous spell/trap cards from SZone, and reset activated
        Object.values(chain).forEach(({ card }) => {
            if (
                card.getFloodgates("CONTINUOUS") ||
                includes(card.race.get(), 'Continuous') ||
                includes(card.race.get(), 'Equip') ||
                includes(card.race.get(), 'Field')
            )
                return
            if (card.location.get().match('SZone').size() > 0) {
                card.toGraveyard()
            }
            card.activated.set(false)
        })
        this.chain.set({})
        this.gameState.set('OPEN')
        this.chainResolving.set(false)
        this.actor.set(this.turnPlayer.get())
        this.speedSpell.set(1)
        this.player1.targets.set([])
        this.player2.targets.set([])

        if (this.battleStep.get() === 'BATTLE' && this.attackingCard.get()) {
            if (this.attackingCard.get()?.attackNegated.get() === false) {
                this.attackingCard.get()?.attack(this.defendingCard.get())
            }
        }
        try {
            const turn = this.turn.get()
            this.attackingCard.get()?.addFloodgate("SKIP_BP", () => {
                return this.turn.get() !== turn
            });
            this.attackingCard.get()?.addFloodgate("CHANGED_POSITION", () => {
                return this.turn.get() !== turn
            });
        } catch {
            print('No attacking card')
        }
        this.attackingCard.set(undefined)
        this.defendingCard.set(undefined)
    }

    addToChain(card: Card, effect: Callback) {
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
        wait()

        this.getOpponent(card.controller.get()).targets.set([])
        this.handleResponses(this.getOpponent(card.controller.get()))
    }

    async handlePhase(p: Phase) {
        this.gameState.set('OPEN')
        if (p === 'DP') {
            this.turn.set(this.turn.get() + 1)
            this.turnPlayer.get().addFloodgate("CANNOT_ENTER_BP", () => {
                return this.turn.get() !== 1
            })
            if (this.turn.get() >= 2) {
                this.turnPlayer.set(this.getOpponent(this.turnPlayer.get().player))
                this.actor.set(this.turnPlayer.get())
            }
            this.phase.set(p)
            await Promise.delay(0.15)
            if (this.turn.get() === 1) {
                const thread = [this.player1, this.player2].map((player) =>
                    coroutine.wrap(() => {
                        player.shuffle()
                        wait(player.cards.get().size() * 0.03)
                        player.draw(5)
                    })
                )
                thread[0]()
                thread[1]()
                await Promise.delay(0.25 * 5)
            } 
            this.turnPlayer.get().draw(1)
            await this.handleResponses(this.turnPlayer.get())
            await this.handlePhase('SP')
        } else if (p === 'SP') {
            this.phase.set(p)
            await Promise.delay(0.15)
            await this.handleResponses(this.turnPlayer.get())
            await this.handlePhase('MP1')
        } else if (p === 'MP1') {
            this.phase.set(p)
            await Promise.delay(0.15)
        } else if (p === 'BP') {
            this.phase.set(p)
            await Promise.delay(0.15)
            this.battleStep.set('START')
            await this.handleResponses(this.turnPlayer.get())
            this.battleStep.set('BATTLE')
        } else if (p === 'MP2') {
            this.phase.set(p)
            await Promise.delay(0.15)
        } else if (p === 'EP') {
            if (this.phase.get() === 'MP1' || this.phase.get() === 'MP2') {
                this.phase.set(p)
                await Promise.delay(0.15)
                await this.handleResponses(this.turnPlayer.get())
                await this.handlePhase('DP')
            } else if (this.phase.get() === 'BP') {
                await this.handleResponses(this.turnPlayer.get())
                await this.handlePhase('MP2')
            }
        }
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
    return Object.values(duels).find(duel => duel.player1.player === player || duel.player2.player === player)
}
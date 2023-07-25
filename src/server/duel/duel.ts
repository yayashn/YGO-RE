import { Subscribable } from "shared/Subscribable";
import { YPlayer } from "./player";
import { ChainedEffect, Phase } from "./types";
import { Dictionary as Object } from "@rbxts/sift";
import Remotes from "shared/net";
import { getFilteredCards } from "./utils";
import confirm from "server/popups/confirm";
import { includes } from "shared/utils";
import type { Card } from "./card";

export let duels: Record<string, Duel> = {}

export class Duel {
    player1: YPlayer;
    player2: YPlayer;
    phase: Subscribable<Phase> = new Subscribable<Phase>("DP");
    turn = new Subscribable(0);
    gameState = new Subscribable<"OPEN" | "CLOSED">("OPEN");
    turnPlayer: Subscribable<YPlayer>;
    actor: Subscribable<YPlayer>;
    battleStep = new Subscribable('');
    chain: Subscribable<Record<number, ChainedEffect>> = new Subscribable({});
    chainResolving = new Subscribable(false);
    speedSpell = new Subscribable(0);
    attackingCard = new Subscribable<Card | undefined>(undefined);
    defendingCard = new Subscribable<Card | undefined>(undefined);
    handlingResponses = new Subscribable(false);

    constructor(player1: Player, player2: Player) {
        this.player1 = new YPlayer(player1);
        this.player2 = new YPlayer(player2);
        duels[`${player1.UserId}:${player2.UserId}`] = this;
        this.turnPlayer = new Subscribable<YPlayer>(this.player1);
        this.actor = new Subscribable<YPlayer>(this.player1);

        Remotes.Server.Get("showField").SendToPlayers([player1, player2], true);

        [player1, player2].forEach(player => {
            const route = player.GetDescendants().find(descendant => descendant.IsA("StringValue") && descendant.Name === "route") as StringValue;
            route.Value = "/duel/";
        })

        this.turnPlayer.get().addFloodgate("CANNOT_NORMAL_SUMMON_FIRST_TURN");
        this.handlePhase("DP");
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

    async handleResponses(player: YPlayer) {
        this.handlingResponses.set(true)
        let passes = 0
        this.actor.set(player)

        while (passes < 2) {
            const numberOfResponses = this.turnPlayer.get().responses.get().size()
            const lastCardInChain = this.chain.get()[Object.keys(this.chain.get()).size() - 1]
            const chainStartMessage = `You have ${numberOfResponses} card/effect${numberOfResponses > 1 ? 's' : ''
                } that can be activated. Activate?`
            const chainResponseMessage = `"${lastCardInChain ? lastCardInChain.card.name : '?'
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
        for (let chainNumber = Object.keys(this.chain.get()).size() - 1; chainNumber >= 0; chainNumber--) {
            const { card, effect, negated } = this.chain.get()[chainNumber]
            if (!negated && !card.getFloodgate("EFFECTS_NEGATED")) {
                effect()
            }
            wait(3)
            card.chainLink.set(0)
            if (!includes(card.race.get(), 'Equip')) {
                card.targets.set([])
            }
        }

        // Remove non-continuous spell/trap cards from SZone, and reset activated
        Object.values(this.chain.get()).forEach(({ card }) => {
            if (
                card.getFloodgate("CONTINUOUS") ||
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
            this.attackingCard.get()?.addFloodgate("CANNOT_ATTACK_AFTER_ATTACK");
        } catch {
            print('No attacking card')
        }
        this.attackingCard.set(undefined)
        this.defendingCard.set(undefined)
    }

    async handlePhase(p: Phase) {
        this.gameState.set('OPEN')
        if (p === 'DP') {
            this.turn.set(this.turn.get() + 1)
            const cardsInSZone = getFilteredCards(this, {
                location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5']
            })
            cardsInSZone.forEach((card) => {
                card.removeFloodgate("CANNOT_ACTIVATE_AFTER_SET");
            })
            const cardsInMZone = getFilteredCards(this, {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5']
            })
            for (const card of cardsInMZone) {
                card.removeFloodgate("CANNOT_ATTACK_AFTER_ATTACK")
                card.removeFloodgate("CANNOT_CHANGE_POSITION_AFTER_PLACEMENT")
                card.removeFloodgate("CANNOT_CHANGE_POSITION_AFTER_ATTACK")
            }
            if (this.turn.get() >= 2) {
                this.turnPlayer.set(this.getOpponent(this.turnPlayer.get().player))
                this.actor.set(this.turnPlayer.get())
            }
            this.phase.set(p)
            await Promise.delay(0.15)
            this.turnPlayer.get().removeFloodgate("CANNOT_NORMAL_SUMMON_FIRST_TURN")
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
}

export function getDuel(player: Player) {
    return Object.values(duels).find(duel => duel.player1.player === player || duel.player2.player === player)
}
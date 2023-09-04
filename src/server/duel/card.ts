import { HttpService } from '@rbxts/services'
import getCardData, { areCardsEqual, includes } from 'shared/utils'
import {
    Action,
    CardFloodgate,
    CardPublic,
    FloodgateValueAtkDefModifier,
    FloodgateValueCannotBeDestroyedBy,
    FloodgateValueTakeControl,
    Location,
    Position
} from './types'
import { Subscribable } from 'shared/Subscribable'
import cardEffects, { TriggerEffect } from 'server-storage/card-effects/index'
import { getFilteredCards, getPublicCard } from './utils'
import { getDuel } from './duel'
import { Dictionary as Object } from '@rbxts/sift'
import Remotes from 'shared/net/remotes'
import { CardRemotes } from 'shared/duel/remotes'
import { YPlayer } from './player'

export class Card {
    changed = new Subscribable(0)
    uid: string
    name: Subscribable<string>
    atk = new Subscribable<number | undefined>(undefined)
    def = new Subscribable<number | undefined>(undefined)
    originalData: Subscribable<Record<string, unknown>>
    race: Subscribable<string>
    desc: Subscribable<string>
    level = new Subscribable<number | undefined>(undefined)
    art: string
    owner: Player
    controller: Subscribable<Player>
    position: Subscribable<Position>
    location: Subscribable<Location>
    order: Subscribable<number>
    'type': Subscribable<string>
    chainLink = new Subscribable<number>(0)
    targets = new Subscribable<Card[]>([])
    activated = new Subscribable(false)
    attackNegated = new Subscribable(false)
    status = new Subscribable<string>('')
    attribute: Subscribable<string>
    atkModifier = new Subscribable<Record<string, number>>({})
    defModifier = new Subscribable<Record<string, number>>({})
    clientCardCachePlayer1: CardPublic | undefined
    clientCardCachePlayer2: CardPublic | undefined

    constructor(name: string, owner: Player, order: number) {
        const cardData = getCardData(name)!
        if (!cardData) {
            error(`Card ${name} does not exist!`)
        }
        this.originalData = new Subscribable(cardData)
        this.uid = HttpService.GenerateGUID(false)
        this.name = new Subscribable(name)
        this.race = new Subscribable(cardData.race)
        this.desc = new Subscribable(cardData.desc)
        this.position = new Subscribable<Position>('FaceDown', () => {
            this.refreshClientCard()
        })
        this.art = cardData.art
        this.owner = owner
        this.controller = new Subscribable<Player>(owner, () => {
            this.refreshClientCard()
        })
        this.order = new Subscribable<number>(order, () => {
            this.refreshClientCard()
        })
        this['type'] = new Subscribable<string>(cardData['type'])
        this.attribute = new Subscribable<string>(
            cardData['attribute'] || cardData.type.split(' ')[0]
        )

        if (cardData['type'].match('Fusion').size() > 0) {
            this.location = new Subscribable<Location>('EZone', () => {
                this.onChanged()
            })
        } else {
            this.location = new Subscribable<Location>('Deck', () => {
                this.onChanged()
            })
        }
        if (cardData['type'].match('Monster').size() > 0) {
            this.atk.set(cardData.atk!)
            this.def.set(cardData.def!)
            this.level.set(cardData.level!)
        }
    }

    onChanged = () => {
        this.handleFloodgates()
        this.changed.set(this.changed.get() + 1)
        this.refreshClientCard()
    }

    handleContinuousEffects = () => {
        try {
            const effects = cardEffects[this.name.get()](this)
            const continuousEffects = effects.filter((effect) => effect.continuous !== undefined);
            continuousEffects.forEach((effect) => {
                if(effect.continuous!.condition && !effect.continuous!.condition()) return;
                effect.continuous!.effect(this)
            })
        } catch{}
    }

    refreshClientCard = async () => {
        const duel = getDuel(this.owner)!
        const player1 = duel.player1
        const player2 = duel.player2

        ;[player1.player, player2.player].forEach((p, i) => {
            const publicCard = getPublicCard(p, this)
            const cachedCard = this[`clientCardCachePlayer${(i + 1) as 1 | 2}`]
            if (!areCardsEqual(publicCard, cachedCard || ({} as CardPublic))) {
                CardRemotes.Server.Get('cardChanged').SendToPlayer(p, publicCard)
                this[`clientCardCachePlayer${(i + 1) as 1}`] = publicCard
            }
        })
    }

    handlingTakeControl = false
    handleFloodgates = () => {
        this.exodia()
        if(!this.handlingTakeControl) {
            this.handlingTakeControl = true
            if(this.hasFloodgate("TAKE_CONTROL")) {
                const takeControlFloodgates = this.getFloodgates("TAKE_CONTROL") as CardFloodgate<FloodgateValueTakeControl>[];
                const highestPriorityFloodgate = takeControlFloodgates.reduce((a, b) => {
                    return a.floodgateValue!.priority > b.floodgateValue!.priority ? a : b;
                })
                const controller = highestPriorityFloodgate.floodgateValue!.controller;
                this.controller.set(controller)
            } else if(includes(this.location.get(), "MZone") && this.controller.get() !== this.owner) {
                const duel = getDuel(this.owner)!
                const hasEmptyZones = duel.getEmptyFieldZones('MZone', this.owner, 'Player').size() > 0;
                if(hasEmptyZones) {
                    const controller = duel.getPlayer(this.owner)
                    const pickZone = duel.pickZone(controller);
                    this.location.set(pickZone)
                    this.controller.set(this.owner)
                }
            }
            this.handlingTakeControl = false
        }
        if (this.hasFloodgate('FORCE_FACEUP_DEFENSE')) {
            this.position.set('FaceUpDefense')
        }
        if (this.hasFloodgate('MODIFY_ATK')) {
            const modifyAtkFloodgates = this.getFloodgates('MODIFY_ATK')!

            const modifier: Record<string, number> = {}

            modifyAtkFloodgates.forEach((floodgate) => {
                const modifierData = floodgate.floodgateValue as FloodgateValueAtkDefModifier
                modifier[modifierData.modifierId] = modifierData.value
            })
            this.atkModifier.set(modifier)
        } else {
            this.atkModifier.set({})
        }
        if (this.hasFloodgate('MODIFY_DEF')) {
            const modifyDefFloodgates = this.getFloodgates('MODIFY_DEF')!

            const modifier: Record<string, number> = {}

            modifyDefFloodgates.forEach((floodgate) => {
                const modifierData = floodgate.floodgateValue as FloodgateValueAtkDefModifier
                modifier[modifierData.modifierId] = modifierData.value
            })
            this.defModifier.set(modifier)
        } else {
            this.defModifier.set({})
        }
        new Promise(() => this.refreshClientCard())
    }

    getAtk() {
        const totalModifier = Object.values(this.atkModifier.get()).reduce((a, b) => a + b, 0)
        if (this.atk.get()! + totalModifier <= 0) {
            return 0
        } else {
            const modifier = this.atk.get()! + totalModifier
            if(this.hasFloodgate("SANGA_OF_THE_THUNDER")) {
                const duel = getDuel(this.owner)!
                if(duel.damageStep.get() === "DURING") {
                    return 0
                }
            }
            return modifier
        }
    }

    getDef() {
        const totalModifier = Object.values(this.defModifier.get()).reduce((a, b) => a + b, 0)
        if (this.def.get()! + totalModifier <= 0) {
            return 0
        } else {
            return this.def.get()! + totalModifier
        }
    }

    getController() {
        const duel = getDuel(this.owner)!
        return duel.getPlayer(this.controller.get())
    }

    isTargettable(player: Player) {
        const duel = getDuel(player)!;
        const yPlayer = duel.getPlayer(player);
        return yPlayer.targettableCards.get().includes(this);
    }

    getFloodgates(floodgateName: string) {
        const duel = getDuel(this.owner)!
        const floodgates = duel.cardFloodgates.get()

        if (!floodgates[floodgateName]) return []

        const floodgatesFound = floodgates[floodgateName].filter((floodgate) => {
            return Object.entries(floodgate.floodgateFilter).every(([key, values]) => {
                if (key === 'type') {
                    return values!.some(
                        (value) =>
                            this['type']
                                .get()
                                .match(value as string)
                                .size() > 0
                    )
                }
                if (key === 'name' || key === 'uid') {
                    return values!.some((value) => this[key] === value)
                }
                if (key === 'card') {
                    return (values as Card[]).includes(this)
                }
                if(key === "exclude") {
                    return false;
                }
                return values!.some((value) => this[key].get() === value)
            })
        })

        return floodgatesFound
    }

    hasFloodgate(floodgateName: string) {
        try {
            const duel = getDuel(this.owner)!
            const floodgates = duel.cardFloodgates.get()
    
            if (!floodgates[floodgateName]) return false
    
            const floodgatesFound = floodgates[floodgateName].some((floodgate) => {
                return Object.entries(floodgate.floodgateFilter).every(([key, values]) => {
                    if (key === 'type') {
                        return values!.some(
                            (value) =>
                                this['type']
                                    .get()
                                    .match(value as string)
                                    .size() > 0
                        )
                    }
                    if (key === 'name' || key === 'uid') {
                        return values!.some((value) => this[key] === value)
                    }
                    if (key === 'card') {
                        return (values as Card[]).includes(this)
                    }
                    if(key === "exclude") {
                        return false;
                    }
                    return values!.some((value) => this[key].get() === value)
                })
            })
    
            return floodgatesFound
        } catch (e) {
            return false
        }
    }

    normalSummon(location: Location) {
        this.position.set('FaceUpAttack')
        const duel = getDuel(this.owner)!
        const turn = duel.turn.get()
        duel.addCardFloodgate('CANNOT_CHANGE_POSITION', {
            floodgateFilter: {
                card: [this]
            },
            expiry: () => duel.turn.get() !== turn
        })
        this.location.set(location)
        duel.setAction({
            action: 'Normal Summon',
            cards: [this],
            player: this.getController(),
            prediction: {}
        })
    }

    tributeSummon(location: Location) {
        const duel = getDuel(this.owner)!
        this.normalSummon(location)
        wait(1)
        duel.setAction({
            action: 'Tribute Summon',
            cards: [this],
            player: this.getController(),
            prediction: {}
        })
    }

    specialSummon(location: Location, newPosition: Position, controller?: Player) {
        const duel = getDuel(this.owner)!
        const turn = duel.turn.get()
        this.position.set(newPosition)
        if(controller) {
            this.controller.set(controller)
        }
        this.location.set(location)
        duel.addCardFloodgate('CANNOT_CHANGE_POSITION', {
            floodgateFilter: {
                card: [this]
            },
            expiry: () => duel.turn.get() !== turn
        })
        duel.addCardFloodgate('WAS_SPECIAL_SUMMONED', {
            floodgateFilter: {
                card: [this]
            },
            expiry: () => {
                return ["Deck", "EZone", "Hand"].includes(this.location.get())
                || (this.location.get() === "BZone" && this.position.get() === "FaceDown")
            }
        })
        duel.setAction({
            action: 'Special Summon',
            cards: [this],
            player: this.getController(),
            prediction: {}
        })
    }

    reveal() {
        const oldPosition = this.position.get()
        this.position.set('FaceUp')
        wait(2)
        this.position.set(oldPosition)
    }

    toHand() {
        this.controller.set(this.owner)
        this.position.set('FaceDown')
        if (includes(this.type.get(), 'Fusion')) {
            this.location.set('EZone')
        } else {
            this.location.set('Hand')
        }
    }

    banish(position: Position) {
        this.controller.set(this.owner)
        this.position.set(position)
        this.location.set('BZone')
    }

    tributeSet(location: Location) {
        this.set(location)
    }

    async changePosition(forcePosition?: Position) {
        const duel = getDuel(this.owner)!
        const turn = duel.turn.get()

        const flipEffect = this.getTriggerEffect("FLIP");
        const defenseToAttackEffect = this.getTriggerEffect("DEFENSE_TO_ATTACK");
        const attackToDefenseEffect = this.getTriggerEffect("ATTACK_TO_DEFENSE");
        const triggerEffect = flipEffect || defenseToAttackEffect;
        if (forcePosition) {
            const oldPosition = this.position.get()
            this.position.set(forcePosition)
            if (
                oldPosition === 'FaceDownDefense' &&
                triggerEffect !== undefined &&
                forcePosition === 'FaceUpAttack'
            ) {
                duel.addPendingEffect({
                    card: this,
                    effect: triggerEffect,
                    prediction: {}
                })
                await duel.handleResponses(duel.getOpponent(this.controller.get()))
            } else if(
                oldPosition === "FaceUpDefense"
                && forcePosition === "FaceUpAttack"
                && defenseToAttackEffect !== undefined
            ) {
                duel.addPendingEffect({
                    card: this,
                    effect: defenseToAttackEffect,
                    prediction: {}
                })
                await duel.handleResponses(duel.getOpponent(this.controller.get()))
            } else if(
                oldPosition === "FaceUpAttack"
                && forcePosition === "FaceUpDefense"
                && attackToDefenseEffect !== undefined
            ) {
                duel.addPendingEffect({
                    card: this,
                    effect: attackToDefenseEffect,
                    prediction: {}
                })
                await duel.handleResponses(duel.getOpponent(this.controller.get()))
            }
            return
        }
        duel.addCardFloodgate('CANNOT_CHANGE_POSITION', {
            floodgateFilter: {
                card: [this]
            },
            expiry: () => duel.turn.get() !== turn
        })
        if (this.position.get() === 'FaceUpAttack') {
            this.position.set('FaceUpDefense')
        } else {
            this.position.set('FaceUpAttack')
            if(defenseToAttackEffect) {
                duel.addPendingEffect({
                    card: this,
                    effect: defenseToAttackEffect,
                    prediction: {}
                })
                await duel.handleResponses(duel.getOpponent(this.controller.get()))
            }
        }
    }

    async flip(inBattle?: boolean) {
        this.position.set('FaceUpDefense')
        const flipEffect = this.getTriggerEffect("FLIP");
        if (!inBattle && flipEffect !== undefined) {
            const duel = getDuel(this.owner)!
            duel.addPendingEffect({
                card: this,
                effect: flipEffect,
                prediction: {}
            })
            await duel.handleResponses(duel.getOpponent(this.controller.get()))
        }
    }

    async flipSummon() {
        const duel = getDuel(this.owner)!
        const turn = duel.turn.get()

        duel.addCardFloodgate('CANNOT_CHANGE_POSITION', {
            floodgateFilter: {
                card: [this]
            },
            expiry: () => duel.turn.get() !== turn
        })
        this.position.set('FaceUpAttack')

        duel.setAction({
            action: 'Flip Summon',
            cards: [this],
            player: this.getController(),
            prediction: {}
        })
        const triggerEffect = this.getTriggerEffect("FLIP") || this.getTriggerEffect("DEFENSE_TO_ATTACK");
        if(triggerEffect) {
            duel.addPendingEffect({
                card: this,
                effect: triggerEffect,
                prediction: {}
            })
            await duel.handleResponses(duel.getOpponent(this.controller.get()))
        }
    }

    set(location: Location) {
        const duel = getDuel(this.owner)!
        const turn = duel.turn.get()
        if (this.type.get().match('Monster').size() > 0) {
            this.position.set('FaceDownDefense')

            duel.addCardFloodgate('CANNOT_CHANGE_POSITION', {
                floodgateFilter: {
                    card: [this]
                },
                expiry: () => duel.turn.get() !== turn
            })

            this.location.set(location)
            wait(1)
            duel.setAction({
                action: 'Set Monster',
                cards: [this],
                player: this.getController(),
                prediction: {}
            })
        } else {
            this.position.set('FaceDown')
            if (
                this['type'].get().match('Trap').size() > 0 ||
                this['type'].get().match('Quick').size() > 0
            ) {
                duel.addCardFloodgate('CANNOT_ACTIVATE', {
                    floodgateFilter: {
                        card: [this]
                    },
                    expiry: () => {
                        return duel.turn.get() !== turn
                    }
                })
            }
            if (this.race.get() === 'Field') {
                const fieldSpells = getFilteredCards(duel, {
                    location: ['FZone']
                })
                fieldSpells.forEach((fieldSpell) => {
                    fieldSpell.destroy('Mechanic')
                })
                this.location.set('FZone')
            } else {
                this.location.set(location)
            }
            wait(1)
            duel.setAction({
                action: 'Set',
                cards: [this],
                player: this.getController(),
                prediction: {}
            })
        }
    }

    toGraveyard(cause?: string) {
        const from = this.location.get()
        this.controller.set(this.owner)
        this.position.set('FaceUp')
        this.location.set('GZone')
        const duel = getDuel(this.owner)!
        
        print(cause, this.hasTriggerEffect("SENT_FROM_FIELD_TO_GY_BATTLE"))

        if((includes(from, "MZone") || includes(from, "SZone") || includes(from, "FZone"))) {
            if(this.hasTriggerEffect("SENT_FROM_FIELD_TO_GY")) {
                duel.addPendingEffect({
                    card: this,
                    effect: this.getTriggerEffect("SENT_FROM_FIELD_TO_GY")!,
                    prediction: {}
                })
            } else if(this.hasTriggerEffect("SENT_FROM_FIELD_TO_GY_BATTLE") && cause === "Battle") {
                print(999)
                duel.addPendingEffect({
                    card: this,
                    effect: this.getTriggerEffect("SENT_FROM_FIELD_TO_GY_BATTLE")!,
                    prediction: {}
                })
            }
        }
    }

    getEffects() {
        const effects = cardEffects[this.name.get()];
        if(!effects) return [];
        return effects(this);
    }

    getEffect(number: number) {
        return this.getEffects()[number]
    }

    getTriggerEffects() {
        return this.getEffects().filter((effect) => effect.trigger !== undefined)
    }

    hasTriggerEffect(trigger: TriggerEffect) {
        return this.getTriggerEffects().some((effect) => effect.trigger === trigger)
    }

    async attack(defender?: Card) {
        const duel = getDuel(this.owner)!
        const isDirectAttack = !defender
        const defenderLocation = isDirectAttack ? '' : defender.location.get()
        const defenderAtk = isDirectAttack ? 0 : defender.getAtk()
        const turn = duel.turn.get()
        print(duel.attackingCard.get())

        const opponent = duel.getOpponent(this.controller.get())
        let calculation = 0;
        let isDefenderCalculation = false;

        const attackCancelled = () => {
            const isDefensePosition = includes(this.position.get(), 'Defense')
            const isMzone = includes(this.location.get(), 'MZone')
            const cancelled = isDefensePosition || !isMzone
            return cancelled
        }

        const startOfDamageStep = async  () => {
            print(duel.attackingCard.get())
            try {
                const attackCost = cardEffects[this.name.get()](this)[0].attackCost;
                if(attackCost) {
                    attackCost()
                }
            } catch {}

            duel.addCardFloodgate('CANNOT_ATTACK', {
                floodgateFilter: {
                    card: [this]
                },
                expiry: () =>
                    duel.turn.get() !== turn ||
                    includes(this.position.get(), 'FaceDown') ||
                    !includes(this.location.get(), 'MZone')
            })
            duel.addCardFloodgate('CANNOT_ATTACK', {
                floodgateFilter: {
                    card: [this]
                },
                expiry: () =>
                    duel.turn.get() !== turn ||
                    includes(this.position.get(), 'FaceDown') ||
                    !includes(this.location.get(), 'MZone')
            })
            duel.addCardFloodgate('CANNOT_CHANGE_POSITION', {
                floodgateFilter: {
                    card: [this]
                },
                expiry: () =>
                    duel.turn.get() !== turn || !includes(this.location.get(), 'MZone')
            })
            duel.addCardFloodgate('CANNOT_CHANGE_POSITION', {
                floodgateFilter: {
                    card: [this]
                },
                expiry: () =>
                    duel.turn.get() !== turn ||
                    includes(this.position.get(), 'FaceDown') || !includes(this.location.get(), 'MZone')
            })

            duel.battleStep.set('DAMAGE')
            duel.damageStep.set('START')
            wait(.5)
            await duel.handleResponses(duel.turnPlayer.get())
            //during damage step only effects
            //start of damage step effects
            //ATK/DEF change effects
            //check if players finished effects

            if (!attackCancelled()) {
                await beforeDamageCalculation()
            } else {
                await endOfDamageStep()
            }
        }

        const beforeDamageCalculation = async () => {
            print(duel.attackingCard.get())
            Remotes.Server.Get('attackCard3D').SendToPlayer(
                this.controller.get(),
                false,
                this.location.get(),
                isDirectAttack ? undefined : defender.location.get(),
                true
            )
            Remotes.Server.Get('attackCard3D').SendToPlayer(
                opponent.player,
                true,
                this.location.get(),
                isDirectAttack ? undefined : defender.location.get(),
                true
            )

            duel.damageStep.set('BEFORE')
            if (!isDirectAttack && defender.position.get() === 'FaceDownDefense') {
                await defender.flip(true)
                wait(1)
            }
            await duel.handleResponses(duel.turnPlayer.get())
            //ATK/DEF change effects
            //before damage calculation effects
            //check if players finished effects
            duel.handleCardFloodgates()
            if (!isDirectAttack) {
                if (defenderLocation.match('MZone').size() === 0) {
                    await endOfDamageStep()
                } else {
                    await damageCalculation()
                }
            } else {
                await damageCalculation()
            }
        }

        const damageCalculation = async () => {
            print(duel.attackingCard.get())
            Remotes.Server.Get('attackCard3D').SendToPlayer(
                this.controller.get(),
                false,
                this.location.get(),
                isDirectAttack ? undefined : defender.location.get(),
                true
            )
            Remotes.Server.Get('attackCard3D').SendToPlayer(
                opponent.player,
                true,
                this.location.get(),
                isDirectAttack ? undefined : defender.location.get(),
                true
            )

            duel.damageStep.set('DURING')

            //during damage calculation only effects immediately
            //during damage calculation effects
            await duel.handleResponses(duel.turnPlayer.get(), true)
            
            const NO_BATTLE_DAMAGE_OPPONENT = opponent.hasFloodgate("NO_BATTLE_DAMAGE")
            if (isDirectAttack) {
                calculation = NO_BATTLE_DAMAGE_OPPONENT ? 0 : this.getAtk();
                opponent.changeLifePoints(-calculation)
            } else {
                if (defender.position.get() === 'FaceUpAttack') {
                    if (this.getAtk()! > defenderAtk) {
                        defender.destroy('Battle', this)
                        calculation = NO_BATTLE_DAMAGE_OPPONENT ? 0 : this.getAtk()! - defenderAtk!
                        defender.getController().changeLifePoints(-calculation)
                    } else if (this.getAtk()! < defenderAtk) {
                        this.destroy('Battle', defender)
                        calculation = NO_BATTLE_DAMAGE_OPPONENT ? 0 : defenderAtk - this.getAtk()!
                        this.getController().changeLifePoints(-calculation)
                    } else if (this.getAtk() === defenderAtk && this.getAtk() !== 0) {
                        defender.destroy('Battle', this)
                        this.destroy('Battle', defender)
                    }
                } else {
                    if (this.getAtk() > defender.getDef()) {
                        defender.destroy('Battle', this)
                    } else if (this.getAtk()! < defender.getDef()) {
                        isDefenderCalculation = true
                        calculation = defender.getDef() - this.getAtk()
                        this.getController().changeLifePoints(-calculation)
                    }
                }
            }
           await afterDamageCalculation()
        }

        const afterDamageCalculation = async () => {
            print(duel.attackingCard.get())
            Remotes.Server.Get('attackCard3D').SendToPlayer(
                this.controller.get(),
                false,
                this.location.get(),
                isDirectAttack ? undefined : defender.location.get(),
                true
            )
            Remotes.Server.Get('attackCard3D').SendToPlayer(
                opponent.player,
                true,
                this.location.get(),
                isDirectAttack ? undefined : defender.location.get(),
                true
            )

            duel.damageStep.set('AFTER')
            //self destruction continuous effects immediately
            //after damage calculation effects
            //battle damage effects
            //flip effects
            if(calculation > 0) {
                isDefenderCalculation
                    ? defender?.getController().inflictedBattleDamage.increment() 
                    : this.getController().inflictedBattleDamage.increment()
                wait(1)
            }
            if(!isDefenderCalculation && calculation > 0 && this.hasTriggerEffect("INFLICTS_BATTLE_DAMAGE")) {
                duel.addPendingEffect({
                    card: this,
                    effect: this!.getTriggerEffect("INFLICTS_BATTLE_DAMAGE")!,
                    prediction: {}
                })
            } else if(isDefenderCalculation && calculation > 0 && defender!.hasTriggerEffect("INFLICTS_BATTLE_DAMAGE")) {
                duel.addPendingEffect({
                    card: defender!,
                    effect: defender!.getTriggerEffect("INFLICTS_BATTLE_DAMAGE")!,
                    prediction: {}
                })
            }
            await duel.handleResponses(duel.turnPlayer.get())
            await endOfDamageStep()
        }

        const endOfDamageStep = async () => {
            Remotes.Server.Get('attackCard3D').SendToPlayer(
                this.controller.get(),
                false,
                this.location.get(),
                isDirectAttack ? undefined : defender.location.get(),
                true
            )
            Remotes.Server.Get('attackCard3D').SendToPlayer(
                opponent.player,
                true,
                this.location.get(),
                isDirectAttack ? undefined : defender.location.get(),
                true
            )

            duel.damageStep.set('END')
            if (!isDirectAttack) {
                if (defender.status.get() === 'destroyedByBattle') {
                    defender.toGraveyard("Battle")
                    defender.status.set('')
                }
                if (this.status.get() === 'destroyedByBattle') {
                    this.toGraveyard("Battle")
                    this.status.set('')
                }
            }
            duel.battleStep.set('BATTLE')
            duel.attackingCard.set(undefined)
            duel.defendingCard.set(undefined)
            await duel.handleResponses(duel.turnPlayer.get())
        }
        await startOfDamageStep()
    }

    tribute() {
        this.toGraveyard()
    }

    destroy(cause: "Effect" | "Battle", destroyer: Card): void;
    destroy(cause: "Equip" | "Discard" | "Mechanic", destroyer?: Card): void;
    destroy(cause: "Effect" | "Battle" | "Equip" | "Discard" | "Mechanic", destroyer?: Card) {
        this.status.set(`destroyedBy${cause}`)
        if(this.hasFloodgate("CANNOT_BE_DESTROYED_BY")) {
            const cannotBeDestroyedByFloodgates = this.getFloodgates("CANNOT_BE_DESTROYED_BY") as CardFloodgate<FloodgateValueCannotBeDestroyedBy>[];
            const cannotBeDestroyedByDestroyer = cannotBeDestroyedByFloodgates.some((floodgate) => {
                return floodgate.floodgateValue!.target === destroyer;
            })
            if(cannotBeDestroyedByDestroyer) {
                return;
            }
        }
        if (!includes(cause, 'Battle')) {
            this.toGraveyard(cause)
        }
    }

    checkEffectConditions() {
        try {
            if (cardEffects[this.name.get()] === undefined) return false
            const effects = cardEffects[this.name.get()](this)
            return effects.find(({ condition }) => {
                if (!condition) {return false}
                return !!condition()
            })!.condition!()
        } catch {
            return false
        }
    }

    getRestrictions(): string[] {
        if (cardEffects[this.name.get()] === undefined) return []
        const effects = cardEffects[this.name.get()](this)
        let restrictionsList: string[] = [];
        effects.forEach(({ restrictions }) => {
            if(restrictions) {
                restrictionsList = [...restrictionsList, ...restrictions()]
            }
        })
        return restrictionsList;
    }

    hasSomeRestrictions(restriction: string[]): boolean {
        return this.getRestrictions().some(r => {
            return restriction.includes(r)
        })
    }

    exodia() {
        if(this.name.get() === "Exodia the Forbidden One" && this.location.get() === "Hand") {
            cardEffects![this.name.get()](this)[0].effect!(this);
        }
    }

    async activateEffect(
        action?: Action
    ) {
        const duel = getDuel(this.owner)!
        const effects = cardEffects[this.name.get()](this)
        const ifMoreThanOneEffect =
            effects
                .map(({ condition }) => {
                    return condition ? condition() : false
                })
                .size() > 1
        if (ifMoreThanOneEffect) {
        } else {
            const { location: locationCondition, effect, action: customAction, trigger, cost, target, prediction } = effects[0]
            const directActivationFromHand = locationCondition?.includes('Hand')
            if(trigger !== undefined) {        
                if(duel.chainResolving.get()) {
                    duel.addPendingEffect({
                        card: this,
                        effect: effects[0],
                        prediction: prediction ? prediction(this) : {}
                    })
                } else {
                    if(cost) {
                        cost()
                    }
                    if(target) {
                        target()
                    }
                    duel.addToChain(this, effect!, customAction || action || {
                        action: 'Activate Effect',
                        cards: [this],
                        player: this.getController(),
                        prediction: prediction ? prediction(this) : {}
                    })
                }
            } else if (this['type'].get() === 'Spell Card') {
                if (this.location.get() === 'Hand' && !directActivationFromHand) {
                    if (includes(this.race.get(), 'Field')) {
                        //check if there's already a field spell on the field
                        const fieldSpells = getFilteredCards(duel, {
                            location: ['FZone']
                        })
                        fieldSpells.forEach((fieldSpell) => fieldSpell.destroy('Mechanic'))
                        this.location.set('FZone')
                        this.position.set('FaceUp')
                    } else {
                        this.getController().selectableZones.set(
                            duel.getEmptyFieldZones('SZone', this.getController().player, 'Player')
                        )
                        const zone = this.getController().selectedZone.wait()!
                        this.location.set(zone)
                        this.position.set('FaceUp')
                        this.getController().selectedZone.set(undefined)
                        this.getController().selectableZones.set([])
                    }
                    if(cost) {
                        cost()
                    }
                    if(target) {
                        target()
                    }
                    duel.addToChain(this, effect!, {
                        action: 'Activate Spell',
                        cards: [this],
                        player: this.getController(),
                        prediction: prediction ? prediction(this) : {}
                    }, undefined)
                } else if (
                    this.location.get().match('SZone').size() > 0 ||
                    this.location.get().match('MZone').size() > 0 ||
                    this.location.get().match('FZone').size() > 0
                ) {
                    this.position.set('FaceUp');
                    if(cost) {
                        cost()
                    }
                    if(target) {
                        target()
                    }
                    duel.addToChain(this, effect!,  {
                        action: 'Activate Spell',
                        cards: [this],
                        player: this.getController(),
                        prediction: prediction ? prediction(this) : {}
                    }, undefined)
                }
            } else if (this['type'].get() === 'Trap Card') {
                this.position.set('FaceUp')
                if(cost) {
                    cost()
                }
                if(target) {
                    target()
                }
                duel.addToChain(this, effect!,  {
                    action: 'Activate Trap',
                    cards: [this],
                    player: this.getController(),
                    prediction: prediction ? prediction(this) : {}
                }, undefined)
            } else {
                if(cost) {
                    cost()
                }
                if(target) {
                    target()
                }
                duel.addToChain(this, effect!, {
                    action: 'Activate Effect',
                    cards: [this],
                    player: this.getController(),
                    prediction: prediction ? prediction(this) : {}
                }, undefined)
            }
        }
        this.activated.set(true)
    }

    getCost() {
        if (cardEffects[this.name.get()] === undefined) return false
        const effects = cardEffects[this.name.get()](this)
        if (effects.size() === 1) {
            return effects[0].cost
        }
        return false
    }

    getTarget() {
        if (cardEffects[this.name.get()] === undefined) return false
        const effects = cardEffects[this.name.get()](this)
        if (effects.size() === 1) {
            return effects[0].target
        }
        return false
    }

    getTriggerEffect(triggerType: TriggerEffect) {
        if (cardEffects[this.name.get()] === undefined) return
        const effects = cardEffects[this.name.get()](this)
        return effects.find(({ trigger }) => trigger === triggerType);
    }
}
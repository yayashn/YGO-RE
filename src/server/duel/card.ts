import { HttpService } from '@rbxts/services'
import getCardData, { areCardsEqual, includes } from 'shared/utils'
import {
    Action,
    CardFloodgate,
    CardPublic,
    FloodgateValueAtkDefModifier,
    FloodgateValueTakeControl,
    Location,
    Position
} from './types'
import { Subscribable } from 'shared/Subscribable'
import cardEffects from 'server-storage/card-effects/index'
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
            return this.atk.get()! + totalModifier
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
                    return values!.some((value) => this[key].get() === value)
                })
            })
    
            return floodgatesFound
        } catch (e) {
            print(e)
            return []
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
            player: this.getController()
        })
    }

    tributeSummon(location: Location) {
        const duel = getDuel(this.owner)!
        this.normalSummon(location)
        wait(1)
        duel.setAction({
            action: 'Tribute Summon',
            cards: [this],
            player: this.getController()
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
        duel.setAction({
            action: 'Special Summon',
            cards: [this],
            player: this.getController()
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
        this.position.set('FaceUp')
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

    changePosition(forcePosition?: Position) {
        const duel = getDuel(this.owner)!
        const turn = duel.turn.get()

        const flipEffect = this.getTriggerEffect("FLIP");

        if (forcePosition) {
            const oldPosition = this.position.get()
            this.position.set(forcePosition)
            if (
                oldPosition === 'FaceDownDefense' &&
                flipEffect !== undefined &&
                includes(forcePosition, 'FaceUp')
            ) {
                this.activateEffect({
                    action: 'Flip',
                    cards: [this],
                    player: this.getController()
                })
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
        }
    }

    flip(inBattle?: boolean) {
        this.position.set('FaceUpDefense')
        if (!inBattle && this.getTriggerEffect("FLIP") !== undefined) {
            this.activateEffect({
                action: 'Flip',
                cards: [this],
                player: this.getController()
            })
        }
    }

    flipSummon() {
        const duel = getDuel(this.owner)!
        const turn = duel.turn.get()

        duel.addCardFloodgate('CANNOT_CHANGE_POSITION', {
            floodgateFilter: {
                card: [this]
            },
            expiry: () => duel.turn.get() !== turn
        })
        this.position.set('FaceUpAttack')

        if (includes(this['type'].get(), 'Flip')) {
            const cost = this.getCost()
            if (cost) {
                cost()
            }
            const target = this.getTarget()
            if (target) {
                target()
            }

            this.activateEffect({
                action: 'Flip Summon',
                cards: [this],
                player: this.getController()
            })
        } else {
            duel.setAction({
                action: 'Flip Summon',
                cards: [this],
                player: this.getController()
            })
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
                player: this.getController()
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
                player: this.getController()
            })
        }
    }

    toGraveyard() {
        this.controller.set(this.owner)
        this.position.set('FaceUp')
        this.location.set('GZone')
    }

    attack(defender?: Card) {
        const duel = getDuel(this.owner)!
        const isDirectAttack = !defender
        const defenderLocation = isDirectAttack ? '' : defender.location.get()
        const defenderAtk = isDirectAttack ? 0 : defender.getAtk()
        const turn = duel.turn.get()

        const opponent = duel.getOpponent(this.controller.get())

        let defenderIsFlip = false

        const attackCancelled = () => {
            const isDefensePosition = includes(this.position.get(), 'Defense')
            const isMzone = includes(this.location.get(), 'MZone')
            const cancelled = isDefensePosition || !isMzone
            return cancelled
        }

        const startOfDamageStep = () => {
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

            wait(0.5)

            duel.handleResponses(duel.turnPlayer.get())
            //during damage step only effects
            //start of damage step effects
            //ATK/DEF change effects
            //check if players finished effects

            if (!attackCancelled()) {
                beforeDamageCalculation()
            } else {
                endOfDamageStep()
            }
        }

        const beforeDamageCalculation = () => {
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
                defender.flip(true)
                if (includes(defender.type.get(), 'Flip')) {
                    defenderIsFlip = true
                }
                wait(1)
            }
            duel.handleResponses(duel.turnPlayer.get())
            //ATK/DEF change effects
            //before damage calculation effects
            //check if players finished effects
            duel.handleCardFloodgates()
            if (!isDirectAttack) {
                if (defenderLocation.match('MZone').size() === 0) {
                    endOfDamageStep()
                } else {
                    damageCalculation()
                }
            } else {
                damageCalculation()
            }
        }

        const damageCalculation = () => {
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
            duel.handleResponses(duel.turnPlayer.get())
            if (isDirectAttack) {
                opponent.changeLifePoints(-this.getAtk())
            } else {
                if (defender.position.get() === 'FaceUpAttack') {
                    if (this.getAtk()! > (defenderAtk as number)) {
                        defender.destroy('Battle')
                        const calculation = this.getAtk()! - defenderAtk!
                        defender.getController().changeLifePoints(-calculation)
                    } else if (this.getAtk()! < (defenderAtk as number)) {
                        this.destroy('Battle')
                        const calculation = (defenderAtk as number) - this.getAtk()!
                        this.getController().changeLifePoints(-calculation)
                    } else if (this.getAtk() === (defenderAtk as number) && this.getAtk() !== 0) {
                        defender.destroy('Battle')
                        this.destroy('Battle')
                    }
                } else {
                    if (this.getAtk() > defender.getDef()) {
                        defender.destroy('Battle')
                    } else if (this.getAtk()! < defender.getDef()) {
                        const calculation = defender.getDef() - this.getAtk()
                        this.getController().changeLifePoints(-calculation)
                    }
                }
            }
            afterDamageCalculation()
        }

        const afterDamageCalculation = () => {
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
            if (defenderIsFlip) {
                const cost = defender!.getCost()
                if (cost) {
                    cost()
                }
                const target = defender!.getTarget()
                if (target) {
                    target()
                }
                defender!.activateEffect({
                    action: 'Flip',
                    player: defender!.getController(),
                    cards: [defender!]
                })
            } else {
                duel.handleResponses(duel.turnPlayer.get())
            }
            endOfDamageStep()
        }

        const endOfDamageStep = () => {
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
                    defender.toGraveyard()
                    defender.status.set('')
                }
                if (this.status.get() === 'destroyedByBattle') {
                    this.toGraveyard()
                    this.status.set('')
                }
            }
            duel.battleStep.set('BATTLE')
            duel.attackingCard.set(undefined)
            duel.defendingCard.set(undefined)
        }
        startOfDamageStep()
    }

    tribute() {
        this.toGraveyard()
    }

    destroy(cause: string) {
        this.status.set(`destroyedBy${cause}`)
        if (!includes(cause, 'Battle')) {
            this.toGraveyard()
        }
    }

    checkEffectConditions() {
        if (cardEffects[this.name.get()] === undefined) return false
        const effects = cardEffects[this.name.get()](this)
        return effects.some(({ condition }) => {
            if (!condition) return false
            return condition() === true
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
            const { location: locationCondition, effect, action: customAction, trigger, cost, target } = effects[0]
            const directActivationFromHand = locationCondition?.includes('Hand')
            if(trigger !== undefined) {        
                if(duel.chainResolving.get()) {
                    duel.addPendingEffect({
                        card: this,
                        effect: effects[0],
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
                        player: this.getController()
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
                        player: this.getController()
                    })
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
                        player: this.getController()
                    })
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
                    player: this.getController()
                })
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
                    player: this.getController()
                })
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

    getTriggerEffect(triggerType: string) {
        if (cardEffects[this.name.get()] === undefined) return
        const effects = cardEffects[this.name.get()](this)
        return effects.find(({ trigger }) => trigger === triggerType);
    }
}
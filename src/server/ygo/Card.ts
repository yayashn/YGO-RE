import { ServerScriptService, ServerStorage } from "@rbxts/services"
import cardEffects from "server-storage/card-effects"
import { addCardFloodgate, addCardFloodgateAsync, removeCardFloodgate } from "server/functions/floodgates"
import { PlayerValue, CardFolder, ControllerValue, LocationValue, PositionValue, MZone, SZone, Zone, Position } from "server/types"
import changedOnce from "shared/lib/changedOnce"
import { createInstance, includes, instance } from "shared/utils"
import { Location } from "shared/types"
import { getEmptyFieldZones, getFilteredCards } from "./utils"
import { YEvent } from "./Event"
import { YPlayer } from "./Player"

const replicatedStorage = game.GetService('ReplicatedStorage')
const cards = replicatedStorage.WaitForChild('cards') as Folder
const httpService = game.GetService('HttpService')
const attackCard3D = replicatedStorage.FindFirstChild("remotes")!.FindFirstChild("attackCard3D.re") as RemoteEvent

export class Card {
    name: string
    owner: YPlayer
    order: YEvent<number>
    extra: boolean
    uid = httpService.GenerateGUID(false)
    art = ""
    controller: YEvent<YPlayer>
    location: YEvent<Zone>
    position = new YEvent<Position>('FaceDown')
    status = new YEvent<string>('')
    effectsNegated = new YEvent<boolean>(false)
    activated = new YEvent<boolean>(false)
    canActivate = new YEvent<boolean>(true)
    attackNegated = new YEvent<boolean>(false)
    targets = new YEvent<Card[]>([])
    preventDestruction = new YEvent<boolean>(false)
    continuous = new YEvent<boolean>(false)
    chainLink = new YEvent<number>(0)
    "type": YEvent<string>;
    race = new YEvent<string>('');
    atk = new YEvent<number>(0);
    def = new YEvent<number>(0);
    level = new YEvent<number>(0);
    cardButton = createInstance('ObjectValue', 'cardButton', ServerStorage)

    constructor(name: string, owner: YPlayer, order: number, extra?: boolean) {
        this.name = name
        this.owner = owner
        this.order = new YEvent<number>(order)
        this.extra = extra || false
        this.controller = new YEvent<YPlayer>(this.owner)
        this.location = new YEvent<Zone>(this.extra ? 'EZone' : 'Deck')
    }

    duel() {
        return this.controller.get().getDuel()
    }

    Summon(location: MZone) {
        this.location.set(location)
    }

    NormalSummon(location: MZone) {
        this.position.set('FaceUpAttack')
        this.controller.get().canNormalSummon.set(false)
        this.Summon(location)
        wait(1)
        this.controller.get().action.set({
            action: "Normal Summon",
            summonedCards: [this]
        })
        addCardFloodgateAsync(this, {
            floodgateUid: `disableChangePositionAfterPlacement-${this.uid}`,
            floodgateName: "disableChangePosition",
            floodgateCause: "Mechanic",
            floodgateFilter: {
                uid: [this.uid]
            }
        })
    }

    SpecialSummon(location: MZone, newPosition: Position) {
        this.position.set(newPosition)
        this.controller.get().canNormalSummon.set(false)
        this.Summon(location)
        wait(1)
        this.controller.get().action.set({
            action: "Special Summon",
            summonedCards: [this]
        })
        addCardFloodgate(this, {
            floodgateUid: `disableChangePositionAfterPlacement-${this.uid}`,
            floodgateName: "disableChangePosition",
            floodgateCause: "Mechanic",
            floodgateFilter: {
                uid: [this.uid]
            }
        })
    }

    Set(location: SZone | MZone | "FZone") {
        if (this.type.get().match('Monster').size() > 0) {
            this.position.set('FaceDownDefense')
            this.controller.get().canNormalSummon.set(false)
            this.location.set(location)
            wait(1)
            this.controller.get().action.set({
                action: "Set Monster",
                summonedCards: [this]
            })
            addCardFloodgate(this, {
                floodgateUid: `disableChangePositionAfterPlacement-${this.uid}`,
                floodgateName: "disableChangePosition",
                floodgateCause: "Mechanic",
                floodgateFilter: {
                    uid: [this.uid]
                }
            })
        } else {
            this.position.set('FaceDown')
            if(this["type"].get().match("Trap").size() > 0 || this["type"].get().match("Quick").size() > 0) {
                this.canActivate.set(false);
            }
            this.location.set(location)
            wait(1)
            this.controller.get().action.set({
                action: "Set",
                summonedCards: [this]
            })
        }
    }

    ToGraveyard() {
        removeCardFloodgate(this, `disableAttackAfterAttack-${this.uid}`)
        this.controller.set(this.owner)
        this.position.set('FaceUp')
        this.location.set('GZone')
    }

    ToHand() {
        this.controller.set(this.owner)
        this.position.set("FaceDown")
        if(includes(this["type"].get(), "Fusion")) {
            this.location.set('EZone')
        } else {
            this.location.set('Hand')
        }
    }

    Reveal() {
        const oldPosition = this.position.get()
        this.position.set('FaceUp')
        wait(3)
        this.position.set(oldPosition)   
    }

    Banish(newPosition: Position) {
        removeCardFloodgate(this, `disableAttackAfterAttack-${this.uid}`)
        this.controller.set(this.owner)
        this.position.set(newPosition)
        this.location.set('BZone')
    }

    Tribute() {
        this.ToGraveyard()
    }

    Destroy(cause: string) {
        if(this.preventDestruction.get() === true) return;
        this.status.set(`destroyedBy${cause}`)
        if(!includes(cause, "Battle")) {
            this.ToGraveyard()
        }
    }

    TributeSummon(location: MZone) {
        this.position.set('FaceUpAttack')
        this.controller.get().canNormalSummon.set(false)
        addCardFloodgate(this, {
            floodgateUid: `disableChangePositionAfterPlacement-${this.uid}`,
            floodgateName: "disableChangePosition",
            floodgateCause: "Mechanic",
            floodgateFilter: {
                uid: [this.uid]
            }
        })
        this.Summon(location)
        wait(1)
        this.controller.get().action.set({
            action: "Tribute Summon",
            summonedCards: [this]
        })
    }

    TributeSet(location: MZone | SZone) {
        this.Set(location)
    }

    ChangePosition(forcePosition?: Position) {
        if(forcePosition) {
            this.position.set(forcePosition)
            return;
        }
        addCardFloodgate(this, {
            floodgateUid: `disableChangePositionAfterPlacement-${this.uid}`,
            floodgateName: "disableChangePosition",
            floodgateCause: "Mechanic",
            floodgateFilter: {
                uid: [this.uid]
            }
        })
        if (this.position.get() === 'FaceUpAttack') {
            this.position.set('FaceUpDefense')
        } else {
            this.position.set('FaceUpAttack')
        }
    }

    Flip(inBattle?: boolean) {
        this.position.set('FaceUpDefense')
        if(!inBattle && includes(this["type"].get(), "Flip")) {
            const cost = this.getCost()
            if(cost) {
                cost()
            }
            const target = this.getTarget()
            if(target) {
                target()
            }
            this.activateEffect()
        }
    }

    FlipSummon() {
        addCardFloodgate(this, {
            floodgateUid: `disableChangePositionAfterPlacement-${this.uid}`,
            floodgateName: "disableChangePosition",
            floodgateCause: "Mechanic",
            floodgateFilter: {
                uid: [this.uid]
            }
        })
        this.position.set('FaceUpAttack')
        if(includes(this['type'].get(), "Flip")) {
            const cost = this.getCost()
            if(cost) {
                cost()
            }
            const target = this.getTarget()
            if(target) {
                target()
            }
            this.activateEffect()
        } else {
            this.controller.get().action.set({
                action: "Flip Summon",
                summonedCards: [this]
            })
        }   
    }

    getCost() {
        if(cardEffects[this.name] === undefined) return false
        const effects = cardEffects[this.name](this)
        if(effects.size() === 1) {
            return effects[0].cost
        }
        return false;
    }

    getTarget() {
        if(cardEffects[this.name] === undefined) return false
        const effects = cardEffects[this.name](this)
        if(effects.size() === 1) {
            return effects[0].target
        }
        return false;
    }

    checkEffectConditions() {
        if(cardEffects[this.name] === undefined) return false
        const effects = cardEffects[this.name](this)
        return effects.some(({condition}) => {
            if(!condition) return false;
            return condition() === true
        })
    }

    async activateEffect() {
        const effects = cardEffects[this.name](this)
        const ifMoreThanOneEffect = effects.map(({condition}) => {
            return condition ? condition() : false;
        }).size() > 1

        if(ifMoreThanOneEffect) {
            // show effect selection menu
        } else {
            const { location: locationCondition, effect } = effects[0]
            const directActivationFromHand = locationCondition?.includes("Hand")
            if(this["type"].get() === "Spell Card") {
                if(this.location.get() === "Hand" && !directActivationFromHand) {
                    if(includes(this.race.get(), "Field")) {
                        //check if there's already a field spell on the field
                        const fieldSpells = getFilteredCards(this.duel(), {
                            location: ["FZone"]
                        })
                        fieldSpells.forEach((fieldSpell) => fieldSpell.Destroy("Mechanic"))
                        this.location.set("FZone")
                        this.position.set('FaceUp')
                    } else {
                        this.controller.get().selectableZones.set(getEmptyFieldZones('SZone', this.controller.get(), "Player"))
                        const zone = this.controller.get().selectedZone.changedOnce()
                        this.location.set(zone as Zone)
                        this.position.set('FaceUp')
                        this.controller.get().selectedZone.set('')
                        this.controller.get().selectableZones.set([])
                    }
                } else if(this.location.get().match("SZone").size() > 0 || this.location.get().match("MZone").size() > 0 || this.location.get().match("FZone").size() > 0) {
                    this.position.set('FaceUp')
                }
                wait(1)
                this.controller.get().action.set({
                    action: "Activate Effect Spell",
                    summonedCards: [this]
                })
                this.duel().addToChain.get()(this, effect!)
            } else if(this['type'].get() === "Trap Card") {
                this.position.set('FaceUp')
                wait(1)
                this.controller.get().action.set({
                    action: "Activate Effect Trap",
                    summonedCards: [this]
                })
                this.duel().addToChain.get()(this, effect!)
            } else if(includes(this['type'].get(), "Monster")) {
                wait(1)
                this.controller.get().action.set({
                    action: "Activate Effect Monster Flip",
                    summonedCards: [this]
                })
                this.duel().addToChain.get()(this, effect!)
            }
        }
        this.activated.set(true)
    }

    Attack(defender: Card & PlayerValue) {
        print(7)
        const isDirectAttack = ['player1', 'player2'].includes(defender.Name)
        const defenderLocation = isDirectAttack ? '' : defender.location.get()
        const defenderAtk = isDirectAttack ? 0 : defender.Value

        let defenderIsFlip = false;

        const startOfDamageStep = () => {
            print(8)
            this.duel().battleStep.set('DAMAGE');
            this.duel().damageStep.set('START');

            attackCard3D.FireClient(this.controller.get().player, false, this.location.get(), isDirectAttack ? undefined : defender.location.get())
            attackCard3D.FireClient(this.duel().opponent(this.controller.get()).player, true, this.location.get(), isDirectAttack ? undefined : defender.location.get())
            
            this.duel().handleResponses(this.duel().turnPlayer.get())
            //during damage step only effects
            //start of damage step effects
            //ATK/DEF change effects
            //check if players finished effects
            beforeDamageCalculation()
        }
        
        const beforeDamageCalculation = () => {
            print(9)
            this.duel().damageStep.set('BEFORE')
            if (!isDirectAttack && defender.position.get() === 'FaceDownDefense') {
                defender.Flip(true)
                if(includes(defender.type.get(), "Flip")) {
                    defenderIsFlip = true;
                }
                wait(1)
            }
            this.duel().handleResponses(this.duel().turnPlayer.get())
            //ATK/DEF change effects
            //before damage calculation effects
            //check if players finished effects
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
            print(10)
            this.duel().damageStep.set('DURING');
            //during damage calculation only effects immediately
            //during damage calculation effects
            this.duel().handleResponses(this.duel().turnPlayer.get())
            if (isDirectAttack) {
                defender.updateLP.Fire(-this.atk.get())
            } else {
                if (defender.position.get() === 'FaceUpAttack') {
                    if (this.atk.get() > (defenderAtk as number)) {
                        defender.Destroy('Battle')
                        const calculation = this.atk.get() - (defenderAtk as number)
                        defender.controller.get().updateLP(-calculation)
                    } else if (this.atk.get() < (defenderAtk as number)) {
                        this.Destroy('Battle')
                        const calculation = (defenderAtk as number) - this.atk.get()
                        this.controller.get().updateLP(-calculation)
                    } else if (this.atk.get() === (defenderAtk as number) && this.atk.get() !== 0) {
                        defender.Destroy('Battle')
                        this.Destroy('Battle')
                    }
                } else {
                    if (this.atk.get() > defender.def.get()) {
                        defender.Destroy('Battle')
                    } else if (this.atk.get() < defender.def.get()) {
                        const calculation = defender.def.get() - this.atk.get()
                        this.controller.get().updateLP(-calculation)
                    }
                }
            }
            afterDamageCalculation()
        }

        const afterDamageCalculation = () => {
            print(11)
            print('after damage calculation')
            this.duel().damageStep.set('AFTER'
)            //self destruction continuous effects immediately
            //after damage calculation effects
            //battle damage effects
            //flip effects
            this.duel().handleResponses(this.duel().turnPlayer.get())
            if(defenderIsFlip) {
                const cost = defender.getCost()
                if(cost) {
                    cost()
                }
                const target = defender.getTarget()
                if(target) {
                    target()
                }
                defender.activateEffect()
            } else {
                this.duel().handleResponses(this.duel().turnPlayer.get())
            }
            endOfDamageStep()
        }

        const endOfDamageStep = () => {
            print('end of damage step')
            this.duel().damageStep.set('END');
            if (!isDirectAttack) {
                if (defender.status.get() === 'destroyedByBattle') {
                    defender.ToGraveyard()
                    defender.status.set('')
                }
                if (this.status.get() === 'destroyedByBattle') {
                    this.ToGraveyard()
                    this.status.set('')
                }
            }
            this.duel().battleStep.set('BATTLE')
            this.duel().attackingCard.set(undefined)
            this.duel().defendingCard.set(undefined)
        }
        startOfDamageStep()
    }
}
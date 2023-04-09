import { ServerScriptService } from "@rbxts/services"
import cardEffects from "server-storage/card-effects"
import { addCardFloodgate, removeCardFloodgate } from "server/functions/floodgates"
import { PlayerValue, DuelFolder, CardFolder, ControllerValue, LocationValue, PositionValue, MZone, SZone, Zone, Position } from "server/types"
import { getEmptyFieldZones, getFilteredCards, setAction } from "server/utils"
import changedOnce from "shared/lib/changedOnce"
import { createInstance, includes, instance } from "shared/utils"

const duels = ServerScriptService.FindFirstChild('instances')!.FindFirstChild('duels') as Folder
const replicatedStorage = game.GetService('ReplicatedStorage')
const cards = replicatedStorage.WaitForChild('cards') as Folder
const httpService = game.GetService('HttpService')

export const Card = (_name: string, _owner: PlayerValue, _order: number, extra?: boolean) => {
    const duel = _owner.FindFirstAncestorWhichIsA('Folder') as DuelFolder

    const cardDataFolder = cards.FindFirstChild(_name, true)
    const card = cardDataFolder!.Clone() as CardFolder
    card.art.Image = 'rbxassetid://3955072236'
    card.Name = _name
    card.Parent = _owner.cards
    const uid = instance('StringValue', 'uid', card) as StringValue
    const controller = instance('ObjectValue', 'controller', card) as ControllerValue
    const location = instance('StringValue', 'location', card) as LocationValue
    const order = instance('IntValue', 'order', card) as IntValue
    const position = instance('StringValue', 'position', card) as PositionValue
    instance('ObjectValue', 'cardButton', card) as ObjectValue
    instance('BoolValue', 'targettable', card) as BoolValue
    const status = instance('StringValue', 'status', card) as StringValue
    //const canAttack = instance('BoolValue', 'canAttack', card) as BoolValue
    const effectsNegated = instance('BoolValue', 'effectsNegated', card) as BoolValue
    const activated = instance('BoolValue', 'activated', card) as BoolValue
    const canActivate = createInstance('BoolValue', 'canActivate', card)
    const attackNegated = createInstance('BoolValue', 'attackNegated', card)
    const targets = createInstance('StringValue', 'targets', card)
    const preventDestruction = createInstance('BoolValue', 'preventDestruction', card)
    const continuous = createInstance('BoolValue', 'continuous', card)
    const chainLink = createInstance('IntValue', 'chainLink', card)

    order.Value = _order
    controller.Value = _owner
    location.Value = extra ? "EZone" : 'Deck'
    position.Value = 'FaceDown'
    uid.Value = httpService.GenerateGUID(false)
    canActivate.Value = true

    const Summon = (_location: MZone) => {
        location.Value = _location
    }

    const NormalSummon = (_location: MZone) => {
        setAction(controller.Value, {
            action: "Normal Summon",
            summonedCards: [card]
        })
        position.Value = 'FaceUpAttack'
        controller.Value.canNormalSummon.Value = false
        addCardFloodgate(card, {
            floodgateUid: `disableChangePositionAfterPlacement-${card.uid.Value}`,
            floodgateName: "disableChangePosition",
            floodgateCause: "Mechanic",
            floodgateFilter: {
                uid: [card.uid.Value]
            }
        })
        Summon(_location)
    }
    ;(instance('BindableEvent', 'normalSummon', card) as BindableEvent).Event.Connect(NormalSummon)

    const SpecialSummon = (_location: MZone, newPosition: Position) => {
        position.Value = newPosition
        controller.Value.canNormalSummon.Value = false
        addCardFloodgate(card, {
            floodgateUid: `disableChangePositionAfterPlacement-${card.uid.Value}`,
            floodgateName: "disableChangePosition",
            floodgateCause: "Mechanic",
            floodgateFilter: {
                uid: [card.uid.Value]
            }
        })
        Summon(_location)
    }
    createInstance('BindableEvent', 'specialSummon', card).Event.Connect(SpecialSummon)

    const Set = (_location: SZone | MZone) => {
        if (card.type.Value.match('Monster').size() > 0) {
            setAction(controller.Value, {
                action: "Set Monster",
                summonedCards: [card]
            })
            position.Value = 'FaceDownDefense'
            controller.Value.canNormalSummon.Value = false
            addCardFloodgate(card, {
                floodgateUid: `disableChangePositionAfterPlacement-${card.uid.Value}`,
                floodgateName: "disableChangePosition",
                floodgateCause: "Mechanic",
                floodgateFilter: {
                    uid: [card.uid.Value]
                }
            })
        } else {
            setAction(controller.Value, {
                action: "Set",
                summonedCards: [card]
            })
            position.Value = 'FaceDown'
            if(card["type"].Value.match("Trap").size() > 0 || card["type"].Value.match("Quick").size() > 0) {
                canActivate.Value = false;
            }
        }
        location.Value = _location
    }
    ;(instance('BindableEvent', 'set', card) as BindableEvent).Event.Connect(Set)

    const toGraveyard = () => {
        controller.Value = _owner
        position.Value = 'FaceUp'
        location.Value = 'GZone'
        removeCardFloodgate(card, `disableAttackAfterAttack-${uid.Value}`)
    }
    ;(instance('BindableEvent', 'toGraveyard', card) as BindableEvent).Event.Connect(toGraveyard)

    const toHand = () => {
        controller.Value = _owner
        position.Value = "FaceDown"
        if(includes(card.type.Value, "Fusion")) {
            location.Value = 'EZone'
        } else {
            location.Value = 'Hand'
        }
    }
    createInstance('BindableEvent', 'toHand', card).Event.Connect(toHand)

    const reveal = () => {
        const oldPosition = position.Value
        position.Value = 'FaceUp'
        wait(3)
        position.Value = oldPosition
    }
    createInstance('BindableFunction', 'reveal', card).OnInvoke = reveal

    const banish = (newPosition: Position) => {
        controller.Value = _owner
        position.Value = newPosition
        location.Value = 'BZone'
        removeCardFloodgate(card, `disableAttackAfterAttack-${uid.Value}`)
    }
    createInstance('BindableEvent', 'banish', card).Event.Connect(banish)

    const tribute = () => {
        toGraveyard()
    }
    ;(instance('BindableEvent', 'tribute', card) as BindableEvent).Event.Connect(tribute)

    const destroy = (cause: string) => {
        if(preventDestruction.Value === true) return;
        status.Value = `destroyedBy${cause}`
        if(!includes(cause, "Battle")) {
            toGraveyard()
        }
        print(card, `destroyed by ${cause}`)
    }
    ;(instance('BindableEvent', 'destroy_', card) as BindableEvent).Event.Connect((cause) =>
        destroy(cause)
    )

    const tributeSummon = (_location: MZone) => {
        setAction(controller.Value, {
            action: "Tribute Summon",
            summonedCards: [card]
        })
        position.Value = 'FaceUpAttack'
        controller.Value.canNormalSummon.Value = false
        addCardFloodgate(card, {
            floodgateUid: `disableChangePositionAfterPlacement-${card.uid.Value}`,
            floodgateName: "disableChangePosition",
            floodgateCause: "Mechanic",
            floodgateFilter: {
                uid: [card.uid.Value]
            }
        })
        Summon(_location)
    }
    ;(instance('BindableEvent', 'tributeSummon', card) as BindableEvent).Event.Connect(
        tributeSummon
    )

    const tributeSet = (_location: MZone) => {
        Set(_location)
    }
    ;(instance('BindableEvent', 'tributeSet', card) as BindableEvent).Event.Connect(
        tributeSet
    )

    const changePosition = (forcePosition?: Position) => {
        if(forcePosition) {
            position.Value = forcePosition
            return;
        }
        addCardFloodgate(card, {
            floodgateUid: `disableChangePositionAfterPlacement-${card.uid.Value}`,
            floodgateName: "disableChangePosition",
            floodgateCause: "Mechanic",
            floodgateFilter: {
                uid: [card.uid.Value]
            }
        })
        if (position.Value === 'FaceUpAttack') {
            position.Value = 'FaceUpDefense'
        } else {
            position.Value = 'FaceUpAttack'
        }
    }
    ;(instance('BindableEvent', 'changePosition', card) as BindableEvent).Event.Connect(
        changePosition
    )

    const flip = (inBattle?: boolean) => {
        position.Value = 'FaceUpDefense'
        if(!inBattle && includes(card.type.Value, "Flip")) {
            const cost = getCost()
            if(cost) {
                cost()
            }
            const target = getTarget()
            if(target) {
                target()
            }
            activateEffect()
        }
    }
    ;(instance('BindableEvent', 'flip', card) as BindableEvent).Event.Connect(flip)

    const flipSummon = () => {
        addCardFloodgate(card, {
            floodgateUid: `disableChangePositionAfterPlacement-${card.uid.Value}`,
            floodgateName: "disableChangePosition",
            floodgateCause: "Mechanic",
            floodgateFilter: {
                uid: [card.uid.Value]
            }
        })
        position.Value = 'FaceUpAttack'
        if(includes(card.type.Value, "Flip")) {
            const cost = getCost()
            if(cost) {
                cost()
            }
            const target = getTarget()
            if(target) {
                target()
            }
            activateEffect()
        } else {
            setAction(controller.Value, {
                action: "Flip Summon",
                summonedCards: [card]
            })
        }
    }
    ;(instance('BindableEvent', 'flipSummon', card) as BindableEvent).Event.Connect(flipSummon)

    const getCost = () => {
        if(cardEffects[card.Name] === undefined) return false
        const effects = cardEffects[card.Name](card)
        if(effects.size() === 1) {
            return effects[0].cost
        }
        return false;
    }
    createInstance('BindableFunction', 'getCost', card).OnInvoke = getCost
    
    const getTarget = () => {
        if(cardEffects[card.Name] === undefined) return false
        const effects = cardEffects[card.Name](card)
        if(effects.size() === 1) {
            return effects[0].target
        }
        return false;
    }
    createInstance('BindableFunction', 'getTarget', card).OnInvoke = getTarget

    const checkEffectConditions = () => {
        if(cardEffects[card.Name] === undefined) return false
        const effects = cardEffects[card.Name](card)
        return effects.some(({condition}) => {
            if(!condition) return false;
            return condition() === true
        })
    }
    ;(instance('BindableFunction', 'checkEffectConditions', card) as BindableFunction).OnInvoke = checkEffectConditions

    const activateEffect = async () => {
        const effects = cardEffects[card.Name](card)
        const ifMoreThanOneEffect = effects.map(({condition}) => {
            return condition ? condition() : false;
        }).size() > 1

        if(ifMoreThanOneEffect) {
            // show effect selection menu
        } else {
            const { location: locationCondition, effect } = effects[0]
            const directActivationFromHand = locationCondition?.includes("Hand")
            if(card.type.Value === "Spell Card") {
                if(location.Value === "Hand" && !directActivationFromHand) {
                    if(includes(card.race.Value, "Field")) {
                        location.Value = "FZone"
                        position.Value = 'FaceUp'
                    } else {
                        controller.Value.selectableZones.Value = getEmptyFieldZones('SZone', controller.Value, "Player")
                        const zone = await changedOnce(controller.Value.selectedZone.Changed)
                        location.Value = zone as Zone
                        position.Value = 'FaceUp'
                        controller.Value.selectedZone.Value = ''
                        controller.Value.selectableZones.Value = '[]'
                    }
                } else if(location.Value.match("SZone").size() > 0 || location.Value.match("MZone").size() > 0 || location.Value.match("FZone").size() > 0) {
                    position.Value = 'FaceUp'
                }
                setAction(card.controller.Value, {
                    action: "Activate Effect Spell",
                    summonedCards: [card]
                })
                duel.addToChain.Fire(card, effect!)
            } else if(card.type.Value === "Trap Card") {
                position.Value = 'FaceUp'
                setAction(card.controller.Value, {
                    action: "Activate Effect Trap",
                    summonedCards: [card]
                })
                duel.addToChain.Fire(card, effect!)
            } else if(includes(card.type.Value, "Monster")) {
                setAction(card.controller.Value, {
                    action: "Activate Effect Monster Flip",
                    summonedCards: [card]
                })
                duel.addToChain.Fire(card, effect!)
            }
        }
        activated.Value = true
    }
    ;(instance('BindableFunction', 'activateEffect', card) as BindableFunction).OnInvoke = activateEffect

    const attack = (defender: CardFolder & PlayerValue) => {
        const isDirectAttack = ['player1', 'player2'].includes(defender.Name)
        const defenderLocation = isDirectAttack ? '' : defender.location.Value
        const defenderAtk = isDirectAttack ? 0 : defender.atk.Value

        let defenderIsFlip = false;

        const startOfDamageStep = () => {
            addCardFloodgate(card, {
                floodgateUid: `disableChangePositionAfterAttack-${card.uid.Value}`,
                floodgateName: "disableChangePosition",
                floodgateCause: "Mechanic",
                floodgateFilter: {
                    uid: [card.uid.Value]
                }
            })
            duel.battleStep.Value = 'DAMAGE'
            duel.damageStep.Value = 'START'
            duel.handleResponses.Invoke(duel.turnPlayer.Value)
            //during damage step only effects
            //start of damage step effects
            //ATK/DEF change effects
            //check if players finished effects
            beforeDamageCalculation()
        }
        
        const beforeDamageCalculation = () => {
            duel.damageStep.Value = 'BEFORE'
            if (!isDirectAttack && defender.position.Value === 'FaceDownDefense') {
                defender.flip.Fire(true)
                if(includes(defender.type.Value, "Flip")) {
                    defenderIsFlip = true;
                }
                wait(1)
            }
            duel.handleResponses.Invoke(duel.turnPlayer.Value)
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
            duel.damageStep.Value = 'DURING'
            //during damage calculation only effects immediately
            //during damage calculation effects
            duel.handleResponses.Invoke(duel.turnPlayer.Value)
            if (isDirectAttack) {
                defender.updateLP.Fire(-card.atk.Value)
            } else {
                if (defender.position.Value === 'FaceUpAttack') {
                    if (card.atk.Value > defenderAtk) {
                        defender.destroy_.Fire('Battle')
                        const calculation = card.atk.Value - defenderAtk
                        defender.controller.Value.updateLP.Fire(-calculation)
                    } else if (card.atk.Value < defenderAtk) {
                        destroy('Battle')
                        const calculation = defenderAtk - card.atk.Value
                        controller.Value.updateLP.Fire(-calculation)
                    } else if (card.atk.Value === defenderAtk && card.atk.Value !== 0) {
                        defender.destroy_.Fire('Battle')
                        destroy('Battle')
                    }
                } else {
                    if (card.atk.Value > defender.def.Value) {
                        defender.destroy_.Fire('Battle')
                    } else if (card.atk.Value < defender.def.Value) {
                        const calculation = defender.def.Value - card.atk.Value
                        controller.Value.updateLP.Fire(-calculation)
                    }
                }
            }
            afterDamageCalculation()
        }

        const afterDamageCalculation = () => {
            print('after damage calculation')
            duel.damageStep.Value = 'AFTER'
            //self destruction continuous effects immediately
            //after damage calculation effects
            //battle damage effects
            //flip effects
            if(defenderIsFlip) {
                const cost = defender.getCost.Invoke()
                if(cost) {
                    cost()
                }
                const target = defender.getTarget.Invoke()
                if(target) {
                    target()
                }
                defender.activateEffect.Invoke()
            } else {
                duel.handleResponses.Invoke(duel.turnPlayer.Value)
            }
            endOfDamageStep()
        }

        const endOfDamageStep = () => {
            print('end of damage step')
            duel.damageStep.Value = 'END'
            if (!isDirectAttack) {
                if (defender.status.Value === 'destroyedByBattle') {
                    defender.toGraveyard.Fire()
                    defender.status.Value = ''
                }
                if (status.Value === 'destroyedByBattle') {
                    toGraveyard()
                    status.Value = ''
                }
            }
            duel.battleStep.Value = 'BATTLE'
        }
        startOfDamageStep()
    }
    ;(instance('BindableEvent', 'attack', card) as BindableEvent).Event.Connect(attack)
}

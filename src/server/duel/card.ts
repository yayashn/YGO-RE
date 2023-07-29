import { HttpService } from "@rbxts/services";
import getCardData, { includes } from "shared/utils";
import { FloodgateValueAtkDefModifier, Location, Position } from "./types";
import { Subscribable } from "shared/Subscribable";
import cardEffects from "server-storage/card-effects/index";
import { getFilteredCards } from "./utils";
import { getDuel } from "./duel";
import { Dictionary as Object } from "@rbxts/sift";
import Remotes from "shared/net";
import debounce from "shared/debounce";

export class Card {
    changed = new Subscribable(0);
    uid: string;
    name: Subscribable<string>;
    atk = new Subscribable<number | undefined>(undefined, () => this.onChanged());
    def = new Subscribable<number | undefined>(undefined, () => this.onChanged());
    originalData: Subscribable<Record<string, unknown>>;
    race: Subscribable<string>;
    desc: Subscribable<string>;
    level = new Subscribable<number | undefined>(undefined, () => this.onChanged());
    art: string;
    owner: Player;
    controller: Subscribable<Player>;
    position: Subscribable<Position>;
    location: Subscribable<Location>;
    order: Subscribable<number>;
    "type": Subscribable<string>;
    chainLink = new Subscribable<number>(0, () => this.onChanged());
    targets = new Subscribable<Card[]>([], () => this.onChanged());
    activated = new Subscribable(false, () => this.onChanged());
    attackNegated = new Subscribable(false, () => this.onChanged());
    status = new Subscribable<string>("", () => this.onChanged());
    attribute: Subscribable<string>;
    atkModifier = new Subscribable<Record<string, number>>({});
    defModifier = new Subscribable<Record<string, number>>({});

    constructor(name: string, owner: Player, order: number) {
        const cardData = getCardData(name)!;
        this.originalData = new Subscribable(cardData, () => this.onChanged());
        this.uid = HttpService.GenerateGUID(false);
        this.name = new Subscribable(name, () => this.onChanged());
        this.race = new Subscribable(cardData.race, () => this.onChanged());
        this.desc = new Subscribable(cardData.desc, () => this.onChanged());
        this.position = new Subscribable<Position>("FaceDown");
        this.art = cardData.art;
        this.owner = owner;
        this.controller = new Subscribable<Player>(owner, () => this.onChanged());
        this.order = new Subscribable<number>(order, () => this.onChanged());
        this["type"] = new Subscribable<string>(cardData["type"], () => this.onChanged());
        this.attribute = new Subscribable<string>(cardData["attribute"] || cardData.type.split(" ")[0], () => this.onChanged());

        if (cardData["type"].match("Fusion").size() > 0) {
            this.location = new Subscribable<Location>("EZone", () => {
                this.onChanged()
            });
        } else {
            this.location = new Subscribable<Location>("Deck", () => {
                this.onChanged()
            });
        }
        if (cardData["type"].match("Monster").size() > 0) {
            this.atk.set(cardData.atk!);
            this.def.set(cardData.def!);
            this.level.set(cardData.level!);
        }
    }

    onChanged = debounce(() => {
        this.handleFloodgates();
        this.changed.set(this.changed.get() + 1);
    })

    handleFloodgates = debounce(() => {
        if (this.hasFloodgate("FORCE_FACEUP_DEFENSE")) {
            this.position.set("FaceUpDefense");
        }
        if (this.hasFloodgate("MODIFY_ATK")) {
            const modifyAtkFloodgates = this.getFloodgates("MODIFY_ATK")!;

            const modifier: Record<string, number>= {};

            modifyAtkFloodgates.forEach((floodgate) => {
                const modifierData = floodgate.floodgateValue as FloodgateValueAtkDefModifier;
                modifier[modifierData.modifierId] = modifierData.value;
            })
            this.atkModifier.set(modifier);
        } else {
            this.atkModifier.set({});
        }
        if (this.hasFloodgate("MODIFY_DEF")) {
            const modifyDefFloodgates = this.getFloodgates("MODIFY_DEF")!;

            const modifier: Record<string, number>= {};

            modifyDefFloodgates.forEach((floodgate) => {
                const modifierData = floodgate.floodgateValue as FloodgateValueAtkDefModifier;
                modifier[modifierData.modifierId] = modifierData.value;
            })
            this.defModifier.set(modifier);
        } else {
            this.defModifier.set({});
        }
    })

    getAtk() {
        const totalModifier = Object.values(this.atkModifier.get()).reduce((a, b) => a + b, 0);
        if (this.atk.get()! + totalModifier <= 0) {
            return 0;
        } else {
            return this.atk.get()! + totalModifier;
        }
    }

    getDef() {
        const totalModifier = Object.values(this.defModifier.get()).reduce((a, b) => a + b, 0);
        if (this.def.get()! + totalModifier <= 0) {
            return 0;
        } else {
            return this.def.get()! + totalModifier;
        }
    }

    getController() {
        const duel = getDuel(this.owner)!;
        return duel.getPlayer(this.controller.get());
    }

    getFloodgates(floodgateName?: string) {
        const duel = getDuel(this.owner)!;
        const floodgates = duel.cardFloodgates.get();
        const floodgatesFound = floodgates.filter((floodgate) => {
            return Object.entries(floodgate.floodgateFilter).every(([key, values]) => {
                if (key === "type") {
                    return values!.some((value) => this["type"].get().match(value as string).size() > 0)
                }
                if (key === "name" || key === "uid") {
                    return values!.some((value) => this[key] === value)
                }
                if (key === "card") {
                    return (values as Card[]).includes(this)
                }
                return values!.some((value) => this[key].get() === value)
            })
        })
        if (floodgateName) {
            return floodgatesFound.filter((floodgate) => includes(floodgate.floodgateName, floodgateName));
        } else {
            return floodgatesFound;
        }
    }

    hasFloodgate(name: string) {
        return this.getFloodgates(name).size() > 0;
    }

    getFloodgate(name: string) {
        return this.getFloodgates(name)[0];
    }

    normalSummon(location: Location) {
        this.position.set('FaceUpAttack')
        const duel = getDuel(this.owner)!;

        const turn = duel.turn.get();

        duel.addCardFloodgate({
            floodgateName: "CANNOT_CHANGE_POSITION",
            floodgateFilter: {
                card: [this],
            },
            expiry: () => duel.turn.get() !== turn,
        })

        this.location.set(location)
        duel.action.set({
            action: "Normal Summon",
            cards: [this],
            player: this.getController(),
        })
        wait(1)
    }

    tributeSummon(location: Location) {
        const duel = getDuel(this.owner)!;
        this.normalSummon(location)
        wait(1)
        duel.action.set({
            action: "Tribute Summon",
            cards: [this],
            player: this.getController(),
        })
    }

    specialSummon(location: Location, newPosition: Position) {
        const duel = getDuel(this.owner)!;
        const turn = duel.turn.get();
        duel.addCardFloodgate({
            floodgateName: "CANNOT_CHANGE_POSITION",
            floodgateFilter: {
                card: [this],
            },
            expiry: () => duel.turn.get() !== turn,
        })
        this.position.set(newPosition)
        this.location.set(location)
        duel.action.set({
            action: "Special Summon",
            cards: [this],
            player: this.getController(),
        })
    }

    reveal() {
        const oldPosition = this.position.get();
        this.position.set('FaceUp')
        wait(2)
        this.position.set(oldPosition)
    }

    toHand() {
        this.controller.set(this.owner);
        this.position.set('FaceUp');
        if (includes(this.type.get(), "Fusion")) {
            this.location.set('EZone');
        } else {
            this.location.set('Hand');
        }
    }

    banish(position: Position) {
        this.controller.set(this.owner);
        this.position.set(position);
        this.location.set('BZone');
    }

    tributeSet(location: Location) {
        this.set(location);
    }

    changePosition(forcePosition?: Position) {
        const duel = getDuel(this.owner)!;
        const turn = duel.turn.get();

        if (forcePosition) {
            this.position.set(forcePosition)
            return;
        }
        duel.addCardFloodgate({
            floodgateName: "CANNOT_CHANGE_POSITION",
            floodgateFilter: {
                card: [this],
            },
            expiry: () => duel.turn.get() !== turn,
        })
        if (this.position.get() === 'FaceUpAttack') {
            this.position.set('FaceUpDefense')
        } else {
            this.position.set('FaceUpAttack')
        }
    }

    flip(inBattle?: boolean) {
        this.position.set('FaceUpDefense')
        if (!inBattle && includes(this["type"].get(), "Flip")) {
            const cost = this.getCost()
            if (cost) {
                cost()
            }
            const target = this.getTarget()
            if (target) {
                target()
            }
            this.activateEffect()
        }
    }

    flipSummon() {
        const duel = getDuel(this.owner)!;
        const turn = duel.turn.get();

        duel.addCardFloodgate({
            floodgateName: "CANNOT_CHANGE_POSITION",
            floodgateFilter: {
                card: [this],
            },
            expiry: () => duel.turn.get() !== turn,
        })
        this.position.set('FaceUpAttack')
        if (includes(this['type'].get(), "Flip")) {
            const cost = this.getCost()
            if (cost) {
                cost()
            }
            const target = this.getTarget()
            if (target) {
                target()
            }
            this.activateEffect()
        } else {
            duel.action.set({
                action: "Flip Summon",
                cards: [this],
                player: this.getController(),
            })
        }
    }

    set(location: Location) {
        const duel = getDuel(this.owner)!;
        const turn = duel.turn.get();
        if (this.type.get().match('Monster').size() > 0) {
            this.position.set('FaceDownDefense')

            duel.addCardFloodgate({
                floodgateName: "CANNOT_CHANGE_POSITION",
                floodgateFilter: {
                    card: [this],
                },
                expiry: () => duel.turn.get() !== turn,
            })

            this.location.set(location)
            wait(1)
            duel.action.set({
                action: "Set Monster",
                cards: [this],
                player: this.getController(),
            })
        } else {
            this.position.set('FaceDown')
            if (this["type"].get().match("Trap").size() > 0 || this["type"].get().match("Quick").size() > 0) {
                duel.addCardFloodgate({
                    floodgateName: "CANNOT_ACTIVATE",
                    floodgateFilter: {
                        card: [this],
                    },
                    expiry: () => duel.turn.get() !== turn,
                })
            }
            this.location.set(location)
            wait(1)
            duel.action.set({
                action: "Set",
                cards: [this],
                player: this.getController(),
            })
        }
    }

    toGraveyard() {
        this.controller.set(this.owner);
        this.position.set('FaceUp');
        this.location.set("GZone");
    }

    attack(defender?: Card) {
        const duel = getDuel(this.owner)!;
        const isDirectAttack = !defender;
        const defenderLocation = isDirectAttack ? '' : defender.location.get()
        const defenderAtk = isDirectAttack ? 0 : defender.getAtk()

        const opponent = duel.getOpponent(this.controller.get());

        let defenderIsFlip = false;

        const startOfDamageStep = () => {
            duel.battleStep.set('DAMAGE');
            duel.damageStep.set('START');

            Remotes.Server.Get("attackCard3D").SendToPlayer(this.controller.get(), false, this.location.get(), isDirectAttack ? undefined : defender.location.get());
            Remotes.Server.Get("attackCard3D").SendToPlayer(opponent.player, true, this.location.get(), isDirectAttack ? undefined : defender.location.get());

            wait(.5)

            duel.handleResponses(duel.turnPlayer.get())
            //during damage step only effects
            //start of damage step effects
            //ATK/DEF change effects
            //check if players finished effects
            beforeDamageCalculation()
        }

        const beforeDamageCalculation = () => {
            Remotes.Server.Get("attackCard3D").SendToPlayer(this.controller.get(), false, this.location.get(), isDirectAttack ? undefined : defender.location.get(), true);
            Remotes.Server.Get("attackCard3D").SendToPlayer(opponent.player, true, this.location.get(), isDirectAttack ? undefined : defender.location.get(), true);

            duel.damageStep.set('BEFORE')
            if (!isDirectAttack && defender.position.get() === 'FaceDownDefense') {
                defender.flip(true)
                if (includes(defender.type.get(), "Flip")) {
                    defenderIsFlip = true;
                }
                wait(1)
            }
            duel.handleResponses(duel.turnPlayer.get())
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
            duel.damageStep.set('DURING');
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
                    if (this.getAtk() > defender.getAtk()) {
                        defender.destroy('Battle')
                    } else if (this.getAtk()! < defender.getAtk()) {
                        const calculation = defender.getAtk() - this.getAtk()
                        this.getController().changeLifePoints(-calculation)
                    }
                }
            }
            afterDamageCalculation()
        }

        const afterDamageCalculation = () => {
            duel.damageStep.set('AFTER'
            )
            //self destruction continuous effects immediately
            //after damage calculation effects
            //battle damage effects
            //flip effects
            duel.handleResponses(duel.turnPlayer.get())
            if (defenderIsFlip) {
                const cost = defender!.getCost()
                if (cost) {
                    cost()
                }
                const target = defender!.getTarget()
                if (target) {
                    target()
                }
                defender!.activateEffect()
            } else {
                duel.handleResponses(duel.turnPlayer.get())
            }
            endOfDamageStep()
        }

        const endOfDamageStep = () => {
            duel.damageStep.set('END');
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
        if (!includes(cause, "Battle")) {
            this.toGraveyard()
        }
    }

    checkEffectConditions() {
        if (cardEffects[this.name.get()] === undefined) return false
        const effects = cardEffects[this.name.get()](this)
        return effects.some(({ condition }) => {
            if (!condition) return false;
            return condition() === true
        })
    }

    async activateEffect() {
        const duel = getDuel(this.owner)!;
        const effects = cardEffects[this.name.get()](this)
        const ifMoreThanOneEffect = effects.map(({ condition }) => {
            return condition ? condition() : false;
        }).size() > 1

        if (ifMoreThanOneEffect) {
            // show effect selection menu
        } else {
            const { location: locationCondition, effect } = effects[0]
            const directActivationFromHand = locationCondition?.includes("Hand")

            if (this["type"].get() === "Spell Card") {
                if (this.location.get() === "Hand" && !directActivationFromHand) {
                    if (includes(this.race.get(), "Field")) {
                        //check if there's already a field spell on the field
                        const fieldSpells = getFilteredCards(duel, {
                            location: ["FZone"]
                        })
                        fieldSpells.forEach((fieldSpell) => fieldSpell.destroy("Mechanic"))
                        this.location.set("FZone")
                        this.position.set('FaceUp')
                    } else {
                        this.getController().selectableZones.set(duel.getEmptyFieldZones('SZone', this.getController().player, "Player"))
                        const zone = this.getController().selectedZone.wait()!
                        this.location.set(zone)
                        this.position.set('FaceUp')
                        this.getController().selectedZone.set(undefined)
                        this.getController().selectableZones.set([])
                    }
                } else if (this.location.get().match("SZone").size() > 0 || this.location.get().match("MZone").size() > 0 || this.location.get().match("FZone").size() > 0) {
                    this.position.set('FaceUp')
                }
                wait(1)
                duel.action.set({
                    action: "Activate Effect Spell",
                    cards: [this],
                    player: this.getController()
                })
                duel.addToChain(this, effect!)
            } else if (this['type'].get() === "Trap Card") {
                this.position.set('FaceUp')
                wait(1)
                duel.action.set({
                    action: "Activate Effect Trap",
                    cards: [this],
                    player: this.getController()
                })
                duel.addToChain(this, effect!)
            } else if (includes(this['type'].get(), "Monster")) {
                wait(1)
                duel.action.set({
                    action: "Activate Effect Monster Flip",
                    cards: [this],
                    player: this.getController()
                })
                duel.addToChain(this, effect!)
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
        return false;
    }

    getTarget() {
        if (cardEffects[this.name.get()] === undefined) return false
        const effects = cardEffects[this.name.get()](this)
        if (effects.size() === 1) {
            return effects[0].target
        }
        return false;
    }
}
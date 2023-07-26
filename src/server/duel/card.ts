import { HttpService } from "@rbxts/services";
import getCardData, { includes } from "shared/utils";
import { Location, Position, SelectableZone } from "./types";
import { Subscribable } from "shared/Subscribable";
import cardEffects from "server-storage/card-effects";
import { getFilteredCards } from "./utils";
import { getDuel } from "./duel";
import { Floodgate } from "./floodgate";

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
    floodgates: Subscribable<Floodgate[]> = new Subscribable([]);
    chainLink = new Subscribable<number>(0, () => this.onChanged());
    targets = new Subscribable<Card[]>([], () => this.onChanged());
    activated = new Subscribable(false, () => this.onChanged());
    attackNegated = new Subscribable(false, () => this.onChanged());

    constructor(name: string, owner: Player, order: number) {
        const cardData = getCardData(name)!;
        this.originalData = new Subscribable(cardData, () => this.onChanged());
        this.uid = HttpService.GenerateGUID(false);
        this.name = new Subscribable(name, () => this.onChanged());
        this.race = new Subscribable(cardData.race, () => this.onChanged());
        this.desc = new Subscribable(cardData.desc, () => this.onChanged());
        this.position = new Subscribable<Position>("FaceDown", () => this.onChanged());
        this.art = cardData.art;
        this.owner = owner;
        this.controller = new Subscribable<Player>(owner, () => this.onChanged());
        this.order = new Subscribable<number>(order, () => this.onChanged());
        this["type"] = new Subscribable<string>(cardData["type"], () => this.onChanged());

        if (cardData["type"].match("Fusion").size() > 0) {
            this.location = new Subscribable<Location>("EZone", () => this.onChanged());
        } else {
            this.location = new Subscribable<Location>("Deck", () => this.onChanged());
        }
        if (cardData["type"].match("Monster").size() > 0) {
            this.atk.set(cardData.atk!);
            this.def.set(cardData.def!);
            this.level.set(cardData.level!);
        }
    }
    
    onChanged() {
        this.changed.set(this.changed.get() + 1);
    }

    getController() {
        const duel = getDuel(this.owner)!;
        return duel.getPlayer(this.controller.get());
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

    normalSummon(location: Location) {
        this.position.set('FaceUpAttack')
        const duel = getDuel(this.owner)!;

        const turn = duel.turn.get();
        this.addFloodgate("CHANGED_POSITION", () => {
            return !["MZone", "SZone"].some(zone => includes(this.location.get(), zone))
                   || duel.turn.get() !== turn          
        })

        this.location.set(location)
        this.getController().action.set({
            action: "Normal Summon",
        })
    }

    tributeSet(location: Location) {
        this.set(location);
    }

    set(location: Location) {
        const duel = getDuel(this.owner)!;
        const turn = duel.turn.get();
        if (this.type.get().match('Monster').size() > 0) {
            this.position.set('FaceDownDefense')

            this.addFloodgate("CHANGED_POSITION", () => {
                return !["MZone", "SZone"].some(zone => includes(this.location.get(), zone))
                       || duel.turn.get() !== turn          
            })

            this.location.set(location)
            wait(1)
            this.getController().action.set({
                action: "Set Monster",
            })
        } else {
            this.position.set('FaceDown')
            if(this["type"].get().match("Trap").size() > 0 || this["type"].get().match("Quick").size() > 0) {
                this.addFloodgate("CANNOT_ACTIVATE", () => {
                    return !["MZone", "SZone"].some(zone => includes(this.location.get(), zone))
                           || duel.turn.get() !== turn          
                })
            }
            this.location.set(location)
            wait(1)
            this.getController().action.set({
                action: "Set",
            })
        }
    }

    toGraveyard() {
        this.location.set("GZone");
    }

    attack(defender?: Card) {

    }

    tribute() {
        this.toGraveyard()
    }

    destroy(cause: string) {
        if(this.getFloodgates("PREVENT_DESTRUCTION")) return;
        //this.status.set(`destroyedBy${cause}`)
        if(!includes(cause, "Battle")) {
            this.toGraveyard()
        }
    }

    checkEffectConditions() {
        if(cardEffects[this.name.get()] === undefined) return false
        const effects = cardEffects[this.name.get()](this)
        return effects.some(({condition}) => {
            if(!condition) return false;
            return condition() === true
        })
    }

    async activateEffect() {
        const duel = getDuel(this.owner)!;
        const effects = cardEffects[this.name.get()](this)
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
                } else if(this.location.get().match("SZone").size() > 0 || this.location.get().match("MZone").size() > 0 || this.location.get().match("FZone").size() > 0) {
                    this.position.set('FaceUp')
                }
                wait(1)
                this.getController().action.set({
                    action: "Activate Effect Spell",
                })
                duel.addToChain(this, effect!)
            } else if(this['type'].get() === "Trap Card") {
                this.position.set('FaceUp')
                wait(1)
                this.getController().action.set({
                    action: "Activate Effect Trap",
                })
                duel.addToChain(this, effect!)
            } else if(includes(this['type'].get(), "Monster")) {
                wait(1)
                this.getController().action.set({
                    action: "Activate Effect Monster Flip",
                })
                duel.addToChain(this, effect!)
            }
        }
        this.activated.set(true)
    }

    getCost() {
        if(cardEffects[this.name.get()] === undefined) return false
        const effects = cardEffects[this.name.get()](this)
        if(effects.size() === 1) {
            return effects[0].cost
        }
        return false;
    }

    getTarget() {
        if(cardEffects[this.name.get()] === undefined) return false
        const effects = cardEffects[this.name.get()](this)
        if(effects.size() === 1) {
            return effects[0].target
        }
        return false;
    }
}
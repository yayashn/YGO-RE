import { HttpService } from "@rbxts/services";
import getCardData, { includes } from "shared/utils";
import { Location, Position, SelectableZone } from "./types";
import { Subscribable } from "shared/Subscribable";
import cardEffects from "server-storage/card-effects";
import { getFilteredCards } from "./utils";
import { getDuel } from "./duel";

export class Card {
    uid: string;
    name: Subscribable<string>;
    atk = new Subscribable<number | undefined>(undefined);
    def = new Subscribable<number | undefined>(undefined);
    originalData: Subscribable<Record<string, unknown>>;
    race: Subscribable<string>;
    desc: Subscribable<string>;
    level = new Subscribable<number | undefined>(undefined);
    art: string;
    owner: Player;
    controller: Subscribable<Player>;
    position: Subscribable<Position>;
    location: Subscribable<Location>;
    order: Subscribable<number>;
    "type": Subscribable<string>;
    floodgates: Subscribable<string[]> = new Subscribable([]);
    chainLink = new Subscribable<number>(0);
    targets = new Subscribable<Card[]>([]);
    activated = new Subscribable(false);
    attackNegated = new Subscribable(false);

    constructor(name: string, owner: Player, order: number) {
        const cardData = getCardData(name)!;
        this.originalData = new Subscribable(cardData);
        this.uid = HttpService.GenerateGUID(false);
        this.name = new Subscribable(name);
        this.race = new Subscribable(cardData.race);
        this.desc = new Subscribable(cardData.desc);
        this.position = new Subscribable<Position>("FaceDown");
        this.art = cardData.art;
        this.owner = owner;
        this.controller = new Subscribable<Player>(owner);
        this.order = new Subscribable<number>(order);
        this["type"] = new Subscribable<string>(cardData["type"]);

        if (cardData["type"].match("Fusion").size() > 0) {
            this.location = new Subscribable<Location>("EZone");
        } else {
            this.location = new Subscribable<Location>("Deck");
        }
        if (cardData["type"].match("Monster").size() > 0) {
            this.atk.set(cardData.atk!);
            this.def.set(cardData.def!);
            this.level.set(cardData.level!);
        }
    }

    getController() {
        const duel = getDuel(this.owner)!;
        return duel.getPlayer(this.controller.get());
    }

    addFloodgate(floodgate: string) {
        const floogatedUid = HttpService.GenerateGUID(false);
        this.floodgates.set([
            ...this.floodgates.get(),
            `${floodgate}-${floogatedUid}`
        ]);

        return () => {
            this.floodgates.set(this.floodgates.get().filter((floodgate) => {
                const [floodgateName, uid] = floodgate.split("-");
                return uid !== floogatedUid;
            }));
        }
    }

    getFloodgate(floodgateString: string, floodgateUid?: string) {
        return this.floodgates.get().find((floodgate) => {
            const [floodgateName, uid] = floodgate.split("-");
            return floodgateName.match(`^${floodgateString}`).size() > 0 && (floodgateUid ? uid === floodgateUid : true);
        });
    }

    removeFloodgate(floodgateString: string, floodgateUid?: string) {
        this.floodgates.set(this.floodgates.get().filter((floodgate) => {
            const [floodgateName, uid] = floodgate.split("-");
            return !(floodgateName.match(`^${floodgateString}`).size() > 0 && (floodgateUid ? uid === floodgateUid : true));
        }));
    }

    normalSummon(location: Location) {
        this.position.set('FaceUpAttack')
        this.getController().addFloodgate("CANNOT_NORMAL_SUMMON_AFTER_NORMAL_SUMMON")
        this.getController().addFloodgate("CANNOT_CHANGE_POSITION_AFTER_PLACEMENT")
        this.location.set(location)
        this.getController().action.set({
            action: "Normal Summon",
        })
    }

    set() {
        if (this["type"].get().match("Trap").size() > 0) {
            this.addFloodgate("CANNOT_ACTIVATE_AFTER_SET");
        }
    }

    toGraveyard() {
        this.location.set("GZone");
    }

    attack(defender?: Card) {

    }

    destroy(cause: string) {
        if(this.getFloodgate("PREVENT_DESTRUCTION")) return;
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
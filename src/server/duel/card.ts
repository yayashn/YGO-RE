import { HttpService } from "@rbxts/services";
import getCardData from "shared/utils";
import { CardFloodgate, Location, Position } from "./types";
import { Subscribable } from "shared/Subscribable";

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

    normalSummon() {
        this.position.set("FaceUpAttack");
        this.location.set("MZone1");
        this.addFloodgate("CANNOT_CHANGE_POSITION_AFTER_PLACEMENT");
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
}
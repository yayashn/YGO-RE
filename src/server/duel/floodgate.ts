import type { Card } from "./card";

export class Floodgate {
    name: string;
    expired: () => boolean;
    causedByCard?: Card;

    constructor(name: string, expired: () => boolean, causedByCard?: Card) {
        this.name = name;
        this.causedByCard = causedByCard;
        this.expired = expired;
    }
}

import type { Card } from "./card";
import { CardFilter } from "./types";

export class Floodgate {
    name: string;
    expired: () => boolean;
    causedByCard?: Card;
    value?: unknown;

    constructor(name: string, expired: () => boolean, causedByCard?: Card, value?: unknown) {
        this.name = name;
        this.causedByCard = causedByCard;
        this.expired = expired;
        this.value = value;
    }
}
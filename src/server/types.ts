export type CardTemplate = {
    name: string;
    rarity?: string;
}

export type DeckTemplate = {
    deck: CardTemplate[];
    extra: CardTemplate[];
}

export type DecksTemplate = {
    [key: string]: DeckTemplate;
};

export type EquippedTemplate = {
    avatar: string;
    sleeve: string;
    disk: string;
    deck: string;
}

export type PlayerData = {
    dp: number;
    cards: CardTemplate[];
    decks: DecksTemplate;
    sleeves: string[];
    avatars: string[];
    disks: string[];
    equipped: EquippedTemplate;
}
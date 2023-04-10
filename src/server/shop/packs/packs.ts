import LOB from "./LOB";

export type PackCard = {
    name: string,
    rarity: string
}

export type Pack = {
    price: number;
    cards: PackCard[],
    getFullRandomPack: () => string[]
}

const packs: Record<string, Pack> = {
    LOB
}

export default packs
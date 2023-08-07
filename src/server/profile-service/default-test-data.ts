import { CardTemplate, PlayerData } from "../types";

const defaultCards: CardTemplate[] = [
    { name: "Man-Eater Bug" },
    { name: "Petit Dragon" },
    { name: "Dark Magician" },
    { name: "Man-Eater Bug" },
    { name: "Petit Dragon" },
    { name: "Dark Magician" },
    { name: "Man-Eater Bug" },
    { name: "Petit Dragon" },
    { name: "Dragon Capture Jar" },
    { name: "Dragon Capture Jar" },
    { name: "Dragon Capture Jar" },
    { name: "Dragon Capture Jar" },
    { name: "Dragon Capture Jar" },
    { name: "Dragon Capture Jar" },
    { name: "Dragon Capture Jar" },
    { name: "Dragon Capture Jar" },
    { name: "Dragon Capture Jar" },
]

const defaultExtra: CardTemplate[] = [
    { name: "Gaia the Dragon Champion" },
]

export const defaultPlayerData: PlayerData = {
    dp: 10000,
    cards: [...defaultCards],
    decks: {
        "default": {
            deck: [...defaultCards],
            extra: [...defaultExtra],
        }
    },
    sleeves: ['default'],
    avatars: [],
    disks: [],
    equipped: {
        avatar: '',
        sleeve: 'default',
        disk: '',
        deck: 'default',
    },
}

export default defaultPlayerData;
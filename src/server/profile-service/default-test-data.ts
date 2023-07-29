import { CardTemplate, PlayerData } from "../types";

const defaultCards: CardTemplate[] = [
    { name: "Skull Servant" },
    { name: "Harpie's Feather Duster" },
    { name: "Harpie's Feather Duster" },
    { name: "Violet Crystal" },
    { name: "Violet Crystal" },
    { name: "Skull Servant" },
    { name: "Swords of Revealing Light" },
]

export const defaultPlayerData: PlayerData = {
    dp: 10000,
    cards: [...defaultCards],
    decks: {
        "default": {
            deck: [...defaultCards],
            extra: [],
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
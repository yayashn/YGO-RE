import { CardTemplate, PlayerData } from "../types";

const defaultCards: CardTemplate[] = [
    { name: "Skull Servant" },
    { name: "Yami" },
    { name: "Violet Crystal" },
    { name: "Skull Servant" },
    { name: "Yami" },
    { name: "Violet Crystal" },
    { name: "Skull Servant" },
    { name: "Yami" },
    { name: "Violet Crystal" },
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
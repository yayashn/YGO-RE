import { CardTemplate, PlayerData } from "../types";

const defaultCards: CardTemplate[] = [
    { name: "Man-Eater Bug" },
    { name: "Hane-Hane" },
    { name: "Reaper of the Cards" },
    { name: "Armed Ninja" },
    { name: "Trap Hole" },
    { name: "Yami" },
    { name: "Petit Angel" },
    { name: "Skull Servant" },
    { name: "Wasteland" },
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
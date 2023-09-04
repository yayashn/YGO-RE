import { CardTemplate, PlayerData } from "../types";

const c: CardTemplate[] = [
    "The Unhappy Maiden",
    "Stim-Pack",
    "Kuriboh"
].map(name => ({ name }))

export const defaultCards = [...c, ...c, ...c, ...c]

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
    afkDailyDp: {
        [DateTime.now().FormatLocalTime("L", "en-us")]: {
            earnt: 0,
            max: 50000
        },
    }
}

export default defaultPlayerData;
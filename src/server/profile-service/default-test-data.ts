import { CardTemplate, PlayerData } from "../types";

const defaultCards: CardTemplate[] = [
    { name: "Uraby" },
    { name: "Uraby" },
    { name: "Uraby" },
    { name: "Uraby" },
    { name: "Uraby" },
    { name: "Uraby" },
    { name: "Uraby" },
    { name: "Horn of Heaven" },
    { name: "Horn of Heaven" },
    { name: "Horn of Heaven" },
    { name: "Horn of Heaven" },
    { name: "Seven Tools of the Bandit" },
    { name: "Seven Tools of the Bandit" },
    { name: "Seven Tools of the Bandit" },
    { name: "Seven Tools of the Bandit" },
    { name: "Mirror Force" },
    { name: "Mirror Force" },
    { name: "Mirror Force" },
    { name: "Mirror Force" },
    { name: "Mirror Force" },
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
    afkDailyDp: {
        [DateTime.now().FormatLocalTime("L", "en-us")]: {
            earnt: 0,
            max: 43200
        },
    }
}

export default defaultPlayerData;
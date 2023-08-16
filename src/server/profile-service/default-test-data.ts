import { CardTemplate, PlayerData } from "../types";

const defaultCards: CardTemplate[] = [
    { name: "Time Wizard" },
    { name: "Time Wizard" },
    { name: "Time Wizard" },
    { name: "Time Wizard" },
    { name: "Time Wizard" },
    { name: "Change of Heart" },
    { name: "Change of Heart" },
    { name: "Change of Heart" },
    { name: "Change of Heart" },
    { name: "Monster Reborn" },
    { name: "Monster Reborn" },
    { name: "Monster Reborn" },
    { name: "Monster Reborn" },
    { name: "Monster Reborn" },
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
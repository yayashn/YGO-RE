import { CardTemplate, PlayerData } from "server/types";

const defaultCards: CardTemplate[] = [
    { rarity: "common", name: "Skull Servant" },
    { rarity: "common", name: "Skull Servant" },
    { rarity: "common", name: "Skull Servant" },
    { rarity: "common", name: "Basic Insect" },
    { rarity: "common", name: "Basic Insect" },
    { rarity: "common", name: "Basic Insect" },
    { rarity: "common", name: "Dark Gray" },
    { rarity: "common", name: "Dark Gray" },
    { rarity: "common", name: "Dark Gray" },
    { rarity: "common", name: "Nemuriko" },
    { rarity: "common", name: "Nemuriko" },
    { rarity: "common", name: "Nemuriko" },
    { rarity: "common", name: "Flame Manipulator" },
    { rarity: "common", name: "Flame Manipulator" },
    { rarity: "common", name: "Flame Manipulator" },
    { rarity: "common", name: "Monster Egg" },
    { rarity: "common", name: "Monster Egg" },
    { rarity: "common", name: "Monster Egg" },
    { rarity: "common", name: "Firegrass" },
    { rarity: "common", name: "Firegrass" },
    { rarity: "common", name: "Firegrass" },
    { rarity: "common", name: "Petit Angel" },
    { rarity: "common", name: "Petit Angel" },
    { rarity: "common", name: "Petit Angel" },
    { rarity: "common", name: "Petit Dragon" },
    { rarity: "common", name: "Petit Dragon" },
    { rarity: "common", name: "Petit Dragon" },
    { rarity: "common", name: "Hinotama Soul" },
    { rarity: "common", name: "Hinotama Soul" },
    { rarity: "common", name: "Hinotama Soul" },
    { rarity: "common", name: "Sparks" },
    { rarity: "common", name: "Sparks" },
    { rarity: "common", name: "Sparks" },
    { rarity: "common", name: "Red Medicine" },
    { rarity: "common", name: "Red Medicine" },
    { rarity: "common", name: "Red Medicine" },
    { rarity: "common", name: "Kurama" },
    { rarity: "common", name: "Kurama" },
    { rarity: "common", name: "Kurama" },
    { rarity: "super", name: "Spike Seadra" },
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
    afkDailyDp: {
        [DateTime.now().FormatLocalTime("L", "en-us")]: {
            earnt: 0,
            max: 43200
        },
    }
}

export default defaultPlayerData;
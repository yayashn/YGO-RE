import { CardTemplate, PlayerData } from "../types";

const defaultCards: CardTemplate[] = [
    { name: "Skull Servant" },
    { name: "Skull Servant" },
    { name: "Skull Servant" },
    { name: "Basic Insect" },
    { name: "Basic Insect" },
    { name: "Basic Insect" },
    { name: "Dark Gray" },
    { name: "Dark Gray" },
    { name: "Dark Gray" },
    { name: "Nemuriko" },
    { name: "Nemuriko" },
    { name: "Nemuriko" },
    { name: "Flame Manipulator" },
    { name: "Flame Manipulator" },
    { name: "Flame Manipulator" },
    { name: "Monster Egg" },
    { name: "Monster Egg" },
    { name: "Monster Egg" },
    { name: "Firegrass" },
    { name: "Firegrass" },
    { name: "Firegrass" },
    { name: "Petit Angel" },
    { name: "Petit Angel" },
    { name: "Petit Angel" },
    { name: "Petit Dragon" },
    { name: "Petit Dragon" },
    { name: "Petit Dragon" },
    { name: "Hinotama Soul" },
    { name: "Hinotama Soul" },
    { name: "Hinotama Soul" },
    { name: "Sparks" },
    { name: "Sparks" },
    { name: "Sparks" },
    { name: "Red Medicine" },
    { name: "Red Medicine" },
    { name: "Red Medicine" },
    { name: "Kurama" },
    { name: "Kurama" },
    { name: "Kurama" },
    { name: "Spike Seadra" },
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
    sleeves: [],
    avatars: [],
    disks: [],
    equipped: {
        avatar: '',
        sleeve: '',
        disk: '',
        deck: '',
    },
}

export default defaultPlayerData;
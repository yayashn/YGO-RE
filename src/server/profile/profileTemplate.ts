export type Card = {
    name: string
}

const defaultCardsDev = [
    { name: "Man-Eater Bug" },
    { name: "Man-Eater Bug" },
    { name: "Man-Eater Bug" },
    { name: "Man-Eater Bug" },
    { name: "Man-Eater Bug" },
    { name: "Pot of Greed" },
    { name: "Dragon Capture Jar"},
    { name: "Dragon Capture Jar"},
    { name: "Dragon Capture Jar"},
]

const defaultCards = [
    { name: "Skull Servant" },
    { name: "Skull Servant" },
    { name: "Skull Servant" },
    { name: "Basic Insect"},
    { name: "Basic Insect"},
    { name: "Basic Insect"},
    { name: "Dark Gray"},
    { name: "Dark Gray"},
    { name: "Dark Gray"},
    { name: "Nemuriko"},
    { name: "Nemuriko"},
    { name: "Nemuriko"},
    { name: "Flame Manipulator"},
    { name: "Flame Manipulator"},
    { name: "Flame Manipulator"},
    { name: "Monster Egg"},
    { name: "Monster Egg"},
    { name: "Monster Egg"},
    { name: "Firegrass"},
    { name: "Firegrass"},
    { name: "Firegrass"},
    { name: "Petit Angel"},
    { name: "Petit Angel"},
    { name: "Petit Angel"},
    { name: "Petit Dragon"},
    { name: "Petit Dragon"},
    { name: "Petit Dragon"},
    { name: "Hinotama Soul"},
    { name: "Hinotama Soul"},
    { name: "Hinotama Soul"},
    { name: "Sparks"},
    { name: "Sparks"},
    { name: "Sparks"},
    { name: "Red Medicine"},
    { name: "Red Medicine"},
    { name: "Red Medicine"},
    { name: "Kurama"},
    { name: "Kurama"},
    { name: "Kurama"},
    { name: "Spike Seadra"},
]

const decks: {
    [key: string]: {
        deck: Card[],
        extra: Card[],
    }
} = {
    "default": {
        deck: [...defaultCards],
        extra: [
            { name: "Gaia the Dragon Champion" },
        ],
    }
}

const cards: Card[] = [...defaultCards, { name: "Gaia the Dragon Champion"}]

const profileTemplate = {
    decks,
    cards,
    avatars: ["Kuriboh"],
    duelDisks: ["default"],
    dp: 1000,
    equipped: {
        deck: "default",
        avatar: "Kuriboh",
    } as { [key: string]: string }
}

export type ProfileTemplate = typeof profileTemplate
export default profileTemplate
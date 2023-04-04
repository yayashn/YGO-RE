export type Card = {
    name: string
}

const defaultCardsDev = [
    { name: "Gravedigger Ghoul"},
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
    [key: string]: Card[]
} = {
    "default": defaultCards
}

const cards: Card[] = defaultCards

const profileTemplate = {
    decks,
    cards,
    equipped: {
        deck: "default",
    } as { [key: string]: string }
}

export type ProfileTemplate = typeof profileTemplate
export default profileTemplate
import { CardEffect } from ".";

const materials = {
    "Gaia The Fierce Knight": 1,
    "Curse of Dragon": 1
}

export default () => {
    const effects: CardEffect[] = [
        {
            fusionMaterials: materials
        }
    ]
    return effects
}
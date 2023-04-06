import { CardEffect } from ".";

const materials = {
    "Monster Egg": 1,
    "Hinotama Soul": 1
}

export default () => {
    const effects: CardEffect[] = [
        {
            fusionMaterials: materials
        }
    ]
    return effects
}
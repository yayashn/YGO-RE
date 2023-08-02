import { CardEffect } from "..";

const materials = {
    "Petit Angel": 1,
    "Mystical Sheep #2": 1
}

export default () => {
    const effects: CardEffect[] = [
        {
            fusionMaterials: materials
        }
    ]
    return effects
}
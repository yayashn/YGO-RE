import { CardEffect } from ".";

const materials = {
    "M-Warrior #1": 1,
    "M-Warrior #2": 1
}

export default () => {
    const effects: CardEffect[] = [
        {
            fusionMaterials: materials
        }
    ]
    return effects
}
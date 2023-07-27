import { CardEffect } from ".";

const materials = {
    "Armaill": 1,
    "One-Eyed Shield Dragon": 1
}

export default () => {
    const effects: CardEffect[] = [
        {
            fusionMaterials: materials
        }
    ]
    return effects
}
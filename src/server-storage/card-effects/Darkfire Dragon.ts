import { CardEffect } from ".";

const materials = {
    "Firegrass": 1,
    "Petit Dragon": 1
}

export default () => {
    const effects: CardEffect[] = [
        {
            fusionMaterials: materials
        }
    ]
    return effects
}
import { CardEffect } from "..";

const materials = {
    "Silver Fang": 1,
    "Darkworld Thorns": 1
}

export default () => {
    const effects: CardEffect[] = [
        {
            fusionMaterials: materials
        }
    ]
    return effects
}
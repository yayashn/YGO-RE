import { CardEffect } from "..";

const materials = {
    "Skull Servant": 1,
    "Dissolverock": 1
}

export default () => {
    const effects: CardEffect[] = [
        {
            fusionMaterials: materials
        }
    ]
    return effects
}
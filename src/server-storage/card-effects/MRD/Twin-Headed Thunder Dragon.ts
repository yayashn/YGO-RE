import { CardEffect } from "..";

const materials = {
    "Thunder Dragon": 2
}

export default () => {
    const effects: CardEffect[] = [
        {
            fusionMaterials: materials
        }
    ]
    return effects
}
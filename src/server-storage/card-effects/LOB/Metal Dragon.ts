import { CardEffect } from "..";

const materials = {
    "Steel Ogre Grotto #1": 1,
    "Lesser Dragon": 1
}

export default () => {
    const effects: CardEffect[] = [
        {
            fusionMaterials: materials
        }
    ]
    return effects
}
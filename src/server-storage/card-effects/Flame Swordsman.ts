import { CardEffect } from ".";

const materials = {
    "Flame Manipulator": 1,
    "Masaki the Legendary Swordsman": 1
}

export default () => {
    const effects: CardEffect[] = [
        {
            fusionMaterials: materials
        }
    ]
    return effects
}
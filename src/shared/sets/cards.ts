import legendOfBlueEyesWhiteDragon from "./legend-of-blue-eyes-white-dragon";
import metalRaiders from "./metal-raiders";
import unreleased from "./unreleased";

export default [
    ...unreleased,
    ...legendOfBlueEyesWhiteDragon,
    ...metalRaiders
] as {
    "name": string,
    "art": string,
    "id": number,
    "type": string,
    "desc": string,
    "atk"?: number
    "def"?: number
    "level"?: number
    "race": string
    "attribute": string
}[]
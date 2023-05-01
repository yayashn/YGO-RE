import Roact from "@rbxts/roact";

type Zone = Vector3Value;

export const Zone = ({zone}: {zone: Zone}) => {
    return (
        <surfacegui Key={zone.Name}>
        </surfacegui>
    )
}
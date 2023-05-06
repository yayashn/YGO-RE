import Roact from "@rbxts/roact"
import udim from "./values/udim";
import startsWith from "./utils/startsWith";

export default function useClass<T extends Instance>(className: string): JSX.IntrinsicElement<T> {
    const classNames = className.split(" ");
    const properties: Record<string, unknown> = {};

    let widthUDim = new UDim(0, 0);
    let heightUDim = new UDim(0, 0);

    classNames.forEach((name) => {
        const classType = name.split("-")[0];
        const key = name.split("-")[0];

        if (classType === "w") {
            widthUDim = udim[key as unknown as keyof typeof udim] || new UDim(0, 0);
        } else if (classType === "h") {
            heightUDim = udim[key as unknown as keyof typeof udim] || new UDim(0, 0);
        }
    });

    properties.Size = new UDim2(widthUDim, heightUDim);
    return properties as unknown as JSX.IntrinsicElement<T>;
}
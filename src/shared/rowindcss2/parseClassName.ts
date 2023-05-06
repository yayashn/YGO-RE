import udim from "./values/udim";

function getClassType(name: string): "w" | "h" | "none" {
    if (name.sub(0, 1) === "w" && name.sub(1, 2) === "-") {
      return "w";
    } else if (name.sub(0, 1) === "h" && name.sub(1, 2) === "-") {
      return "h";
    } else {
      return "none";
    }
}
  
export default function parseClassName(className: string){
    const classNames = className.split(" ");
    const properties: { [key: string]: unknown } = {};

    let widthUDim = new UDim(0, 0);
    let heightUDim = new UDim(0, 0);

    classNames.forEach((name) => {
        const classType = getClassType(name);
        const key = name.sub(2);

        if (classType === "w") {
            const specialClass = ["auto"].includes(key);
            widthUDim = udim[key as unknown as keyof typeof udim] || new UDim(0, 0);
        } else if (classType === "h") {
            heightUDim = udim[key as unknown as keyof typeof udim] || new UDim(0, 0);
        }
    });

    properties.Size = new UDim2(widthUDim, heightUDim);
    return properties;
}
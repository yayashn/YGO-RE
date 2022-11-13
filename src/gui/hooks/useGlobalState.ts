import { useEffect, useState } from "@rbxts/roact-hooked";

const httpService = game.GetService("HttpService");
const serverStorage = game.GetService("ServerStorage");
const player = script.FindFirstAncestorWhichIsA("Player")!;
const playerFolder = serverStorage.WaitForChild(player.Name);

const globalStore = new Instance("Folder");
globalStore.Name = "GlobalStore";
globalStore.Parent = playerFolder;

export type ValueType = string | number | boolean | Instance | Ray | Vector3 | CFrame | Color3 | any[] | {}

const valueType = (value: ValueType) => {
    switch (typeOf(value)) {
        case "string":
            return "StringValue";
        case "number":
            return "NumberValue";
        case "boolean":
            return "BoolValue";
        case "Instance":
            return "ObjectValue";
        case "Ray":
            return "RayValue";
        case "Vector3":
            return "Vector3Value";
        case "CFrame":
            return "CFrameValue";
        case "Color3":
            return "Color3Value";
        default:
            return "StringValue";
    }
}

export const createGlobalState = (key: string, initialValue: ValueType) => {
    const stateStore: ValueBase = globalStore.FindFirstChild(key) as ValueBase || new Instance(valueType(initialValue));
    stateStore.Name = key;
    if(typeOf(initialValue) === "table") {
        stateStore.Value = httpService.JSONEncode(initialValue);
    } else {
        stateStore.Value = initialValue;
    }
    stateStore.Parent = globalStore;
    return stateStore;
}

//const foo = <T,>(x: T) => x;

export const useGlobalState = (<T>(stateStore: ValueBase) => {
    let isDecodable: boolean;
    try {
        httpService.JSONDecode(stateStore.Value as string);
        isDecodable = true;
    } catch(error) {
        isDecodable = false;
    }

    const [state, setState] = useState(isDecodable ? httpService.JSONDecode(stateStore.Value as string) : stateStore.Value);

    const setGlobalState = (value: ValueType) => {
        stateStore.Value = isDecodable ? httpService.JSONEncode(value) : value;
    }

    useEffect(() => {
        stateStore.Changed.Connect((newValue) => {
            setState(isDecodable ? httpService.JSONDecode(newValue as string) : newValue);
        });
    }, []);

    return [state, setGlobalState] as [T, (value: ValueType) => void];
})
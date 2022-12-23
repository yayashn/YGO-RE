import { useEffect, useState } from "@rbxts/roact-hooked";

const httpService = game.GetService("HttpService");
const serverStorage = game.GetService("ServerStorage");
const player = script.FindFirstAncestorWhichIsA("Player")!;
const playerFolder = serverStorage.FindFirstChild("players")!.WaitForChild(player.Name);

let globalStore: Folder;

if(!playerFolder.FindFirstChild("GlobalStore")) {
    globalStore = new Instance("Folder");
    globalStore.Name = "GlobalStore";
    globalStore.Parent = playerFolder;   
} else {
    globalStore = playerFolder.FindFirstChild("GlobalStore") as Folder;
}

export type ValueType = string | number | boolean | Instance | Ray | Vector3 | CFrame | Color3 | any[] | {};

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
};

export const createGlobalState = (key: string, initialValue: ValueType) => {
	const stateStore: ValueBase =
		(globalStore.FindFirstChild(key) as ValueBase) || new Instance(valueType(initialValue));
	stateStore.Name = key;
	if (typeOf(initialValue) === "table") {
		stateStore.Value = httpService.JSONEncode(initialValue);
	} else {
		stateStore.Value = initialValue;
	}
	stateStore.Parent = globalStore;
	return stateStore;
};

export const getGlobalState = (key: string, player?: Player) => {
    if(!player) {
        return globalStore.FindFirstChild(key) as ValueBase;
    } else {
        const playerFolder = serverStorage.FindFirstChild("players")!.WaitForChild(player.Name);
        const globalStore = playerFolder.FindFirstChild("GlobalStore") as Folder;
        return globalStore.FindFirstChild(key) as ValueBase;
    }
};

export const useGlobalState = <T>(stateStore: ValueBase): [T, (value: T) => void] => {
  let isDecodable: boolean;
  try {
    httpService.JSONDecode(stateStore.Value as string);
    isDecodable = true;
  } catch (error) {
    isDecodable = false;
  }

  const [state, setState] = useState<T>(
    (isDecodable ? httpService.JSONDecode(stateStore.Value as string) : stateStore.Value) as T
  );

  const setGlobalState = (value: T) => {
    stateStore.Value = isDecodable ? httpService.JSONEncode(value) : value;
  };

  useEffect(() => {
    stateStore.Changed.Connect((newValue) => {
      setState((isDecodable ? httpService.JSONDecode(newValue as string) : newValue) as T);
    });
  }, []);

  return [state, setGlobalState];
};

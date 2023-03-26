import { ReplicatedStorage } from "@rbxts/services";

const httpService = game.GetService("HttpService");

export const remoteEvent = (name: string, parent: Instance) => {
    const re = new Instance("RemoteEvent");
    re.Name = name;
    re.Parent = parent;
    return re;
}

export const instance = (t: keyof CreatableInstances, name: string, parent?: Instance) => {
    const instance = new Instance(t);
    instance.Name = name;
    if(parent) {
        instance.Parent = parent;
    }
    return instance
}

export function createInstance<T extends Instance>(className: keyof CreatableInstances, name: string, parent: Instance): T {
    const instance = new Instance(className);
    instance.Name = name;
    instance.Parent = parent;
    return instance as unknown as T;
}
  

export const bindableEvent = (name: string, parent: Instance) => {
    return instance("BindableEvent", name, parent) as BindableEvent;
}

export const bindableFunction = (name: string, parent: Instance | TextButton) => {
    return instance("BindableFunction", name, parent) as BindableFunction;
}

export const get3DZone = (location: string, isOpponent?: boolean) => {
    const field = game.Workspace.Field3D.Field;
    if(isOpponent) {
        return field.Opponent.FindFirstChild(location, true);
    } else {
        return field.Player.FindFirstChild(location, true);
    }
}

export const JSON = {
    stringify: (input: unknown) => httpService.JSONEncode(input),
    parse: (str: string) => httpService.JSONDecode(str) as Record<string, unknown> | unknown[]
}

export const getCardData = (cardName: string) => {
    const cards = [];
    for(const set of ReplicatedStorage.FindFirstChild("cards")!.GetChildren()) {
        for(const card of set.GetChildren()) {
            if(card.FindFirstChild("art")) {
                cards.push(card);
            }
        }
    }
    return cards.find((c) => c.Name === cardName);
}
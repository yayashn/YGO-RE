import { createContext } from "@rbxts/roact";

export default createContext(["", (page: string) => {}] as [string, (page: string) => void])
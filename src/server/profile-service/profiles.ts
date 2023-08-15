import type { Profile } from "@rbxts/profileservice/globals";
import type { PlayerData } from "server/types";

export const profiles: Record<string, Profile<PlayerData> | undefined> = {}
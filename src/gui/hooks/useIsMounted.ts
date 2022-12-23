import Roact, { Ref } from "@rbxts/roact";
import { useEffect, useState } from "@rbxts/roact-hooked";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const playerGui = player.FindFirstChild("PlayerGui")!;

export type UseIsMountedRef = Ref<GuiObject | SurfaceGui | Frame>;

export default (uiRef: Ref<GuiObject | SurfaceGui | Frame>) => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		const ui = uiRef.getValue();
		if (ui) {
			if (ui.FindFirstAncestorWhichIsA("PlayerGui") === undefined) {
				const connection = playerGui.DescendantAdded.Connect((descendant) => {
					if (descendant === ui) {
						setIsMounted(true);
						connection.Disconnect();
					}
				});
			} else {
				setIsMounted(true);
			}
		}
	}, []);

	return isMounted;
};
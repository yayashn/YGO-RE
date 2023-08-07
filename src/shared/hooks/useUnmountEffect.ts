import { useEffect } from "@rbxts/roact";
import { useLatest } from "./useLatest";

/**
 * Calls the callback when the component unmounts.
 * @param callback The callback to call.
 */
export function useUnmountEffect(callback: () => void) {
	const callbackRef = useLatest(callback);

	useEffect(() => {
		return () => {
			callbackRef.current();
		};
	}, []);
}
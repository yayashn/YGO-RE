import Roact from "@rbxts/roact";
import { useEffect, useRef, withHooks } from "@rbxts/roact-hooked";
import useIsUIMounted from "gui/hooks/useIsUIMounted";

const serverStorage = game.GetService("ServerStorage");

export default withHooks(() => {
	const ref = useRef<SurfaceGui>();
	const isMounted = useIsUIMounted(ref);

	useEffect(() => {
		if (isMounted) {
			const handLayout = (serverStorage.FindFirstChild("handLayout") as LocalScript).Clone();
			handLayout.Parent = ref.getValue();
		}
	}, [isMounted]);

	return <surfacegui Ref={ref} Key="HandPlayer"></surfacegui>;
});

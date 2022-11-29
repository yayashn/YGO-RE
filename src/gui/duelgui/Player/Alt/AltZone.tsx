import Roact from "@rbxts/roact";
import { useRef, withHooks } from "@rbxts/roact-hooked";

export default withHooks(({ name }: { name: string }) => {
	const zoneRef = useRef<SurfaceGui>();

	return <surfacegui Ref={zoneRef} Key={name}></surfacegui>;
});

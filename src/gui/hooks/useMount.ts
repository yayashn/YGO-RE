import { useEffect } from "@rbxts/roact-hooked"
import useIsMounted from "./useIsMounted"
import { UseIsMountedRef } from "./useIsMounted"

export default (callback: () => Callback | void, deps: unknown[], ref: UseIsMountedRef) => {
    const isMounted = useIsMounted(ref)

    useEffect(() => {
        let cleanup;
        if(isMounted) {
            cleanup = callback();
        }

        return cleanup
    }, [isMounted, ...deps])
}
import { useEffect } from "@rbxts/roact-hooked"
import useIsMounted from "./useIsMounted"
import { UseIsMountedRef } from "./useIsMounted"

export default (callback: () => void, deps: unknown[], ref: UseIsMountedRef) => {
    const isMounted = useIsMounted(ref)

    useEffect(() => {
        if(isMounted) {
            callback();
        }
    }, [isMounted, ...deps])
}
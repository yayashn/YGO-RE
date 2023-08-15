import { useEffect, useState } from "@rbxts/roact"

const breakpoints = {
    "2xl": 1536,
    xl: 1280,
    lg: 1024,
    md: 768,
    sm: 640,
    "": 0,
} as const

export default function useBreakpoint() {
    const camera = game.Workspace.Camera
    const [width, setWidth] = useState(camera.ViewportSize.X)
    
    useEffect(() => {
        const connection = camera.GetPropertyChangedSignal("ViewportSize").Connect(() => {
            setWidth(camera.ViewportSize.X)
        })

        return () => connection.Disconnect()
    }, [])

    return {
        sm: width >= breakpoints.sm,
        md: width >= breakpoints.md,
        lg: width >= breakpoints.lg,
        xl: width >= breakpoints.xl,
        "2xl": width >= breakpoints["2xl"],
    }
}
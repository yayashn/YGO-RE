import Roact from "@rbxts/roact"

const CardOptions = () => {
    return (
        <frame>

        </frame>
    )
}

export default async (player: Player, message: string) => {
    return new Promise<"YES" | "NO">((resolve) => {
        const prompt = Roact.mount(
            <screengui Key="Dialog" IgnoreGuiInset>
                <CardOptions/>
            </screengui>, 
            player.FindFirstChildWhichIsA("PlayerGui")
        )
    })
}
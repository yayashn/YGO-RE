import { ServerScriptService } from "@rbxts/services";

export default (player = script.FindFirstAncestorWhichIsA("Player")!) => {
    const playerFolder = ServerScriptService.FindFirstChild("instances")!.FindFirstChild("players")!.WaitForChild(player.Name)
    const deck = (playerFolder.FindFirstChild("deck") as StringValue).Value.split(",")
    while(deck.size() === 0) {
        wait()
    }
}
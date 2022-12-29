import { useEffect, useState } from "@rbxts/roact-hooked";
import { getDuel } from "server/utils";
import { CardFolder } from "server/ygo";
import Object from "@rbxts/object-utils";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const httpService = game.GetService("HttpService");

export default (card: CardFolder) => {
    const [isSelectable, setIsSelectable] = useState<boolean>();
    const [duel, YGOPlayer] = getDuel(player)!;

    useEffect(() => {
      const cardFilters = Object.entries(httpService.JSONDecode(YGOPlayer.selectableCards.Value) as { [key: string]: string });
      let selectable = 0;
      cardFilters.forEach(([key, value]) => {
        if(key === "controller") {
          if(value === card.controller.Value.Name) {
            selectable++
          }
        } 
        else if(key === "location") {
          if(value.match(card.location.Value).size() > 0) {
            selectable++
          }
        }
      })
      setIsSelectable(selectable === cardFilters.size());
    }, [card, YGOPlayer.selectableCards.Value])

    return isSelectable
}
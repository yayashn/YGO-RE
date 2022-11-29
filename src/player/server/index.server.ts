import { getPlayer } from "shared/utils";

const player = getPlayer(script);

const showField = new Instance("RemoteEvent");
showField.Name = "showField.re";
showField.Parent = player;

const startDuel = new Instance("BindableEvent");
startDuel.Name = "startDuel.be";
startDuel.Parent = player;

export default class YGOCard {
    name;
    ownerName;
    controllerName;
    location;
    position;
    face;

    constructor(
        name: string, 
        ownerName: string, 
        controllerName: string, 
        location: string, 
        position: "atk" | "def", 
        face: "up" | "down"
    ) {
        this.name = name;
        this.ownerName = ownerName;
        this.controllerName = controllerName;
        this.location = location;
        this.position = position;
        this.face = face;
    }
}
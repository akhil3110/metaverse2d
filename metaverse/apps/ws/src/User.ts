import { WebSocket } from "ws";

export class User { 
    constructor(private ws: WebSocket){

    }

    initHandler() {
        this.ws.on("message", (data) =>{
            const parsedData = JSON.parse(data.toString())

            switch parsedData.type {
                case "join": {
                    const  spaceId = parsedData.payload.spaceId
                    RoomManager.addUser(spaceId, this.ws)
                }
                case "move": {

                }
            }
        })
    }
}
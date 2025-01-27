import { WebSocket } from "ws";
import { User } from "./UserManager";

let GLOBAL_ROOM_ID = 1;

interface Room {
    userOne: User,
    userTwo: User
}

export class RoomManager {
    private rooms: Map<string, Room>;
    private static instance: RoomManager;

    private constructor() {
        this.rooms = new Map<string, Room>();
    }
    public static getInstance() {
        if(!this.instance) {
            this.instance = new RoomManager();
        }
        return this.instance;
    }

    createRoom(userOne: User, userTwo: User) {
        const roomId = this.generate().toString();
        this.rooms.set(roomId, {
            userOne,
            userTwo
        });

        userOne.socket.send(JSON.stringify({
            type: "SEND_OFFER",
            roomId
        }))
        userTwo.socket.send(JSON.stringify({
            type: "SEND_OFFER",
            roomId
        }))
    }

    onOffer(roomId: string, sdp: string, senderSocket: WebSocket) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.userOne.socket === senderSocket ? room.userTwo: room.userOne;
        
        console.log("offer sent successfully to the receiver " + receivingUser.name);
        
        receivingUser?.socket.send(JSON.stringify({
            type: "OFFER",
            sdp,
            roomId
        }));
    }

    onAnswer(roomId: string, sdp: string, senderSocket: WebSocket) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.userOne.socket === senderSocket ? room.userTwo: room.userOne;

        console.log("answer sent successfully to the sender " + receivingUser.name);

        receivingUser?.socket.send(JSON.stringify({
            type: "ANSWER",
            sdp,
            roomId
        }));
    }

    onIceCandidate(roomId: string, candidate: any, senderSocket: WebSocket) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const receivingUser = room.userOne.socket === senderSocket ? room.userTwo : room.userOne;
        receivingUser?.socket.send(JSON.stringify({
            type: "ADD_ICE_CANDIDATE",
            candidate,
            roomId
        }));
    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
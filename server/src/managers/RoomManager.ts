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
        this.rooms.set(roomId, { userOne, userTwo });

        userOne.socket.send(JSON.stringify({ type: "SEND_OFFER", roomId }));
        userTwo.socket.send(JSON.stringify({ type: "SEND_OFFER", roomId }));
    }

    onOffer(roomId: string, sdp: string, senderSocket: WebSocket) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        const receivingUser = room.userOne.socket === senderSocket ? room.userTwo : room.userOne;
        console.log("offer sent successfully to " + receivingUser.name);
        receivingUser.socket.send(JSON.stringify({ type: "OFFER", sdp, roomId }));
    }

    onAnswer(roomId: string, sdp: string, senderSocket: WebSocket) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        const receivingUser = room.userOne.socket === senderSocket ? room.userTwo : room.userOne;
        console.log("answer sent successfully to " + receivingUser.name);
        receivingUser.socket.send(JSON.stringify({ type: "ANSWER", sdp, roomId }));
    }

    onIceCandidate(roomId: string, candidate: RTCIceCandidateInit, senderSocket: WebSocket, by: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        const receivingUser = room.userOne.socket === senderSocket ? room.userTwo : room.userOne;
        receivingUser.socket.send(JSON.stringify({ type: "ADD_ICE_CANDIDATE", candidate, roomId, by }));
    }

    // Notify the partner that the peer left, then remove the room
    notifyPeerLeft(socket: WebSocket) {
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.userOne.socket === socket || room.userTwo.socket === socket) {
                const partner = room.userOne.socket === socket ? room.userTwo : room.userOne;
                try {
                    partner.socket.send(JSON.stringify({ type: "PEER_LEFT" }));
                } catch {
                    // partner socket may already be closed
                }
                this.rooms.delete(roomId);
                console.log(`Room ${roomId} removed after user disconnected`);
                break;
            }
        }
    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
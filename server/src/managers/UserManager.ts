import { RoomManager } from "./RoomManager";
import { WebSocket } from "ws";

export interface User {
  name: string;
  socket: WebSocket;
}

export class UserManager {
  private static instance: UserManager;
  private users: User[];
  private usersQueue: User[];
  private roomManager = RoomManager.getInstance();

  private constructor() {
    this.users = [];
    this.usersQueue = [];
  }

  public static getUserManager() {
    if (!this.instance) {
      this.instance = new UserManager();
    }
    return this.instance;
  }

  public addUser(name: string, socket: WebSocket) {
    const user = { name, socket };
    this.users.push(user);
    this.usersQueue.push(user);

    socket.send(JSON.stringify({ type: "LOBBY" }));

    this.clearQueue();
    this.initHandlers(socket);
  }

  public removeUser(socket: WebSocket) {
    this.users = this.users.filter((u) => u.socket !== socket);
    this.usersQueue = this.usersQueue.filter((u) => u.socket !== socket);
  }

  clearQueue() {
    if (this.usersQueue.length >= 2) {
      const userOne = this.usersQueue.shift()!;
      const userTwo = this.usersQueue.shift()!;
      this.roomManager.createRoom(userOne, userTwo);
    }
  }

  initHandlers(socket: WebSocket) {
    socket.on("close", () => {
      // Notify the partner and clean up the room
      this.roomManager.notifyPeerLeft(socket);
      this.removeUser(socket);
      console.log("user disconnected");
    });

    socket.on("message", (data) => {
      try {
        const parsedData = JSON.parse(data.toString());

        switch (parsedData.type) {
          case "SET_NAME": {
            const user = this.users.find((u) => u.socket === socket);
            if (user && parsedData.name) {
              user.name = parsedData.name;
              console.log(`User name set to: ${user.name}`);
            }
            break;
          }
          case "OFFER":
            this.roomManager.onOffer(
              parsedData.roomId.toString(),
              parsedData.sdp,
              socket
            );
            break;
          case "ANSWER":
            this.roomManager.onAnswer(
              parsedData.roomId.toString(),
              parsedData.sdp,
              socket
            );
            break;
          case "ADD_ICE_CANDIDATE":
            this.roomManager.onIceCandidate(
              parsedData.roomId.toString(),
              parsedData.candidate,
              socket,
              parsedData.by
            );
            break;
          default:
            console.log("Unknown message type:", parsedData.type);
        }
      } catch (error) {
        console.error("Message processing error:", error);
        socket.send(JSON.stringify({ type: "ERROR", message: "Invalid message format" }));
      }
    });
  }
}

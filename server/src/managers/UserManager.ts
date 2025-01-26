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

    this.clearQueue();
  }

  public removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user.socket !== socket);
    this.usersQueue = this.usersQueue.filter((user) => user.socket !== socket);
  }
  clearQueue() {
    while (this.usersQueue.length >= 2) {
      const userOne = this.usersQueue.shift();
      const userTwo = this.usersQueue.shift();
      if (userOne && userTwo) {
        this.roomManager.createRoom(userOne, userTwo);
        break;
      }
    }
  }

  initHandlers(socket: WebSocket) {
    socket.on("close", () => {
      this.removeUser(socket);
    });

    socket.on("message", (data) => {
      try {
        const parsedData = JSON.parse(data.toString());
        console.log(parsedData);

        switch (parsedData.type) {
          case "OFFER":
            this.roomManager.onOffer(parsedData.roomId, parsedData.sdp, socket);
            break;
          case "ANSWER":
            this.roomManager.onAnswer(
              parsedData.roomId,
              parsedData.sdp,
              socket
            );
            break;
          case "ICE_CANDIDATE":
            this.roomManager.onIceCandidate(
              parsedData.roomId,
              parsedData.candidate,
              socket
            );
            break;
          default:
            throw new Error("Unknown message type");
        }
      } catch (error) {
        console.error("Message processing error:", error);
        socket.send(
          JSON.stringify({
            type: "ERROR",
            message: "Invalid message format",
          })
        );
      }
    });
  }
}

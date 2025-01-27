import { WebSocket, WebSocketServer } from "ws";
import express from "express";
import http from 'node:http';
import { UserManager } from "./managers/UserManager";
import { RoomManager } from "./managers/RoomManager";

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const userManager = UserManager.getUserManager();
const roomManager = RoomManager.getInstance();

wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', (data) => {
        console.log("init data", data.toString());
    })

    userManager.addUser(`User_${Date.now()}`, ws);
});

app.get('/', (req, res) => {
    res.status(200).json({
        msg: 'Omegle-like WebRTC Signaling Server',
        status: 'Active'
    });
});

server.listen(PORT, () => {
    console.log(`Signaling server started on port ${PORT}`)
});
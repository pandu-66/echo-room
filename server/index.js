const express = require('express');
const app = express();
const {WebSocketServer} = require('ws');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const {v4: uuid} = require('uuid');

const {colorPicker, verifyToken, validateRoomId } = require('./utils/help');
const {checkHeaders} = require('./middleware');

dotenv.config();
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN
}));

const port = process.env.PORT||3000;
const server = app.listen(port, ()=> console.log(`listening to port ${port}`));

const activeRooms = new Map(); // roomId: {host, uid:{decoded}}
const roomSockets = new Map(); // roomId: { uid: {ws} }


app.post("/api/nickname", (req, res)=>{
    const {name} = req.body;
    const token = jwt.sign({id: uuid(), name, color: colorPicker()}, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
    res.json({token});
});

app.post("/api/room/create", checkHeaders, (req, res)=>{
    const token = req.token;
    if(!token) res.sendStatus(401);
    try {
        const decoded = verifyToken(token);

        for(const [rId, room] of activeRooms){
            if(room.host === decoded.id){
                return res.json({message: "already exists", roomId: rId});
            }
        }

        let roomId;
        do {
            roomId = Math.floor(Math.random()*1000000).toString().padStart(6, "0");
        } while (activeRooms.has(roomId));

        activeRooms.set(roomId, {
            host: decoded.id,
            participants: new Map([[decoded.id, {id: decoded.id, name: decoded.name, color: decoded.color, isVisible: true}]]),
            createdAt: Date.now()
        });
        
        roomSockets.set(roomId, new Map());

        console.log(activeRooms);
        res.json({roomId})
    } catch (error) {
        res.sendStatus(403);
    }
});

app.post("/api/room/leave-or-end", checkHeaders, (req, res)=>{
    const token = req.token;
    if(!token) res.sendStatus(401);
    try {
        const decoded = verifyToken(token);
        const {roomId} = req.body;
        if(!validateRoomId(roomId)) return res.status(402).json({message: "Invalid Room id"});
        const room = activeRooms.get(roomId);
        if(!room) return res.status(404).json({message: "Room doesnt exist."});
        const sockets = roomSockets.get(roomId);
        if(room.host === decoded.id){
            // return res.status(403).json({message: "Only host can end."});
            if(sockets){
                for(const [, ws] of sockets){
                    try{ws.close(4003, "Room Ended By Host.");} catch{}
                }
                roomSockets.delete(roomId);
            }
            activeRooms.delete(roomId);
            res.json({message: "Room ended successfully."});
        }else{
            if(sockets){
                const socket = sockets.get(decoded.id);
                try{socket.close(4004, "You left the room.");}catch{}
                sockets.delete(decoded.id);
            }
            room.participants.delete(decoded.id);
            res.json({message: "Left the room successfully"});
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(403);
    }
});

app.post("/api/room/join", checkHeaders, (req, res)=>{
    const token = req.token;
    if(!token) res.sendStatus(401);
    try {
        const decoded = verifyToken(token);
        const {roomId} = req.body||{};
        if(!validateRoomId(roomId)) return res.status(402).json({message: "Invalid Room id"});
        const room = activeRooms.get(roomId);
        if(!room) return res.status(404).json({message: "Room doesnt exist."});

        if (!room.participants.has(decoded.id)) {
            room.participants.set(decoded.id, {id: decoded.id, name: decoded.name, color: decoded.color, isVisible: true});
        }
        
        if(!roomSockets.has(roomId)) roomSockets.set(roomId, new Map()); //just in case
        console.log(activeRooms);
        res.json({message: "Joined Room", roomId});
    }catch(error){
        res.sendStatus(403);
    }
});

app.get("/api/verify", checkHeaders, (req, res)=>{
    const token = req.token;
    if(!token) res.sendStatus(401);
    try {
        verifyToken(token);
        res.json({message: "verified"});
    } catch (error) {
        res.sendStatus(403);
    }
});



const broadcast = (roomId, payload, exceptId=null)=>{
    const sockets = roomSockets.get(roomId);
    if(!sockets) return;

    for(const [uid, ws] of sockets){
        if(exceptId && exceptId===uid) continue;

        if(ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
    }
}

const wss = new WebSocketServer({server});

wss.on("connection", (ws, req)=>{
    const url = new URL(req.url, "http://localhost");
    const token = url.searchParams.get("token");
    const roomId = url.searchParams.get("roomId");

    if(!token || !validateRoomId(roomId)){
        ws.close(4000, 'Missing/invalid auth or roomId');
        return
    }

    let decoded;
    try {
        decoded = verifyToken(token);
    } catch (error) {
        ws.close(4001, "Invalid token");
        return
    }

    if(!activeRooms.has(roomId)){
        ws.close(4002, "Invalid room");
        return
    }

    const room = activeRooms.get(roomId);

    //cleanup
    if(!room.participants.has(decoded.id)) room.participants.set(decoded.id, {id: decoded.id, name: decoded.name, color: decoded.color, isVisible: true});
    if(!roomSockets.has(roomId)) roomSockets.set(roomId, new Map());

    const sockets = roomSockets.get(roomId);
    sockets.set(decoded.id, ws);

    ws.send(JSON.stringify({type: "you", user: {id: decoded.id, name: decoded.name, color: decoded.color}}));
    ws.send(JSON.stringify({type: "participants", participants: Array.from(room.participants.values())}));

    // for(const[, ws] of sockets){
    //     ws.send(JSON.stringify({type: "notification", message: `${decoded.name} has joined the room`}));
    // }
    broadcast(roomId, {type: "presence", event: "join", user: {id: decoded.id, name: decoded.name, color: decoded.color, isVisible: true}}, decoded.id);
    
    ws.on("message", (raw)=>{
        let msg;
        try{
            msg = JSON.parse(raw.toString());
        }catch{
            ws.send(JSON.stringify({type: "error", message: "Invalid Json"}));
            return;
        }

        if(msg.type==="chat" && typeof msg.text==='string' && msg.text.trim()){
            const sender = room.participants.get(decoded.id);
            broadcast(roomId, {
                type: "chat",
                roomId,
                from: {id: sender.id, name: sender.name, color: sender.color},
                text: msg.text.trim(),
                ts: Date.now()
            })
        }else if(msg.type==="presence" && msg.event==="visibility"){
            room.participants.get(decoded.id).isVisible = msg.isVisible;
            broadcast(roomId, {type: "presence", event: "visibility", userId: decoded.id, name: decoded.name, isVisible: msg.isVisible});
        }else if(msg.type==="typing"){
            broadcast(roomId, {type: "typing", name: decoded.name, isTyping: msg.isTyping}, decoded.id);
        }
        else{
            ws.send(JSON.stringify({type: "error", message: "Unsupported message type"}));
        }
    });

    ws.on("close", ()=>{
        const socketsNow = roomSockets.get(roomId);
        if(socketsNow){
            socketsNow.delete(decoded.id);

            //only if the room is empty and its left active
            if(socketsNow.size===0 && activeRooms.has(roomId)){
                activeRooms.delete(roomId);
                roomSockets.delete(roomId);
            }
        }
        broadcast(roomId, {type: "presence", event: "leave", userId: decoded.id, name: decoded.name}, decoded.id);
    })
});
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";


export default function useWebSocket(url){
    const ws = useRef(null);
    const reconnectionTimer = useRef(null);
    const notificationTimer = useRef(null);
    const [notification, setNotification] = useState(null);
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState(new Map());
    const [typingUser, setTypingUser] = useState(null);
    const navigate = useNavigate();

    useEffect(()=>{
        function connect(){
            ws.current = new WebSocket(url);

            ws.current.onopen = ()=>{
                console.log("connection opened");
                if(reconnectionTimer.current){
                    clearTimeout(reconnectionTimer.current);
                    reconnectionTimer.current = null;
                }
            }

            ws.current.onmessage = (event)=>{
                let msg;
                try {
                    msg = JSON.parse(event.data.toString());
                } catch{
                    console.log("invalid data ",event.data);
                }

                if(msg.type==="chat"){
                    setMessages((prev)=> [...prev, msg]);
                }else if(msg.type==="participants"){
                    setParticipants(
                        new Map(msg.participants.map((u)=> [u.id, u]))
                    );
                }else if(msg.type==="presence"){
                    if(msg.event==="join"){
                        setParticipants((prev)=> {
                            const updated = new Map(prev);
                            updated.set(msg.user.id, msg.user);
                            return updated;
                        });

                        triggerNotification(`${msg.user.name} joined room`);
                    }
                    if(msg.event==="leave"){
                        setParticipants((prev)=>{
                            const updated = new Map(prev);
                            updated.delete(msg.userId);
                            return updated;
                        });

                        triggerNotification(`${msg.name} left the room`);
                    }
                    if(msg.event==="visibility"){
                        setParticipants((prev)=>{
                            const updated = new Map(prev);
                            const user = updated.get(msg.userId);
                            if(user){
                                updated.set(msg.userId, {...user, isVisible: msg.isVisible});
                            }
                            return updated;
                        });

                        triggerNotification(`${msg.name} is ${msg.isVisible?"online":"offline"}`);
                    }
                }else if(msg.type==="you"){
                    sessionStorage.setItem("user", JSON.stringify(msg.user));
                }else if(msg.type==="typing"){
                    setTypingUser(msg.isTyping?msg.name:null);
                }
            }

            ws.current.onerror = (err)=>{
                console.log(err);
            }

            ws.current.onclose = (event)=>{
                console.log(event.wasClean);
                if(event.code>=4000 && event.code<=4100){
                    navigate("/room");
                }
                if(!event.wasClean){
                    reconnectionTimer.current = setTimeout(connect, 3000);
                }
            }
        }

        connect();

        return ()=>{
            if(ws.current) ws.current.close();
            if(reconnectionTimer.current) reconnectionTimer.current = null;
        }
    }, [url, navigate]);

    useEffect(()=>{
        function handleVisibilityChange(){
            const visibility = document.visibilityState === "visible";

            if(ws.current && ws.current.readyState === WebSocket.OPEN){
                ws.current.send(JSON.stringify({
                    type: "presence",
                    event: "visibility",
                    isVisible: visibility
                }));
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return ()=> document.removeEventListener('visibilitychange', handleVisibilityChange);
    },[])

    function sendMessage(msg){
        if(ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({type: "chat", text: msg}));
        } else{
            console.warn("Socket not open, dropped ",msg);
        }
    }

    function sendTyping(isTyping){
        if(ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: "typing",
                isTyping
            }));
        }
    }

    function triggerNotification(text){
        setNotification(text);

        if(notificationTimer.current){
            clearTimeout(notificationTimer.current);
        }

        notificationTimer.current = setTimeout(()=>{
            setNotification(null);
            notificationTimer.current = null;
        }, 2000);
    }

    return { messages, sendMessage, participants, sendTyping, typingUser, notification };
}
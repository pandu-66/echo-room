import api from "./index";

export const verify = ()=> api.get("/verify", {
    headers: {
        Authorization: "Bearer "+ sessionStorage.getItem("token")
    }
});
export const postName = (name)=> api.post("/nickname", {name: name});
export const createRoom = ()=> api.post("/room/create", {}, {
    headers: {
        Authorization: "Bearer "+ sessionStorage.getItem("token")
    }
});
export const joinRoom = (roomId)=> api.post("/room/join", {roomId}, {
    headers: {
        Authorization: "Bearer "+ sessionStorage.getItem("token")
    }
});
export const leaveOrEndRoom = (roomId)=> api.post("/room/leave-or-end", {roomId}, {
    headers: {
        Authorization: "Bearer "+ sessionStorage.getItem("token")
    }
});
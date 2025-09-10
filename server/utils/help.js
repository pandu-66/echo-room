const jwt = require('jsonwebtoken');

const colorPicker = ()=>{
    const colors = [
    "#f06292", // pink
    "#64b5f6", // blue
    "#81c784", // green
    "#ffd54f", // yellow
    "#ba68c8", // purple
    "#4db6ac", // teal
    "#ff8a65", // orange
    "#90a4ae", // gray-blue
    "#9575cd", // violet
    "#4fc3f7", // sky blue
    ];

    const idx = Math.floor(Math.random()*10);
    return colors[idx];
};

const verifyToken = (token)=>{
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
}

const validateRoomId = (roomId)=>{
  return typeof roomId === 'string' && /^\d{6}$/.test(roomId);
}

module.exports = {colorPicker, verifyToken, validateRoomId};
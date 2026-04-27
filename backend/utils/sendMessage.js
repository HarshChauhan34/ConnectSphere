import { io, onlineUsers } from "../server.js";

const sendMessage = (receiverId, message) => {
  const receiverSocketId = onlineUsers.get(receiverId.toString());

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", message);
  }
};

export default sendMessage;

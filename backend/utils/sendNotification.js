import { io, onlineUsers } from "../server.js";

const sendNotification = (receiverId, notification) => {
  const receiverSocketId = onlineUsers.get(receiverId.toString());

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newNotification", notification);
  }
};

export default sendNotification;
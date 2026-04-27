import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";
import { SocketContext } from "./SocketContextValue";

const PROD_SOCKET_FALLBACK = "https://connectsphere-8g4j.onrender.com";
const DEV_SOCKET_FALLBACK = "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const messageListenersRef = useRef(new Set());
  const [liveNotifications, setLiveNotifications] = useState([]);

  useEffect(() => {
    if (!user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      socketRef.current = null;
      return;
    }

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.PROD ? PROD_SOCKET_FALLBACK : DEV_SOCKET_FALLBACK);
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      timeout: 12000,
    });
    socketRef.current = newSocket;

    newSocket.emit("addUser", user._id);

    newSocket.on("newNotification", (notification) => {
      setLiveNotifications((prev) => [notification, ...prev]);
      if (notification?.message) {
        toast.success(notification.message);
      }
    });
    newSocket.on("newMessage", (message) => {
      messageListenersRef.current.forEach((listener) => {
        listener(message);
      });
    });

    return () => {
      newSocket.disconnect();
      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }
    };
  }, [user?._id]);

  const subscribeToMessages = (listener) => {
    messageListenersRef.current.add(listener);

    return () => {
      messageListenersRef.current.delete(listener);
    };
  };

  return (
    <SocketContext.Provider
      value={{
        liveNotifications,
        setLiveNotifications,
        subscribeToMessages,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();
const PROD_SOCKET_FALLBACK = "https://connectsphere-8g4j.onrender.com";
const DEV_SOCKET_FALLBACK = "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [liveNotifications, setLiveNotifications] = useState([]);

  useEffect(() => {
    if (!user?._id) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.PROD ? PROD_SOCKET_FALLBACK : DEV_SOCKET_FALLBACK);
    const newSocket = io(socketUrl);

    newSocket.emit("addUser", user._id);

    newSocket.on("newNotification", (notification) => {
      setLiveNotifications((prev) => [notification, ...prev]);
      toast.success(notification.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        liveNotifications,
        setLiveNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

import { useEffect, useState } from "react";
import { Bell, Heart, MessageCircle, Trash2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteNotification,
  getNotifications,
  markNotificationsAsRead,
} from "../services/notificationService";
import { useSocket } from "../context/SocketContext";
import Avatar from "../components/Avatar";

function Notifications() {
  const { liveNotifications, setLiveNotifications } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const allNotifications = [...liveNotifications, ...notifications];

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.data.notifications);
      await markNotificationsAsRead();
      setLiveNotifications([]);
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);

      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setLiveNotifications((prev) => prev.filter((n) => n._id !== id));

      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const getIcon = (type) => {
    if (type === "like") return <Heart className="text-pink-300" size={20} />;
    if (type === "comment")
      return <MessageCircle className="text-blue-300" size={20} />;
    if (type === "follow")
      return <UserPlus className="text-green-300" size={20} />;

    return <Bell className="text-indigo-300" size={20} />;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <Bell className="text-indigo-300" />
          Notifications
        </h1>
        <p className="mt-2 text-slate-400">
          Likes, comments, and followers appear here.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center">
          Loading notifications...
        </div>
      ) : allNotifications.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center">
          <Bell className="mx-auto mb-3 text-slate-400" size={35} />
          <h2 className="text-xl font-bold">No notifications yet</h2>
          <p className="mt-2 text-slate-400">
            Your activity notifications will show here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-center gap-4 rounded-3xl border border-white/10 p-5 shadow-xl backdrop-blur-xl ${
                notification.isRead ? "bg-white/10" : "bg-indigo-500/20"
              }`}
            >
              

              <Avatar user={notification.sender} size={48} />

              <div className="min-w-0 flex-1">
                <p className="font-medium">{notification.message}</p>
                <p className="text-sm text-slate-400">
                  @{notification.sender?.username}
                </p>
              </div>

              <button
                onClick={() => handleDelete(notification._id)}
                className="rounded-full p-2 text-red-300 hover:bg-red-500/20"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;

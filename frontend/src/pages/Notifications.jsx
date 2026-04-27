import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  Trash2,
  UserPlus,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteNotification,
  getNotifications,
  markNotificationsAsRead,
} from "../services/notificationService";
import { useSocket } from "../context/useSocket";
import Avatar from "../components/Avatar";

function Notifications() {
  const { liveNotifications, setLiveNotifications } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const allNotifications = [...liveNotifications, ...notifications];

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications);
      await markNotificationsAsRead();
      setLiveNotifications([]);
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [setLiveNotifications]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchNotifications();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchNotifications]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this notification?");
    if (!confirmDelete) return;

    try {
      await deleteNotification(id);

      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setLiveNotifications((prev) => prev.filter((n) => n._id !== id));

      toast.success("Notification deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const getIcon = (type) => {
    if (type === "like") return <Heart className="fill-red-500 text-red-500" size={17} />;
    if (type === "comment")
      return <MessageCircle className="text-[#0095f6]" size={17} />;
    if (type === "follow")
      return <UserPlus className="text-[#0095f6]" size={17} />;

    return <Bell className="text-neutral-400" size={17} />;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen max-w-[630px] border-x border-neutral-800 bg-black pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-neutral-800 bg-black/90 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Bell size={24} />
              <h1 className="text-xl font-bold tracking-tight">
                Notifications
              </h1>
            </div>

            {allNotifications.length > 0 && (
              <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                {allNotifications.length}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-medium text-neutral-400">
              <Loader2 size={22} className="animate-spin" />
              Loading notifications...
            </div>
          </div>
        ) : allNotifications.length === 0 ? (
          <div className="flex min-h-[430px] items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-neutral-700">
                <Bell size={34} className="text-neutral-400" />
              </div>

              <h2 className="text-xl font-bold text-white">
                No notifications yet
              </h2>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-neutral-400">
                Your activity notifications will show here.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {allNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`group flex items-center gap-3 border-b border-neutral-800 px-4 py-3 transition hover:bg-neutral-950 ${
                  !notification.isRead ? "bg-neutral-950" : ""
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar user={notification.sender} size={48} />

                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-black">
                    {getIcon(notification.type)}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm leading-5 text-white">
                    <span className="font-semibold">
                      {notification.sender?.username}
                    </span>{" "}
                    {notification.message}
                  </p>

                  {!notification.isRead && (
                    <p className="mt-1 text-xs font-semibold text-[#0095f6]">
                      New
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(notification._id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-900 hover:text-red-500"
                  title="Delete notification"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;

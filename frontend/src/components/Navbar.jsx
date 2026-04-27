import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, Compass, Home, LogOut, Search, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Avatar from "./Avatar";
import { getNotifications } from "../services/notificationService";

function Navbar() {
  const { user, logout } = useAuth();
  const { liveNotifications } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadServerNotifications, setUnreadServerNotifications] = useState([]);

  useEffect(() => {
    if (!user?._id) return;
    if (location.pathname.startsWith("/notifications")) {
      setUnreadServerNotifications([]);
      return;
    }

    const fetchUnreadNotifications = async () => {
      try {
        const res = await getNotifications();
        const unread = (res.data.notifications || []).filter(
          (notification) => !notification.isRead
        );
        setUnreadServerNotifications(unread);
      } catch {
        // Fail silently to avoid noisy toasts from a global nav request.
        setUnreadServerNotifications([]);
      }
    };

    fetchUnreadNotifications();
  }, [location.pathname, user?._id]);

  const unreadCount = useMemo(() => {
    const unreadMap = new Map();

    unreadServerNotifications.forEach((notification) => {
      if (!notification?.isRead && notification?._id) {
        unreadMap.set(notification._id, notification);
      }
    });

    liveNotifications.forEach((notification) => {
      if (!notification?.isRead && notification?._id) {
        unreadMap.set(notification._id, notification);
      }
    });

    return unreadMap.size;
  }, [liveNotifications, unreadServerNotifications]);

  const handleLogout = () => {
    logout();
    toast.success("Logout successful");
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `relative flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-indigo-500 text-white shadow-lg"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition ${
      isActive
        ? "bg-indigo-500 text-white shadow-md"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  const NotificationBadge = () =>
    unreadCount > 0 ? (
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    ) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 font-bold shadow-lg">
            CS
          </div>
          <div>
            <h1 className="text-lg font-bold">ConnectSphere</h1>
            <p className="text-xs text-slate-400">Social Platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={navClass}>
            <Home size={18} />
            Feed
          </NavLink>

          <NavLink to="/explore" className={navClass}>
            <Compass size={18} />
            Explore
          </NavLink>

          <NavLink to="/notifications" className={navClass}>
            <Bell size={18} />
            Notifications
            <NotificationBadge />
          </NavLink>

          {/* <NavLink to={`/profile/${user?._id}`} className={navClass}>
            <User size={18} />
            Profile
          </NavLink> */}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/search")}
            className="hidden items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white md:flex"
          >
            <Search size={17} />
            <span className="ml-2">Search</span>
          </button>

          <NavLink to={`/profile/${user?._id}`} className={navClass}>
            <Avatar user={user} size={40} />
          </NavLink>

          <button
            onClick={handleLogout}
            className="rounded-2xl bg-red-500/20 p-3 text-red-300 transition hover:bg-red-500 hover:text-white"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>


      {/* mobile menu */}
      <nav className="border-t border-white/10 px-4 py-3 md:hidden">
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
          <NavLink to="/" className={mobileNavClass}>
            <Home size={18} />
            <span>Feed</span>
          </NavLink>

          <NavLink to="/explore" className={mobileNavClass}>
            <Compass size={18} />
            <span>Explore</span>
          </NavLink>

          <NavLink to="/notifications" className={mobileNavClass}>
            <NotificationBadge />
            <Bell size={18} />
            <span>Notifications</span>
          </NavLink>

          {/* <NavLink to={`/profile/${user?._id}`} className={mobileNavClass}>
            <User size={18} />
            <span>Profile</span>
          </NavLink> */}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

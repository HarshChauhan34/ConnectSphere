import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Compass,
  Home,
  LogOut,
  MessageCircle,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";
import { useSocket } from "../context/useSocket";
import Avatar from "./Avatar";
import ConfirmDialog from "./ConfirmDialog";
import { getNotifications } from "../services/notificationService";
import { getUnreadMessagesCount } from "../services/messageService";

const CountBadge = ({ count }) => {
  if (count <= 0) return null;

  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-black">
      {count > 9 ? "9+" : count}
    </span>
  );
};

function Navbar() {
  const { user, logout } = useAuth();
  const { liveNotifications, subscribeToMessages } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const isProfileRoute = location.pathname.startsWith("/profile/");

  const [unreadServerNotifications, setUnreadServerNotifications] = useState(
    [],
  );
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const res = await getNotifications();
      const unread = (res.data.notifications || []).filter(
        (notification) => !notification.isRead,
      );
      setUnreadServerNotifications(unread);
    } catch {
      setUnreadServerNotifications([]);
    }
  }, []);

  useEffect(() => {
    if (!user?._id || location.pathname.startsWith("/notifications")) return;

    const timer = setTimeout(() => {
      void fetchUnreadNotifications();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchUnreadNotifications, location.pathname, user?._id]);

  const fetchUnreadMessages = useCallback(async () => {
    try {
      const res = await getUnreadMessagesCount();
      setUnreadMessages(res.data.unreadCount || 0);
    } catch {
      setUnreadMessages(0);
    }
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    if (location.pathname.startsWith("/messages")) return;

    const timer = setTimeout(() => {
      void fetchUnreadMessages();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchUnreadMessages, location.pathname, user?._id]);

  useEffect(() => {
    if (!user?._id) return undefined;

    return subscribeToMessages((message) => {
      const isIncomingForUser = message?.receiver?._id === user._id;
      if (!isIncomingForUser) return;

      if (!location.pathname.startsWith("/messages")) {
        setUnreadMessages((prev) => prev + 1);
      }
    });
  }, [location.pathname, subscribeToMessages, user?._id]);

  const unreadCount = useMemo(() => {
    if (location.pathname.startsWith("/notifications")) return 0;

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
  }, [liveNotifications, location.pathname, unreadServerNotifications]);

  const displayUnreadMessages = location.pathname.startsWith("/messages")
    ? 0
    : unreadMessages;

  const handleLogout = () => {
    setUnreadMessages(0);
    setUnreadServerNotifications([]);
    logout();
    toast.success("Logout successful");
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `group relative flex items-center gap-4 rounded-lg px-3 py-3 text-base transition hover:bg-neutral-900 ${
      isActive ? "font-bold text-white" : "font-normal text-neutral-200"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `relative flex h-12 items-center justify-center rounded-xl transition ${
      isActive ? "text-white" : "text-neutral-300"
    }`;

  return (
    <>
      {/* Desktop Instagram Sidebar */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-61.25 border-r border-neutral-800 bg-black px-3 py-6 text-white lg:block">
        <Link to="/" className="mb-9 block px-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            ConnectSphere
          </h1>
        </Link>

        <nav className="space-y-1">
          <NavLink to="/" className={navClass}>
            <Home size={26} />
            <span>Home</span>
          </NavLink>

          <NavLink to="/search" className={navClass}>
            <Search size={26} />
            <span>Search</span>
          </NavLink>

          <NavLink to="/explore" className={navClass}>
            <Compass size={26} />
            <span>Explore</span>
          </NavLink>

          <NavLink to="/notifications" className={navClass}>
            <div className="relative">
              <Bell size={26} />
              <CountBadge count={unreadCount} />
            </div>
            <span>Notifications</span>
          </NavLink>

          <NavLink to="/messages" className={navClass}>
            <div className="relative">
              <MessageCircle size={26} />
              <CountBadge count={displayUnreadMessages} />
            </div>
            <span>Messages</span>
          </NavLink>

          <NavLink to={`/profile/${user?._id}`} className={navClass}>
            <Avatar user={user} size={28} />
            <span>Profile</span>
          </NavLink>
        </nav>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="absolute bottom-6 left-3 right-3 flex items-center gap-4 rounded-lg px-3 py-3 text-base text-neutral-200 transition hover:bg-neutral-900 hover:text-white"
        >
          <LogOut size={26} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Tablet Top Bar */}
      <header className="sticky top-0 z-50 hidden border-b border-neutral-800 bg-black/90 text-white backdrop-blur-xl md:block lg:hidden">
        <div className="mx-auto flex h-16 max-w-243.75 items-center justify-between px-5">
          <Link to="/" className="text-xl font-semibold">
            ConnectSphere
          </Link>

          <div className="flex items-center gap-5">
            <NavLink to="/" className={mobileNavClass}>
              <Home size={24} />
            </NavLink>

            <NavLink to="/search" className={mobileNavClass}>
              <Search size={24} />
            </NavLink>

            <NavLink to="/explore" className={mobileNavClass}>
              <Compass size={24} />
            </NavLink>

            <NavLink to="/notifications" className={mobileNavClass}>
              <div className="relative">
                <Bell size={24} />
                <CountBadge count={unreadCount} />
              </div>
            </NavLink>

            <NavLink to="/messages" className={mobileNavClass}>
              <div className="relative">
                <MessageCircle size={24} />
                <CountBadge count={displayUnreadMessages} />
              </div>
            </NavLink>

            <NavLink to={`/profile/${user?._id}`} className={mobileNavClass}>
              <Avatar user={user} size={28} />
            </NavLink>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-300 transition hover:bg-neutral-900 hover:text-white"
              title="Logout"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top Header - Instagram Style */}
<header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/95 text-white backdrop-blur-xl md:hidden">
  <div className="flex h-14 items-center justify-between px-4">
    {/* Logo */}
    <Link
      to="/"
      className="font-serif text-[26px] font-semibold tracking-tight text-white"
    >
      ConnectSphere
    </Link>

    {/* Right Icons */}
    <div className="flex items-center gap-5">
      <NavLink
        to="/notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full transition active:scale-95"
      >
        <Bell size={25} strokeWidth={2.2} />
        <CountBadge count={unreadCount} />
      </NavLink>

      {isProfileRoute && (
        <button
          onClick={() => setShowLogoutConfirm(true)}
          title="Logout"
          className="flex h-9 w-9 items-center justify-center rounded-full transition active:scale-95"
        >
          <LogOut size={24} strokeWidth={2.2} />
        </button>
      )}
    </div>
  </div>
</header>

      {/* Mobile Bottom Menu */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-800 bg-black/95 text-white backdrop-blur-xl md:hidden">
        <div className="grid h-14 grid-cols-5">
          <NavLink to="/" className={mobileNavClass}>
            <Home size={25} />
          </NavLink>

          <NavLink to="/explore" className={mobileNavClass}>
            <Compass size={25} />
          </NavLink>

          <NavLink to="/messages" className={mobileNavClass}>
            <div className="relative">
              <MessageCircle size={24} />
              <CountBadge count={displayUnreadMessages} />
            </div>
          </NavLink>

          <NavLink to="/search" className={mobileNavClass}>
            <Search size={25} />
          </NavLink>

          <NavLink to={`/profile/${user?._id}`} className={mobileNavClass}>
            <Avatar user={user} size={28} />
          </NavLink>
        </div>
      </nav>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Logout?"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
        danger
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          handleLogout();
        }}
      />
    </>
  );
}

export default Navbar;

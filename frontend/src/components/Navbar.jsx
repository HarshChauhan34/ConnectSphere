import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, Compass, Home, LogOut, Search, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Avatar from "./Avatar";

function Navbar() {
  const { user, logout } = useAuth();
  const { liveNotifications } = useSocket();
  const navigate = useNavigate();

  const unreadCount = liveNotifications.length;

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

      <nav className="grid grid-cols-4 gap-2 border-t border-white/10 px-3 py-3 md:hidden">
        <NavLink to="/" className={navClass}>
          <Home size={18} />
        </NavLink>

        <NavLink to="/explore" className={navClass}>
          <Compass size={18} />
        </NavLink>

        <NavLink to="/notifications" className={navClass}>
          <Bell size={18} />
          <NotificationBadge />
        </NavLink>

        <NavLink to={`/profile/${user?._id}`} className={navClass}>
          <User size={18} />
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;

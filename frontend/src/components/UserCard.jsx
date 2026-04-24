import { Link } from "react-router-dom";
import { UserPlus, UserMinus } from "lucide-react";
import toast from "react-hot-toast";
import { followUnfollowUser } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

function UserCard({ person, onFollowChange }) {
  const { user, setUser } = useAuth();

  const isFollowing = person.followers?.some((follower) => {
    const id = follower._id || follower;
    return id === user?._id;
  });

  const handleFollow = async () => {
    try {
      const res = await followUnfollowUser(person._id);

      const updatedUser = {
        ...user,
        following: res.data.isFollowing
          ? [...(user.following || []), person._id]
          : (user.following || []).filter((id) => id !== person._id),
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      onFollowChange?.(person._id, res.data.isFollowing);

      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Follow failed");
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <Link to={`/profile/${person._id}`}>
          <Avatar user={person} size={64} />
        </Link>

        <div className="min-w-0 flex-1">
          <Link to={`/profile/${person._id}`}>
            <h3 className="truncate font-bold hover:text-indigo-300">
              {person.name}
            </h3>
          </Link>

          <p className="truncate text-sm text-slate-400">@{person.username}</p>

          <p className="mt-1 line-clamp-1 text-sm text-slate-300">
            {person.bio || "No bio added yet."}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
        <div className="rounded-2xl bg-slate-950/60 p-3">
          <p className="font-bold">{person.followers?.length || 0}</p>
          <p className="text-xs text-slate-400">Followers</p>
        </div>

        <div className="rounded-2xl bg-slate-950/60 p-3">
          <p className="font-bold">{person.following?.length || 0}</p>
          <p className="text-xs text-slate-400">Following</p>
        </div>
      </div>

      <button
        onClick={handleFollow}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
          isFollowing
            ? "bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white"
            : "bg-indigo-500 text-white hover:bg-indigo-600"
        }`}
      >
        {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
        {isFollowing ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
}

export default UserCard;
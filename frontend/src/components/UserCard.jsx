import { Link } from "react-router-dom";
import { UserPlus, UserMinus } from "lucide-react";
import toast from "react-hot-toast";
import { followUnfollowUser } from "../services/userService";
import { useAuth } from "../context/useAuth";
import Avatar from "./Avatar";

function UserCard({ person, onFollowChange }) {
  const { user, setUser } = useAuth();

  const isOwnProfile = person._id === user?._id;

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
          : (user.following || []).filter((id) => {
              const resolvedId = id._id || id;
              return resolvedId !== person._id;
            }),
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
    <div className="bg-black text-white">
      <div className="flex items-center gap-3">
        <Link to={`/profile/${person._id}`} className="shrink-0">
          <div className="rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="rounded-full bg-black p-[2px]">
              <Avatar user={person} size={48} />
            </div>
          </div>
        </Link>

        <Link to={`/profile/${person._id}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {person.username}
          </p>

          <p className="truncate text-sm text-neutral-400">{person.name}</p>

          {person.bio && (
            <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
              {person.bio}
            </p>
          )}
        </Link>

        {!isOwnProfile && (
          <button
            onClick={handleFollow}
            className={`inline-flex min-w-[92px] items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition active:scale-95 ${
              isFollowing
                ? "bg-neutral-800 text-white hover:bg-neutral-700"
                : "bg-[#0095f6] text-white hover:bg-[#1877f2]"
            }`}
          >
            {isFollowing ? <UserMinus size={15} /> : <UserPlus size={15} />}
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>
    </div>
  );
}

export default UserCard;

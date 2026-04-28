import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, SearchX } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/useAuth";
import { followUnfollowUser, getUserProfile } from "../services/userService";

function Connections() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);
  const [followOverrides, setFollowOverrides] = useState({});

  const isFollowersPage = location.pathname.endsWith("/followers");

  const followingSet = useMemo(() => {
    const followingIds = (user?.following || []).map((followId) =>
      typeof followId === "string" ? followId : followId?._id
    );

    return new Set(followingIds.filter(Boolean));
  }, [user?.following]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getUserProfile(id);
        setProfile(res.data.user);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

  const users = useMemo(() => {
    if (!profile) return [];

    const list = isFollowersPage
      ? profile.followers || []
      : profile.following || [];

    return list.filter((person) => person && person._id);
  }, [isFollowersPage, profile]);

  const handleFollowToggle = async (targetId) => {
    if (!user?._id || targetId === user._id) return;

    try {
      setPendingId(targetId);

      const res = await followUnfollowUser(targetId);

      setFollowOverrides((prev) => ({
        ...prev,
        [targetId]: res.data.isFollowing,
      }));

      const updatedFollowing = res.data.isFollowing
        ? [...(user.following || []), targetId]
        : (user.following || []).filter((followId) => {
            const resolvedId =
              typeof followId === "string" ? followId : followId?._id;

            return resolvedId !== targetId;
          });

      const updatedUser = {
        ...user,
        following: updatedFollowing,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setPendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-150 items-center justify-center border-x border-neutral-800">
          <div className="flex items-center gap-3 text-sm font-medium text-neutral-300">
            <Loader2 size={22} className="animate-spin" />
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-7rem)] overflow-hidden bg-black text-white md:h-[calc(100dvh-4rem)] lg:h-dvh">
      <div className="mx-auto flex h-full max-w-150 flex-col border-x border-neutral-800 bg-black">
        {/* Instagram Like Header */}
        <div className="fixed left-1/2 top-14 z-40 w-full max-w-150 -translate-x-1/2 border-x border-b border-neutral-800 bg-black/90 backdrop-blur-xl md:top-16 lg:top-0">
          <div className="flex h-14 items-center gap-3 px-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-neutral-900"
              title="Back"
            >
              <ArrowLeft size={24} />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold text-white">
                {profile?.name || "Connections"}
              </h1>
              <p className="truncate text-xs text-neutral-400">
                @{profile?.username}
              </p>
            </div>
          </div>

          {/* Instagram Style Tabs */}
          <div className="grid grid-cols-2">
            <Link
              to={`/profile/${id}/followers`}
              className={`flex items-center justify-center gap-2 border-b py-3 text-sm font-semibold transition ${
                isFollowersPage
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-200"
              }`}
            >
              Followers
              <span className="text-xs text-neutral-400">
                {profile?.followers?.length || 0}
              </span>
            </Link>

            <Link
              to={`/profile/${id}/following`}
              className={`flex items-center justify-center gap-2 border-b py-3 text-sm font-semibold transition ${
                !isFollowersPage
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-200"
              }`}
            >
              Following
              <span className="text-xs text-neutral-400">
                {profile?.following?.length || 0}
              </span>
            </Link>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pt-27.5 pb-24 md:pb-6">
          {/* Empty State */}
          {users.length === 0 ? (
            <div className="flex min-h-105 items-center justify-center px-6 text-center">
              <div>
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-neutral-700">
                  <SearchX size={34} className="text-neutral-400" />
                </div>

                <h2 className="text-xl font-bold text-white">No users found</h2>
                <p className="mt-2 text-sm text-neutral-400">
                  This profile does not have any users in this section yet.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {users.map((person) => {
                const personId = person._id;
                const isOwnRow = personId === user?._id;
                const isFollowing =
                  followOverrides[personId] ?? followingSet.has(personId);
                const isPending = pendingId === personId;

                return (
                  <div
                    key={personId}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-neutral-950"
                  >
                    <Link to={`/profile/${personId}`} className="shrink-0">
                      <div className="rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                        <div className="rounded-full bg-black p-0.5">
                          <Avatar user={person} size={48} />
                        </div>
                      </div>
                    </Link>

                    <Link to={`/profile/${personId}`} className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {person.username}
                      </p>

                      <p className="truncate text-sm text-neutral-400">
                        {person.name}
                      </p>
                    </Link>

                    {!isOwnRow && (
                      isFollowing ? (
                        <button
                          onClick={() => navigate(`/messages/${personId}`)}
                          className="min-w-23 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-95"
                        >
                          Message
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollowToggle(personId)}
                          disabled={isPending || pendingId !== null}
                          className={`min-w-23 rounded-lg bg-[#0095f6] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#1877f2] ${
                            isPending || pendingId !== null
                              ? "cursor-not-allowed opacity-60"
                              : "active:scale-95"
                          }`}
                        >
                          {isPending ? (
                            <Loader2
                              size={16}
                              className="mx-auto animate-spin"
                            />
                          ) : (
                            "Follow"
                          )}
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
      </div>
    </div>
  );
}

export default Connections;

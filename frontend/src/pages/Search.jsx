import { useCallback, useEffect, useState } from "react";
import { Search as SearchIcon, Loader2, UserRoundSearch } from "lucide-react";
import toast from "react-hot-toast";
import UserCard from "../components/UserCard";
import { getAllUsers } from "../services/userService";

function Search() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllUsers(search);
      setUsers(res.data.users);
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchUsers();
    }, 400);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  return (
    <div className="h-[calc(100dvh-7rem)] overflow-hidden bg-black text-white md:h-[calc(100dvh-4rem)] lg:h-dvh">
      <div className="mx-auto flex h-full max-w-[630px] flex-col border-x border-neutral-800 bg-black">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-neutral-800 bg-black/90 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4">
            <SearchIcon size={24} />
            <h1 className="text-xl font-bold tracking-tight">Search</h1>
          </div>
    
          {/* Search Bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <SearchIcon
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              />

              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 pl-11 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-neutral-600"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-medium text-neutral-400">
                <Loader2 size={22} className="animate-spin" />
                Searching...
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex min-h-[430px] items-center justify-center px-6 text-center">
              <div>
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-neutral-700">
                  <UserRoundSearch size={34} className="text-neutral-400" />
                </div>

                <h2 className="text-xl font-bold text-white">No users found</h2>

                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-neutral-400">
                  Try searching by name or username.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {users.map((person) => (
                <div
                  key={person._id}
                  className="border-b border-neutral-800 p-3 transition hover:bg-neutral-950"
                >
                  <UserCard person={person} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;

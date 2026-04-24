import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import toast from "react-hot-toast";
import UserCard from "../components/UserCard";
import { getAllUsers } from "../services/userService";

function Search() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers(search);
      setUsers(res.data.users);
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <SearchIcon className="text-indigo-300" />
          Search Users
        </h1>

        <input
          type="text"
          placeholder="Search by name or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          className="mt-5 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-indigo-400"
        />
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center">
          Searching...
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-slate-400">
          No users found.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((person) => (
            <UserCard key={person._id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await register(form);
      toast.success("Account created successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500 shadow-lg">
            <UserPlus />
          </div>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-sm text-slate-300">
            Join the social media platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-purple-400"
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-purple-400"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-purple-400"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-purple-400"
          />

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-purple-500 py-3 font-semibold text-white transition hover:bg-purple-600 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-purple-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
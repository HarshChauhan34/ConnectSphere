import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    emailOrUsername: "",
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
      await login(form);
      toast.success("Login successful");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg">
            <LogIn />
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-300">
            Login to your social account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="emailOrUsername"
            placeholder="Email or Username"
            value={form.emailOrUsername}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-indigo-400"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none focus:border-indigo-400"
          />

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-500 py-3 font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-indigo-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
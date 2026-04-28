import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/useAuth";

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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-87.5">
        <div className="border border-neutral-800 bg-black px-10 py-10">
          <h1 className="mb-3 text-center text-3xl font-semibold tracking-tight">
            ConnectSphere
          </h1>

          <p className="mb-6 text-center text-sm font-semibold leading-5 text-neutral-400">
            Sign up to see photos and posts from your friends.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-sm border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-500"
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-sm border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-500"
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-sm border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-500"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-sm border border-neutral-700 bg-neutral-950 px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center rounded-lg bg-[#0095f6] py-2 text-sm font-semibold text-white transition hover:bg-[#1877f2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </span>
              ) : (
                "Sign up"
              )}
            </button>
          </form>
        </div>

        <div className="mt-3 border border-neutral-800 bg-black px-6 py-5 text-center text-sm">
          Have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#0095f6] hover:text-white"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

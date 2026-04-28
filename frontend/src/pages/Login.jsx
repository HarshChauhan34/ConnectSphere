import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    emailOrUsername: "",
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
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-8 text-white">
      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
        {/* Left Instagram Style Preview */}
        <div className="hidden lg:flex justify-center">
          <div className="relative h-140 w-90 rounded-[2.5rem] border border-neutral-800 bg-neutral-950 p-4 shadow-2xl">
            <div className="h-full overflow-hidden rounded-4xl border border-neutral-800 bg-black">
              <div className="border-b border-neutral-800 px-4 py-3">
                <h2 className="text-xl font-semibold">ConnectSphere</h2>
              </div>

              <div className="p-4">
                <div className="mb-5 flex gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="text-center">
                      <div className="h-14 w-14 rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                        <div className="h-full w-full rounded-full bg-black p-0.5">
                          <div className="h-full w-full rounded-full bg-neutral-800" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-5">
                  {[1, 2].map((item) => (
                    <div key={item} className="border-b border-neutral-800 pb-5">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                          <div className="h-full w-full rounded-full bg-black p-0.5">
                            <div className="h-full w-full rounded-full bg-neutral-800" />
                          </div>
                        </div>
                        <div>
                          <div className="h-3 w-28 rounded bg-neutral-700" />
                          <div className="mt-2 h-2 w-20 rounded bg-neutral-800" />
                        </div>
                      </div>

                      <div className="aspect-square rounded-xl bg-neutral-900" />

                      <div className="mt-3 h-3 w-32 rounded bg-neutral-700" />
                      <div className="mt-2 h-3 w-52 rounded bg-neutral-800" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Box */}
        <div className="mx-auto w-full max-w-87.5">
          <div className="border border-neutral-800 bg-black px-10 py-10">
            <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight">
              ConnectSphere
            </h1>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="emailOrUsername"
                placeholder="Email or username"
                value={form.emailOrUsername}
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
                    Logging in...
                  </span>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            <div className="my-5 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-800" />
              <span className="text-xs font-semibold uppercase text-neutral-500">
                or
              </span>
              <div className="h-px flex-1 bg-neutral-800" />
            </div>

            <Link
              to="/forgot-password"
              className="block text-center text-sm text-[#0095f6] hover:text-white"
            >
              Forgot password?
            </Link>
          </div>

          <div className="mt-3 border border-neutral-800 bg-black px-6 py-5 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#0095f6] hover:text-white"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

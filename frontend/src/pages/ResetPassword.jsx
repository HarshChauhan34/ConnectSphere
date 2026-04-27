import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { resetPassword } from "../services/authService";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword(
        token,
        form.password,
        form.confirmPassword
      );
      toast.success(res.data.message || "Password reset successful");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset password failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-[350px]">
        <div className="border border-neutral-800 bg-black px-10 py-10">
          <h1 className="mb-4 text-center text-3xl font-semibold tracking-tight">
            ConnectSphere
          </h1>

          <h2 className="text-center text-base font-semibold">
            Reset Password
          </h2>

          <p className="mt-3 text-center text-sm leading-5 text-neutral-400">
            Enter your new password below to recover your account.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="New password"
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

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-sm border border-neutral-700 bg-neutral-950 px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-500"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <button
              disabled={
                loading || !form.password.trim() || !form.confirmPassword.trim()
              }
              className="flex w-full items-center justify-center rounded-lg bg-[#0095f6] py-2 text-sm font-semibold text-white transition hover:bg-[#1877f2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </span>
              ) : (
                "Reset password"
              )}
            </button>
          </form>
        </div>

        <div className="mt-3 border border-neutral-800 bg-black px-6 py-5 text-center text-sm">
          <Link to="/login" className="font-semibold text-[#0095f6]">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
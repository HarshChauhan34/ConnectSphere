import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { forgotPassword } from "../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await forgotPassword(email);
      toast.success(res.data.message || "Reset link sent if email exists");
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
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
            Trouble logging in?
          </h2>

          <p className="mt-3 text-center text-sm leading-5 text-neutral-400">
            Enter your email and we&apos;ll send you a link to get back into
            your account.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-500"
            />

            <button
              disabled={loading || !email.trim()}
              className="flex w-full items-center justify-center rounded-lg bg-[#0095f6] py-2 text-sm font-semibold text-white transition hover:bg-[#1877f2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send reset link"
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
            to="/register"
            className="block text-center text-sm font-semibold text-white hover:text-neutral-300"
          >
            Create new account
          </Link>
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

export default ForgotPassword;
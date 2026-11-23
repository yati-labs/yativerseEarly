import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import SEO from "../components/SEO";
import { fadeUp } from "../lib/motion";
import { forgotPassword, resetPassword } from "../lib/api";

export default function ForgotPassword() {
  const [phase, setPhase] = useState("request"); // 'request' | 'reset' | 'done'
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  async function requestCode(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setPhase("reset");
    } catch (err) {
      setError(err.message || "Could not send a reset code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReset(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email.trim().toLowerCase(), code.trim(), password);
      setPhase("done");
    } catch (err) {
      setError(err.message || "Could not reset your password. Check the code and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-5 py-16 font-body text-white">
      <SEO title="Reset password — yAtIverse" description="Reset your yAtIverse account password." />

      <motion.div {...fadeUp(0)} className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src="/logo.jpeg" alt="yAtIverse" className="h-10 w-10 object-contain" />
          <span className="font-display text-lg font-bold">yAtIverse</span>
        </Link>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8">
          {phase === "request" && (
            <>
              <h1 className="font-display text-2xl font-extrabold text-white">Reset your password</h1>
              <p className="mt-1.5 text-sm text-white/40">
                Enter your account email and we'll send a 6-digit reset code.
              </p>

              <form onSubmit={requestCode} className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@startup.com"
                    className="w-full rounded-xl border border-white/10 bg-brand-bg2 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-brand-rose/20 bg-brand-rose/5 px-3.5 py-2.5 text-xs text-brand-rose">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-grad-brand px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <KeyRound size={16} />
                  {submitting ? "Sending…" : "Send reset code"}
                </button>
              </form>
            </>
          )}

          {phase === "reset" && (
            <>
              <h1 className="font-display text-2xl font-extrabold text-white">Enter your code</h1>
              <p className="mt-1.5 text-sm text-white/40">
                If an account exists for <span className="text-white/70">{email}</span>, a 6-digit code is on its
                way — it expires in 15 minutes.
              </p>

              <form onSubmit={submitReset} className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">Reset code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-xl border border-white/10 bg-brand-bg2 px-4 py-2.5 text-sm tracking-[0.3em] text-white placeholder-white/25 outline-none focus:border-brand-purple/50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">New password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl border border-white/10 bg-brand-bg2 px-4 py-2.5 pr-10 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">Confirm new password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-brand-bg2 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-brand-rose/20 bg-brand-rose/5 px-3.5 py-2.5 text-xs text-brand-rose">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-grad-brand px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <KeyRound size={16} />
                  {submitting ? "Resetting…" : "Reset password"}
                </button>

                <button
                  type="button"
                  onClick={() => setPhase("request")}
                  className="text-center text-xs font-medium text-white/40 hover:text-white/70"
                >
                  Didn't get a code? Try a different email
                </button>
              </form>
            </>
          )}

          {phase === "done" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple/10">
                <CheckCircle2 size={26} className="text-brand-purple" />
              </div>
              <h1 className="font-display text-2xl font-extrabold text-white">Password reset.</h1>
              <p className="text-sm text-white/40">
                Your password has been changed. Log in with your new password.
              </p>
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-grad-brand px-5 py-3 text-sm font-semibold text-white transition"
              >
                Go to login
              </button>
            </div>
          )}

          {phase !== "done" && (
            <p className="mt-6 text-center text-xs text-white/40">
              Remembered it after all?{" "}
              <Link to="/login" className="font-medium text-white/70 hover:text-white">
                Log in
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

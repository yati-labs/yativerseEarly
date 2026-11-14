import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Fingerprint, Mail, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import FirebaseSignIn from "../components/FirebaseSignIn";
import { fadeUp, fadeRight } from "../lib/motion";
import { useAuth, enterDemoMode } from "../lib/auth";
import { captureAttribution, track } from "../lib/tracking";

// Passkey and SSO are part of the design but neither is available yet, so by
// default they are not shown. Set to true to show them as disabled "Soon" buttons.
const SHOW_COMING_SOON_METHODS = false;

const MIN_PASSWORD = 8;

// Firebase answers "wrong password" and "no such account" with the same codes
// (on purpose), so for these we add a hint for people who had an account
// before the move to Firebase.
const WRONG_CREDENTIAL_CODES = [
  "auth/invalid-credential",
  "auth/invalid-login-credentials",
  "auth/user-not-found",
  "auth/wrong-password",
];
const UPGRADE_HINT =
  " If you haven\u2019t signed in since our upgrade, use Continue with Google, or Create account with the same email.";

const PERKS = [
  { icon: "\uD83D\uDC8D", title: "Your wellbeing data, in one place", desc: "Steps, sleep and recovery from your Ring sit next to your day." },
  { icon: "\uD83E\uDD16", title: "Your AI team, under your control", desc: "Review drafts and follow-ups. Nothing goes out until you approve it." },
  { icon: "\uD83D\uDD11", title: "One login everywhere", desc: "The same account works on the website and in the yAtI app." },
];

const labelClass = "block text-[11px] font-mono uppercase tracking-widest text-white/50 mb-2";
const inputClass =
  "w-full rounded-xl border border-solid border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm font-body text-white placeholder-white/25 outline-none transition-colors focus:border-brand-purple/60";
const primaryBtn =
  "btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100";
const googleBtn =
  "flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 font-display text-sm font-bold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50";
const linkBtn = "font-body text-sm text-white/45 transition-colors hover:text-white";

function ErrorBox({ children }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-brand-rose/25 bg-brand-rose/[0.07] px-3.5 py-3 text-xs font-body text-brand-rose">
      <AlertCircle size={14} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();

  const params = new URLSearchParams(location.search);
  const finishingEmailLink = /[?&]oobCode=/.test(location.search); // opened from an emailed sign-in link
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "signin"); // signin | signup | reset | verify
  const [email, setEmail] = useState(params.get("email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function startSignupOnce() {
    if (sessionStorage.getItem("yati_signup_started")) return;
    sessionStorage.setItem("yati_signup_started", "1");
    track("signup_start");
  }

  function switchMode(next) {
    setMode(next);
    setError(null);
    setInfo(null);
    setPassword("");
  }

  // Ads can link straight here with UTMs, so capture them on this page too.
  useEffect(() => { captureAttribution(); }, []);

  function done() {
    if (mode === "signup" || mode === "verify") track("sign_up", { method: "email_or_google" });
    refresh();
    navigate(redirectTo, { replace: true });
  }

  async function loadFirebase() {
    try {
      return await import("../lib/firebaseSession");
    } catch {
      throw new Error("Could not load sign-in. Check your connection and try again.");
    }
  }

  function showError(fb, err) {
    const message = fb && fb.friendlyAuthError ? fb.friendlyAuthError(err) : err.message;
    if (message) setError(message); // null means "they closed the window": say nothing
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    let fb = null;
    try {
      fb = await loadFirebase();
      const result = await fb.passwordSignIn(email, password, remember);
      if (result.verified) {
        done();
      } else {
        setVerifyEmail(result.email || email);
        setMode("verify");
      }
    } catch (err) {
      if (fb && WRONG_CREDENTIAL_CODES.includes(err.code)) {
        setError(fb.friendlyAuthError(err) + UPGRADE_HINT);
        return;
      }
      showError(fb, err);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) {
      setError(`Choose a password with at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setBusy(true);
    let fb = null;
    try {
      fb = await loadFirebase();
      const result = await fb.passwordSignUp(email, password, remember);
      setVerifyEmail(result.email || email);
      setCooldown(30);
      setMode("verify");
    } catch (err) {
      showError(fb, err);
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    let fb = null;
    try {
      fb = await loadFirebase();
      await fb.sendReset(email);
      // Same message whether or not the account exists, so this form can't be used to look people up.
      setInfo("If an account exists for that email, we\u2019ve sent a link to reset your password. Check your inbox and spam folder.");
    } catch (err) {
      showError(fb, err);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    let fb = null;
    try {
      fb = await loadFirebase();
      await fb.signInWithGoogle(remember);
      done();
    } catch (err) {
      showError(fb, err);
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckVerified() {
    setError(null);
    setBusy(true);
    let fb = null;
    try {
      fb = await loadFirebase();
      const result = await fb.checkVerified();
      if (result === null) {
        switchMode("signin");
        setError("Your session expired. Please sign in again.");
      } else if (result === false) {
        setError("We haven\u2019t seen the confirmation yet. Open the link in the email we sent, then try again.");
      } else {
        done();
      }
    } catch (err) {
      showError(fb, err);
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    try {
      const fb = await loadFirebase();
      await fb.resendVerification();
      setCooldown(30);
      setInfo("Sent again. It can take a minute to arrive.");
    } catch (err) {
      setError(err.code === "auth/too-many-requests" ? "Too many requests. Please wait a few minutes." : "Could not resend. Please sign in again.");
    }
  }

  function handleDemo() {
    enterDemoMode();
    refresh();
    navigate(redirectTo, { replace: true });
  }

  const titles = {
    signin: "Sign in",
    signup: "Create your account",
    reset: "Reset your password",
    verify: "Check your email",
  };
  const subtitles = {
    signin: "Welcome back. Pick up where you left off.",
    signup: "No credit card. No commitments.",
    reset: "We\u2019ll email you a link to choose a new password.",
    verify: "One quick step to protect your account.",
  };
  const showFooterStrip = !finishingEmailLink && mode !== "verify" && mode !== "reset";

  return (
    <div className="bg-brand-bg text-white min-h-screen">
      <SEO title="Sign in \u2014 yAtIverse" description="Sign in to your yAtIverse account." />
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:pt-36">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% -10%, rgba(96,92,255,.18), transparent 60%), radial-gradient(ellipse 50% 45% at 85% 90%, rgba(200,109,215,.10), transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left: context */}
          <div className="hidden lg:block">
            <motion.div {...fadeUp(0)} className="kicker mb-5">
              {mode === "signup" ? "Get started" : "Welcome back"}
            </motion.div>
            <motion.h1 {...fadeUp(0.08)} className="mb-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl">
              {mode === "signup" ? (
                <>
                  Start up right
                  <br />
                  inside the
                  <br />
                  <span className="text-gradient">yAtI-Verse.</span>
                </>
              ) : (
                <>
                  Welcome back
                  <br />
                  to the
                  <br />
                  <span className="text-gradient">yAtI-Verse.</span>
                </>
              )}
            </motion.h1>
            <motion.p {...fadeUp(0.13)} className="mb-8 max-w-md font-body text-base leading-relaxed text-white/55">
              Your Ring, your AI team and your day, all behind one sign-in.
            </motion.p>
            <motion.div {...fadeUp(0.2)} className="flex flex-col gap-3">
              {PERKS.map((p) => (
                <div key={p.title} className="glass flex items-start gap-3 rounded-xl p-4">
                  <span className="mt-0.5 flex-shrink-0 text-lg">{p.icon}</span>
                  <div>
                    <p className="mb-0.5 font-body text-sm font-semibold text-white">{p.title}</p>
                    <p className="font-body text-xs leading-relaxed text-white/48">{p.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: the card */}
          <motion.div {...fadeRight(0.1)} className="mx-auto w-full max-w-md">
            <div className="glass overflow-hidden rounded-3xl shadow-[0_0_80px_-20px_rgba(96,92,255,0.35)]">
              <div className="p-7 sm:p-8">
                <h2 className="font-display text-2xl font-bold text-white">
                  {finishingEmailLink ? "Finishing sign in" : titles[mode]}
                </h2>
                {!finishingEmailLink && <p className="mt-1 font-body text-sm text-white/50">{subtitles[mode]}</p>}

                {finishingEmailLink ? (
                  <div className="mt-6">
                    <FirebaseSignIn defaultEmail={email} onSignedIn={done} />
                  </div>
                ) : mode === "verify" ? (
                  <div className="mt-6 flex flex-col gap-4">
                    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-body text-white/60">
                      <Mail size={18} className="mt-0.5 shrink-0 text-brand-purple" />
                      <p>
                        We sent a confirmation link to <span className="font-semibold text-white">{verifyEmail}</span>. Open it, then
                        come back here. Check your spam folder if it doesn&rsquo;t arrive.
                      </p>
                    </div>
                    <button type="button" onClick={handleCheckVerified} disabled={busy} className={primaryBtn}>
                      {busy ? "Checking\u2026" : "I\u2019ve confirmed my email"}
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={cooldown > 0}
                      className="font-body text-sm font-semibold text-brand-purple transition hover:brightness-125 disabled:cursor-not-allowed disabled:text-white/30"
                    >
                      {cooldown > 0 ? `Resend email (${cooldown}s)` : "Resend email"}
                    </button>
                    {info && (
                      <p className="flex items-center gap-1.5 font-body text-sm text-brand-teal">
                        <CheckCircle2 size={15} /> {info}
                      </p>
                    )}
                    {error && <ErrorBox>{error}</ErrorBox>}
                    <button type="button" onClick={() => switchMode("signin")} className={linkBtn}>
                      &larr; Back to sign in
                    </button>
                  </div>
                ) : mode === "reset" ? (
                  <form onSubmit={handleReset} className="mt-6 flex flex-col gap-5">
                    <div>
                      <label htmlFor="email" className={labelClass}>Email address</label>
                      <input id="email" type="email" required autoComplete="email" placeholder="you@startup.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                    </div>
                    {info && (
                      <p className="flex items-start gap-1.5 font-body text-sm text-brand-teal">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> {info}
                      </p>
                    )}
                    {error && <ErrorBox>{error}</ErrorBox>}
                    <button type="submit" disabled={busy || !email} className={primaryBtn}>
                      {busy ? "Sending\u2026" : "Send reset link"}
                    </button>
                    <button type="button" onClick={() => switchMode("signin")} className={linkBtn}>
                      &larr; Back to sign in
                    </button>
                  </form>
                ) : (
                  <>
                    <form onSubmit={mode === "signup" ? handleSignUp : handleSignIn} onFocus={mode === "signup" ? startSignupOnce : undefined} className="mt-6 flex flex-col gap-5">
                      <div>
                        <label htmlFor="email" className={labelClass}>Email address</label>
                        <input id="email" type="email" required autoComplete="email" placeholder="you@startup.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label htmlFor="password" className="block font-mono text-[11px] uppercase tracking-widest text-white/50">Password</label>
                          {mode === "signin" && (
                            <button type="button" onClick={() => switchMode("reset")} className="font-body text-xs font-semibold text-brand-purple transition hover:brightness-125">
                              Forgot your password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete={mode === "signup" ? "new-password" : "current-password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`${inputClass} pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white/70"
                          >
                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                          </button>
                        </div>
                        {mode === "signup" && <p className="mt-2 font-body text-xs text-white/40">At least {MIN_PASSWORD} characters.</p>}
                      </div>

                      <label className="flex cursor-pointer items-center gap-2.5 font-body text-sm text-white/65">
                        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-[#605CFF]" />
                        Remember me on this device
                      </label>

                      {error && <ErrorBox>{error}</ErrorBox>}

                      <button type="submit" disabled={busy || !email || !password} className={primaryBtn}>
                        {busy ? "Please wait\u2026" : mode === "signup" ? "Create account" : "Sign in"}
                      </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="font-mono text-[11px] uppercase tracking-widest text-white/30">
                        {mode === "signup" ? "Or sign up with" : "Or sign in with"}
                      </span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="flex flex-col gap-3">
                      <button type="button" onClick={handleGoogle} disabled={busy} className={googleBtn}>
                        <GoogleMark />
                        Continue with Google
                      </button>
                      {SHOW_COMING_SOON_METHODS && (
                        <>
                          <button type="button" disabled className="btn-ghost w-full justify-center opacity-60">
                            <Fingerprint size={16} /> Passkey <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">SOON</span>
                          </button>
                          <button type="button" disabled className="btn-ghost w-full justify-center opacity-60">
                            <ShieldCheck size={16} /> SSO <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">SOON</span>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {showFooterStrip && (
                <div className="border-t border-white/10 bg-white/[0.02] px-7 py-5 text-center font-body text-sm text-white/50 sm:px-8">
                  {mode === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <button type="button" onClick={() => switchMode("signin")} className="font-semibold text-white transition hover:text-brand-purple">Sign in</button>
                    </>
                  ) : (
                    <>
                      New to yAtIverse?{" "}
                      <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-white transition hover:text-brand-purple">Create account</button>
                    </>
                  )}
                </div>
              )}
            </div>

            <button type="button" onClick={handleDemo} className="mx-auto mt-6 block font-body text-xs text-white/35 underline-offset-2 transition hover:text-white/70 hover:underline">
              Just looking? Explore with sample data
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/axios";
import { setToken, setRefreshToken } from "@/lib/auth";
import PublicLayout from "@/components/layout/PublicLayout";
import styles from "@/styles/LoginPage.module.css";

function createMockToken(role) {
  const b64 = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  const names = { pharmacist: "Dr. Imane (Demo)", assistant: "Sara (Demo)", cashier: "Ahmed (Demo)" };
  const header = b64({ alg: "HS256", typ: "JWT" });
  const payload = b64({
    sub: `mock-${role}`,
    name: names[role] ?? role,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  });
  return `${header}.${payload}.mock`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const PillIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M10.5 20.5L3.5 13.5a5 5 0 017.07-7.07l7 7a5 5 0 01-7.07 7.07z" />
    <line x1="8.5" y1="11.5" x2="15.5" y2="8.5" />
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ─── Decorative capsule ───────────────────────────────────────────────────────
const Capsule = ({ x, y, w, h, angle, opacity, fill }) => (
  <div
    className={styles.capsule}
    style={{ left: x, top: y, width: w, height: h, transform: `rotate(${angle}deg)`, opacity, background: fill }}
  />
);

// ─── Password strength ────────────────────────────────────────────────────────
function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className={styles.field}>
    <label className={styles.label}>{label}</label>
    {children}
  </div>
);

// ─── Input ────────────────────────────────────────────────────────────────────
const TextInput = ({ hasError, withIcon, ...props }) => (
  <input
    {...props}
    className={[
      styles.input,
      hasError ? styles.hasError : "",
      withIcon ? styles.withIcon : "",
    ]
      .filter(Boolean)
      .join(" ")}
  />
);

// ─── Password field with toggle ───────────────────────────────────────────────
const PasswordInput = ({ show, onToggle, hasError, ...props }) => (
  <div className={styles.inputWrap}>
    <TextInput type={show ? "text" : "password"} hasError={hasError} withIcon {...props} />
    <button type="button" className={styles.pwToggle} onClick={onToggle}>
      {show ? <EyeClosed /> : <EyeOpen />}
    </button>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState("login");

  // ── Login state ───────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // ── Signup state ──────────────────────────────────────────────────────────
  const [pharmacyName, setPharmacyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPw, setSignupPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [errs, setErrs] = useState({});

  const pwStrength = getStrength(signupPw);

  const switchView = (v) => {
    setLoginError("");
    setSignupError("");
    setErrs({});
    setView(v);
  };

  const handleMockLogin = (role) => {
    setToken(createMockToken(role));
    router.push("/dashboard");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail || !loginPw) {
      setLoginError("Please fill in all fields.");
      return;
    }

    setLoginLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", {
        email: loginEmail,
        password: loginPw,
      });
      setToken(data.token);
      if (data.refreshToken) setRefreshToken(data.refreshToken);
      router.push("/dashboard");
    } catch (err) {
      setLoginError(err.response?.data?.message ?? "Invalid email or password.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const e2 = {};

    if (!pharmacyName.trim()) e2.pharmacyName = true;
    if (!fullName.trim()) e2.fullName = true;
    if (!phone.trim()) e2.phone = true;
    if (!signupEmail.trim()) e2.signupEmail = true;
    if (!signupPw || pwStrength < 2) e2.signupPw = true;
    if (!confirmPw || confirmPw !== signupPw) e2.confirmPw = true;
    if (!agreed) e2.agreed = true;

    if (Object.keys(e2).length) {
      setErrs(e2);
      setSignupError("Please fix the errors above before continuing.");
      return;
    }

    setErrs({});
    setSignupError("");
    setSignupLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", {
        pharmacyName,
        fullName,
        phone,
        email: signupEmail,
        password: signupPw,
      });
      setToken(data.token);
      if (data.refreshToken) setRefreshToken(data.refreshToken);
      router.push("/dashboard");
    } catch (err) {
      setSignupError(err.response?.data?.message ?? "Registration failed. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
      <div className={styles.left}>
        <div className={styles.grid} />
        <div className={`${styles.glow} ${styles.glowBlue}`} />
        <div className={`${styles.glow} ${styles.glowGreen}`} />

        <Capsule x="68%" y="14%" w={90}  h={28} angle={-38} opacity={0.18} fill="#2563EB" />
        <Capsule x="12%" y="62%" w={70}  h={22} angle={52}  opacity={0.12} fill="#34D399" />
        <Capsule x="74%" y="55%" w={120} h={24} angle={20}  opacity={0.1}  fill="#93C5FD" />
        <Capsule x="30%" y="78%" w={60}  h={18} angle={-15} opacity={0.14} fill="#60A5FA" />
        <Capsule x="55%" y="34%" w={50}  h={16} angle={70}  opacity={0.11} fill="#A7F3D0" />

        <div className={styles.logo}>
          <div className={styles.logoIcon}><PillIcon /></div>
          <div>
            <div className={styles.logoText}>PharmaOS</div>
            <div className={styles.logoSub}>Management System</div>
          </div>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroTag}>
            <div className={styles.dot} />
            <span className={styles.tagText}>Platform Active</span>
          </div>
          <h1>
            Pharmacy<br />management,<br /><em>reimagined.</em>
          </h1>
          <p>
            A complete SaaS solution for inventory control, point-of-sale,
            supplier tracking, and AI-assisted medication recommendations —
            built for modern pharmacies.
          </p>
        </div>

        <div className={styles.stats}>
          {[
            ["FIFO",  "Batch Allocation"],
            ["AI",    "OTC Suggestions"],
            ["FR/AR", "Multilingual"],
          ].map(([num, lbl]) => (
            <div className={styles.stat} key={num}>
              <div className={styles.statNum}>{num}</div>
              <div className={styles.statLbl}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <div className={styles.right}>
        <div className={styles.formWrap}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab}${view === "login" ? ` ${styles.active}` : ""}`}
              onClick={() => switchView("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`${styles.tab}${view === "signup" ? ` ${styles.active}` : ""}`}
              onClick={() => switchView("signup")}
            >
              Create Pharmacy Account
            </button>
          </div>

          {view === "login" && (
            <div className={styles.view}>
              <div className={styles.viewHeader}>
                <h2 className={styles.heading}>Welcome back.</h2>
                <p className={styles.subheading}>Sign in to access your pharmacy dashboard.</p>
              </div>

              <form onSubmit={handleLogin} noValidate>
                <Field label="Email address">
                  <TextInput
                    type="email"
                    placeholder="pharmacist@clinique.ma"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                  />
                </Field>

                <Field label="Password">
                  <PasswordInput
                    placeholder="••••••••••"
                    value={loginPw}
                    onChange={(e) => setLoginPw(e.target.value)}
                    show={showLoginPw}
                    onToggle={() => setShowLoginPw((v) => !v)}
                    autoComplete="current-password"
                  />
                </Field>

                <div className={styles.row}>
                  <div className={styles.checkRow} onClick={() => setRemember((v) => !v)}>
                    <div className={`${styles.check}${remember ? ` ${styles.on}` : ""}`}>
                      {remember && <CheckIcon />}
                    </div>
                    <span className={styles.checkLabel}>Remember me</span>
                  </div>
                  <button type="button" className={styles.forgot}>Forgot password?</button>
                </div>

                {loginError && (
                  <div className={styles.error}>
                    <InfoIcon />{loginError}
                  </div>
                )}

                <button type="submit" className={styles.submit} disabled={loginLoading}>
                  {loginLoading
                    ? <><div className={styles.spinner} /> Signing in…</>
                    : "Sign in to dashboard"}
                </button>
              </form>

              <div className={styles.divider}>Demo quick login</div>
              <div className={styles.roles}>
                {[
                  ["Pharmacist", "pharmacist", "#1B5E42"],
                  ["Assistant",  "assistant",  "#1E3A5F"],
                  ["Cashier",    "cashier",    "#92400E"],
                ].map(([label, role, color]) => (
                  <div
                    key={role}
                    className={styles.role}
                    onClick={() => handleMockLogin(role)}
                  >
                    <div className={styles.roleDot} style={{ background: color }} />
                    {label}
                  </div>
                ))}
              </div>

              <div className={styles.notice}>
                <ShieldIcon />
                <p>
                  <strong>Need a staff account?</strong> Assistant and cashier accounts are
                  created by the pharmacist administrator from{" "}
                  <span className={styles.noticeLink}>Settings → Users</span>.
                </p>
              </div>

              <div className={styles.footer}>
                Protected by JWT authentication &amp; RBAC
                <br />
                <span className={styles.footerMuted}>PharmaOS © 2026</span>
              </div>
            </div>
          )}

          {view === "signup" && (
            <div className={styles.view}>
              <div className={styles.badge}>
                <StarIcon />
                Pharmacist / Administrator Account
              </div>

              <div className={styles.viewHeader}>
                <h2 className={styles.headingSignup}>Set up your pharmacy.</h2>
                <p className={styles.subheading}>
                  Create the administrator account for your pharmacy. You'll add assistants
                  and cashiers from the dashboard afterward.
                </p>
              </div>

              <div className={styles.info}>
                <InfoIcon />
                <span>
                  <strong>One-time setup.</strong> Only one pharmacist/administrator account
                  can be created per pharmacy. All other staff accounts are managed from{" "}
                  <strong>Settings → Users</strong>.
                </span>
              </div>

              <form onSubmit={handleSignup} noValidate>
                <Field label="Pharmacy name">
                  <TextInput
                    type="text"
                    placeholder="Pharmacie Al Amal"
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    hasError={errs.pharmacyName}
                    autoComplete="organization"
                  />
                </Field>

                <div className={styles.twoCol}>
                  <Field label="Full name">
                    <TextInput
                      type="text"
                      placeholder="Dr. Youssef Alami"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      hasError={errs.fullName}
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Phone">
                    <TextInput
                      type="tel"
                      placeholder="+212 6XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      hasError={errs.phone}
                      autoComplete="tel"
                    />
                  </Field>
                </div>

                <Field label="Email address">
                  <TextInput
                    type="email"
                    placeholder="admin@pharmacie.ma"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    hasError={errs.signupEmail}
                    autoComplete="email"
                  />
                </Field>

                <Field label="Password">
                  <PasswordInput
                    placeholder="Min. 8 characters"
                    value={signupPw}
                    onChange={(e) => setSignupPw(e.target.value)}
                    hasError={errs.signupPw}
                    show={showSignupPw}
                    onToggle={() => setShowSignupPw((v) => !v)}
                    autoComplete="new-password"
                  />
                  {signupPw && (
                    <>
                      <div className={styles.pwBar}>
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={styles.pwSeg}
                            style={{ background: i <= pwStrength ? strengthColor[pwStrength] : "#E2E8F0" }}
                          />
                        ))}
                      </div>
                      <div className={styles.pwStrengthLabel} style={{ color: strengthColor[pwStrength] }}>
                        {strengthLabel[pwStrength]}
                      </div>
                    </>
                  )}
                </Field>

                <Field label="Confirm password">
                  <PasswordInput
                    placeholder="Re-enter password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    hasError={errs.confirmPw}
                    show={showConfirmPw}
                    onToggle={() => setShowConfirmPw((v) => !v)}
                    autoComplete="new-password"
                  />
                  {errs.confirmPw && <p className={styles.fieldError}>Passwords do not match.</p>}
                </Field>

                <div className={styles.field}>
                  <div className={styles.checkRowTop} onClick={() => setAgreed((v) => !v)}>
                    <div className={[
                      styles.check,
                      agreed ? styles.on : "",
                      errs.agreed ? styles.err : "",
                    ].filter(Boolean).join(" ")}>
                      {agreed && <CheckIcon />}
                    </div>
                    <span className={styles.checkLabel}>
                      I confirm that I am the licensed pharmacist and administrator of this
                      pharmacy, and I agree to the{" "}
                      <span className={styles.termsLink}>Terms of Use</span>.
                    </span>
                  </div>
                  {errs.agreed && <p className={styles.fieldError}>You must confirm before continuing.</p>}
                </div>

                {signupError && (
                  <div className={styles.error}>
                    <InfoIcon />{signupError}
                  </div>
                )}

                <button type="submit" className={styles.submit} disabled={signupLoading}>
                  {signupLoading
                    ? <><div className={styles.spinner} /> Creating your account…</>
                    : "Create pharmacy account"}
                </button>
              </form>

              <div className={styles.footer}>
                Already have an account?{" "}
                <span className={styles.footerLink} onClick={() => switchView("login")}>
                  Sign in
                </span>
                <br />
                <span className={styles.footerMuted}>PharmaOS © 2026</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

LoginPage.getLayout = PublicLayout.getLayout;

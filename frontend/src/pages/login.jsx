"use client";

import { useState } from "react";

// ─── Icons ───────────────────────────────────────────────────────────────────
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
    className="lp-capsule"
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
  <div className="lp-field">
    <label className="lp-label">{label}</label>
    {children}
  </div>
);

// ─── Input ────────────────────────────────────────────────────────────────────
const Input = ({ hasError, withIcon, ...props }) => (
  <input
    {...props}
    className={[
      "lp-input",
      hasError ? "has-error" : "",
      withIcon ? "with-icon" : "",
    ]
      .filter(Boolean)
      .join(" ")}
  />
);

// ─── Password field with toggle ───────────────────────────────────────────────
const PasswordInput = ({ show, onToggle, hasError, ...props }) => (
  <div className="lp-input-wrap">
    <Input type={show ? "text" : "password"} hasError={hasError} withIcon {...props} />
    <button type="button" className="lp-pw-toggle" onClick={onToggle}>
      {show ? <EyeClosed /> : <EyeOpen />}
    </button>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const [view, setView] = useState("login");

  // ── Login state ──────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // ── Signup state ─────────────────────────────────────────────────────────
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

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail || !loginPw) {
      setLoginError("Please fill in all fields.");
      return;
    }

    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
      setLoginError("Demo mode — connect your auth API.");
    }, 1600);
  };

  const handleSignup = (e) => {
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
    setTimeout(() => {
      setSignupLoading(false);
      setSignupError("Demo mode — connect your auth API.");
    }, 1800);
  };

  return (
    <div className="lp-root">
      {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
      <div className="lp-left">
        <div className="lp-grid" />

        <div className="lp-glow lp-glow-blue" />
        <div className="lp-glow lp-glow-green" />

        <Capsule x="68%" y="14%" w={90} h={28} angle={-38} opacity={0.18} fill="#2563EB" />
        <Capsule x="12%" y="62%" w={70} h={22} angle={52} opacity={0.12} fill="#34D399" />
        <Capsule x="74%" y="55%" w={120} h={24} angle={20} opacity={0.1} fill="#93C5FD" />
        <Capsule x="30%" y="78%" w={60} h={18} angle={-15} opacity={0.14} fill="#60A5FA" />
        <Capsule x="55%" y="34%" w={50} h={16} angle={70} opacity={0.11} fill="#A7F3D0" />

        <div className="lp-logo">
          <div className="lp-logo-icon">
            <PillIcon />
          </div>
          <div>
            <div className="lp-logo-text">PharmaOS</div>
            <div className="lp-logo-sub">Management System</div>
          </div>
        </div>

        <div className="lp-hero">
          <div className="lp-hero-tag">
            <div className="lp-dot" />
            <span className="lp-tag-text">Platform Active</span>
          </div>
          <h1>
            Pharmacy
            <br />
            management,
            <br />
            <em>reimagined.</em>
          </h1>
          <p>
            A complete SaaS solution for inventory control, point-of-sale, supplier tracking, and
            AI-assisted medication recommendations — built for modern pharmacies.
          </p>
        </div>

        <div className="lp-stats">
          {[
            ["FIFO", "Batch Allocation"],
            ["AI", "OTC Suggestions"],
            ["FR/AR", "Multilingual"],
          ].map(([num, lbl]) => (
            <div className="lp-stat" key={num}>
              <div className="lp-stat-num">{num}</div>
              <div className="lp-stat-lbl">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
      <div className="lp-right">
        <div className="lp-form-wrap">
          <div className="lp-tabs">
            <button
              type="button"
              className={`lp-tab${view === "login" ? " active" : ""}`}
              onClick={() => switchView("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`lp-tab${view === "signup" ? " active" : ""}`}
              onClick={() => switchView("signup")}
            >
              Create Pharmacy Account
            </button>
          </div>

          {view === "login" && (
            <div className="lp-view">
              <div className="lp-view-header">
                <h2 className="lp-heading">Welcome back.</h2>
                <p className="lp-subheading">Sign in to access your pharmacy dashboard.</p>
              </div>

              <form onSubmit={handleLogin} noValidate>
                <Field label="Email address">
                  <Input
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

                <div className="lp-row">
                  <div className="lp-check-row" onClick={() => setRemember((v) => !v)}>
                    <div className={`lp-check${remember ? " on" : ""}`}>{remember && <CheckIcon />}</div>
                    <span className="lp-check-label">Remember me</span>
                  </div>
                  <button type="button" className="lp-forgot">
                    Forgot password?
                  </button>
                </div>

                {loginError && (
                  <div className="lp-error">
                    <InfoIcon />
                    {loginError}
                  </div>
                )}

                <button type="submit" className="lp-submit" disabled={loginLoading}>
                  {loginLoading ? (
                    <>
                      <div className="lp-spinner" /> Signing in…
                    </>
                  ) : (
                    "Sign in to dashboard"
                  )}
                </button>
              </form>

              <div className="lp-divider">Sign in as</div>
              <div className="lp-roles">
                {[
                  ["Pharmacist", "#2563EB"],
                  ["Assistant", "#059669"],
                  ["Cashier", "#D97706"],
                ].map(([label, color]) => (
                  <div
                    key={label}
                    className="lp-role"
                    onClick={() => setLoginEmail(`${label.toLowerCase()}@demo.ma`)}
                  >
                    <div className="lp-role-dot" style={{ background: color }} />
                    {label}
                  </div>
                ))}
              </div>

              <div className="lp-notice">
                <ShieldIcon />
                <p>
                  <strong>Need a staff account?</strong> Assistant and cashier accounts are created by the
                  pharmacist administrator from <span className="lp-notice-link">Settings → Users</span>.
                </p>
              </div>

              <div className="lp-footer">
                Protected by JWT authentication &amp; RBAC
                <br />
                <span className="lp-footer-muted">PharmaOS © 2026</span>
              </div>
            </div>
          )}

          {view === "signup" && (
            <div className="lp-view">
              <div className="lp-badge">
                <StarIcon />
                Pharmacist / Administrator Account
              </div>

              <div className="lp-view-header">
                <h2 className="lp-heading-signup">Set up your pharmacy.</h2>
                <p className="lp-subheading">
                  Create the administrator account for your pharmacy. You'll add assistants and cashiers
                  from the dashboard afterward.
                </p>
              </div>

              <div className="lp-info">
                <InfoIcon />
                <span>
                  <strong>One-time setup.</strong> Only one pharmacist/administrator account can be created
                  per pharmacy. All other staff accounts are managed from <strong>Settings → Users</strong>.
                </span>
              </div>

              <form onSubmit={handleSignup} noValidate>
                <Field label="Pharmacy name">
                  <Input
                    type="text"
                    placeholder="Pharmacie Al Amal"
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    hasError={errs.pharmacyName}
                    autoComplete="organization"
                  />
                </Field>

                <div className="lp-2col">
                  <Field label="Full name">
                    <Input
                      type="text"
                      placeholder="Dr. Youssef Alami"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      hasError={errs.fullName}
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Phone">
                    <Input
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
                  <Input
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
                      <div className="pw-bar">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="pw-seg"
                            style={{
                              background: i <= pwStrength ? strengthColor[pwStrength] : "#E2E8F0",
                            }}
                          />
                        ))}
                      </div>
                      <div
                        className="pw-strength-label"
                        style={{ color: strengthColor[pwStrength] }}
                      >
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
                  {errs.confirmPw && <p className="lp-field-error">Passwords do not match.</p>}
                </Field>

                <div className="lp-field">
                  <div className="lp-check-row-top" onClick={() => setAgreed((v) => !v)}>
                    <div className={`lp-check${agreed ? " on" : ""}${errs.agreed ? " err" : ""}`}>
                      {agreed && <CheckIcon />}
                    </div>
                    <span className="lp-check-label">
                      I confirm that I am the licensed pharmacist and administrator of this pharmacy, and
                      I agree to the <span className="lp-terms-link">Terms of Use</span>.
                    </span>
                  </div>
                  {errs.agreed && (
                    <p className="lp-field-error">You must confirm before continuing.</p>
                  )}
                </div>

                {signupError && (
                  <div className="lp-error">
                    <InfoIcon />
                    {signupError}
                  </div>
                )}

                <button type="submit" className="lp-submit" disabled={signupLoading}>
                  {signupLoading ? (
                    <>
                      <div className="lp-spinner" /> Creating your account…
                    </>
                  ) : (
                    "Create pharmacy account"
                  )}
                </button>
              </form>

              <div className="lp-footer">
                Already have an account?{" "}
                <span className="lp-footer-link" onClick={() => switchView("login")}>
                  Sign in
                </span>
                <br />
                <span className="lp-footer-muted">PharmaOS © 2026</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
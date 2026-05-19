import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import api from "@/lib/axios";
import { setToken } from "@/lib/auth";
import PublicLayout from "@/components/layout/PublicLayout";
import PublicLanguageToggle from "@/components/layout/PublicLanguageToggle";
import { ASSISTANT, CASHIER, PHARMACIST } from "@/constants/roles";
import styles from "@/styles/LoginPage.module.css";

const DEMO_ROLES = [
  {
    role: PHARMACIST,
    label: "Pharmacist",
    desc: "Full access · Approvals · Reports",
    email: "pharmacist@demo.local",
    color: "#1d3d6b",
  },
  {
    role: ASSISTANT,
    label: "Assistant",
    desc: "Reservations · Inventory · POS",
    email: "assistant@demo.local",
    color: "#0369a1",
  },
  {
    role: CASHIER,
    label: "Cashier",
    desc: "POS · Basic transactions",
    email: "cashier@demo.local",
    color: "#0f766e",
  },
];

const LOCKOUT_SECONDS = 60;
const REGISTERED_EMAILS = ["imane@pharmaos.ma", "sara@pharmaos.ma", "ahmed@pharmaos.ma"];

function createMockToken(role, email) {
  const b64 = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  const names = {
    [PHARMACIST]: "Dr. Imane (Demo)",
    [ASSISTANT]: "Sara (Demo)",
    [CASHIER]: "Ahmed (Demo)",
  };
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({
    sub: `mock-${role}`,
    name: names[role],
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 86400,
  })}.mock`;
}

function roleFromDemoEmail(email) {
  const lower = email.toLowerCase();
  if (lower === "pharmacist@demo.local") return PHARMACIST;
  if (lower === "assistant@demo.local") return ASSISTANT;
  if (lower === "cashier@demo.local") return CASHIER;
  return null;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function passwordStrength(password) {
  if (!password || password.length < 8 || /^[a-z]+$/.test(password)) {
    return { label: "Weak", value: 33, className: styles.weak };
  }
  const mixed = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const number = /\d/.test(password);
  const symbol = /[^A-Za-z0-9]/.test(password);
  if (mixed && number && symbol) return { label: "Strong", value: 100, className: styles.strong };
  return { label: "Fair", value: 66, className: styles.fair };
}

function decodeMockToken(token) {
  const parts = token?.split(".") ?? [];
  if (parts.length !== 3 || parts[2] !== "mock") return null;
  const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
}

export default function LoginPage({ protectedRedirect }) {
  const router = useRouter();
  const emailRef = useRef(null);
  const [tab, setTab] = useState("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signinErrors, setSigninErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [signinLoading, setSigninLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutLeft, setLockoutLeft] = useState(0);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotManaged, setForgotManaged] = useState(false);

  const [register, setRegister] = useState({
    pharmacyName: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });
  const [registerErrors, setRegisterErrors] = useState({});
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);

  const [demoLoading, setDemoLoading] = useState(null);

  const strength = useMemo(() => passwordStrength(register.password), [register.password]);
  const registrationValid = register.pharmacyName.trim().length >= 2
    && register.fullName.trim().length >= 2
    && isEmail(register.email)
    && register.password.length >= 8
    && register.confirmPassword === register.password
    && register.agreed;

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (protectedRedirect) toast.warning("Please sign in to continue");
  }, [protectedRedirect]);

  useEffect(() => {
    if (lockoutLeft <= 0) return undefined;
    const timer = window.setInterval(() => {
      setLockoutLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockoutLeft]);

  useEffect(() => {
    if (forgotCooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setForgotCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [forgotCooldown]);

  function validateSignin() {
    const errors = {};
    if (!email.trim()) errors.email = "Email address is required";
    else if (!isEmail(email.trim())) errors.email = "Enter a valid email address";
    if (!password) errors.password = "Password is required";
    setSigninErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSignin(event) {
    event.preventDefault();
    setAuthError("");
    setNetworkError("");
    if (lockoutLeft > 0 || !validateSignin()) return;

    setSigninLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", {
        email: email.trim(),
        password,
      });
      const user = data.user || data.data?.user;
      setToken(data.token || data.accessToken || data.data?.accessToken);
      await router.push(user?.mustChangePassword ? "/profile" : "/dashboard");
    } catch (error) {
      setPassword("");
      const status = error.response?.status;
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (status === 429) {
        setLockoutLeft(LOCKOUT_SECONDS);
        setAuthError(`Too many attempts - please wait ${LOCKOUT_SECONDS} seconds`);
      } else if (!error.response) {
        setNetworkError("Unable to connect - check your internet connection");
      } else if (status >= 500) {
        setNetworkError("Something went wrong on our end - please try again");
      } else {
        setAuthError("Invalid email or password - please try again");
      }
      if (nextAttempts >= 5) {
        setLockoutLeft(LOCKOUT_SECONDS);
      }
    } finally {
      setSigninLoading(false);
    }
  }

  async function submitForgot(event) {
    event.preventDefault();
    if (forgotCooldown > 0) return;
    setForgotSuccess(false);
    try {
      await api.post("/api/auth/forgot-password", { email: forgotEmail.trim() || email.trim() });
      setForgotSuccess(true);
      setForgotCooldown(LOCKOUT_SECONDS);
    } catch (error) {
      if (error.response?.status === 501) {
        setForgotManaged(true);
        return;
      }
      setForgotSuccess(true);
      setForgotCooldown(LOCKOUT_SECONDS);
    }
  }

  function validateRegister() {
    const errors = {};
    if (register.pharmacyName.trim().length < 2) errors.pharmacyName = "Pharmacy name must be at least 2 characters";
    if (register.pharmacyName.trim().length > 200) errors.pharmacyName = "Pharmacy name must be 200 characters or less";
    if (register.fullName.trim().length < 2) errors.fullName = "Full name must be at least 2 characters";
    if (register.fullName.trim().length > 100) errors.fullName = "Full name must be 100 characters or less";
    if (!isEmail(register.email.trim())) errors.email = "Enter a valid email address";
    if (REGISTERED_EMAILS.includes(register.email.trim().toLowerCase())) errors.email = "An account with this email already exists";
    if (register.password.length < 8) errors.password = "Password must be at least 8 characters";
    if (register.confirmPassword !== register.password) errors.confirmPassword = "Passwords must match";
    if (!register.agreed) errors.agreed = "You must confirm this before continuing";
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleRegister(event) {
    event.preventDefault();
    if (!validateRegister()) return;
    setRegisterLoading(true);
    try {
      await api.post("/api/auth/register", {
        pharmacyName: register.pharmacyName.trim(),
        fullName: register.fullName.trim(),
        email: register.email.trim(),
        password: register.password,
      });
      setRegisterSuccess({ ...register, role: PHARMACIST });
    } catch (error) {
      if (error.response?.status === 409) {
        setRegisterErrors({ email: "A pharmacy account already exists. Please sign in." });
      } else if (!error.response) {
        setRegisterSuccess({ ...register, role: PHARMACIST });
      } else {
        setRegisterErrors({ form: error.response?.data?.message ?? "Something went wrong on our end - please try again" });
      }
    } finally {
      setRegisterLoading(false);
    }
  }

  async function handleDemoLogin(demoEntry) {
    setDemoLoading(demoEntry.role);
    setAuthError("");
    setNetworkError("");
    try {
      setToken(createMockToken(demoEntry.role, demoEntry.email));
      await router.push("/dashboard");
    } finally {
      setDemoLoading(null);
    }
  }

  function signInNow() {
    setEmail(registerSuccess.email);
    setPassword("");
    setTab("signin");
    setRegisterSuccess(null);
    window.setTimeout(() => emailRef.current?.focus(), 0);
  }

  return (
    <div className={styles.page}>
      <PublicLanguageToggle />
      <section className={styles.card}>
        <BrandPanel />

        <section className={styles.formPanel}>
          <div className={styles.tabs}>
            <button type="button" className={tab === "signin" ? styles.activeTab : ""} onClick={() => setTab("signin")}>Sign In</button>
            <button type="button" className={tab === "register" ? styles.activeTab : ""} onClick={() => setTab("register")}>Create Pharmacy Account</button>
          </div>

          {tab === "signin" && (
            <div className={styles.formView}>
              <h1>Welcome back</h1>
              <p>Sign in to your PharmaMS account</p>

              {authError && <Banner tone="red">{authError}</Banner>}
              {networkError && <Banner tone="red">{networkError}<button type="button" onClick={() => setNetworkError("")}>Retry</button></Banner>}
              {lockoutLeft > 0 && <Banner tone="amber">Too many failed attempts - please wait {lockoutLeft} seconds before trying again</Banner>}

              <form onSubmit={handleSignin} noValidate>
                <TextField
                  ref={emailRef}
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  disabled={signinLoading}
                  error={signinErrors.email}
                  onChange={(value) => setEmail(value)}
                />
                <PasswordField
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  visible={showPassword}
                  disabled={signinLoading}
                  error={signinErrors.password}
                  toggle={() => setShowPassword((current) => !current)}
                  onChange={(value) => setPassword(value)}
                />
                <button type="button" className={styles.forgotLink} onClick={() => { setForgotOpen(true); setForgotEmail(email); }}>
                  Forgot Password?
                </button>

                <button type="submit" className={styles.submitBtn} disabled={signinLoading || lockoutLeft > 0}>
                  {lockoutLeft > 0 ? `Try again in ${lockoutLeft}s` : signinLoading ? <><span className={styles.spinner} />Signing in...</> : "Sign In"}
                </button>
              </form>

              {forgotOpen && (
                <ForgotPanel
                  email={forgotEmail}
                  setEmail={setForgotEmail}
                  success={forgotSuccess}
                  cooldown={forgotCooldown}
                  managed={forgotManaged}
                  onSubmit={submitForgot}
                  onClose={() => setForgotOpen(false)}
                />
              )}
            </div>
          )}

          {tab === "register" && (
            <div className={styles.formView}>
              {registerSuccess ? (
                <RegistrationSuccess data={registerSuccess} onSignIn={signInNow} />
              ) : (
                <>
                  <h1>Register your pharmacy</h1>
                  <p>Create the administrator account for your pharmacy</p>
                  <div className={styles.noteBanner}>
                    This creates the pharmacist administrator account. Staff accounts (assistants, cashiers) are added later from the Users settings page.
                  </div>
                  {registerErrors.form && <Banner tone="red">{registerErrors.form}</Banner>}
                  <form onSubmit={handleRegister} noValidate>
                    <fieldset disabled={registerLoading} className={styles.fieldset}>
                      <h2>Pharmacy Information</h2>
                      <TextField label="Pharmacy Name" placeholder="e.g. Pharmacie Al Amal" value={register.pharmacyName} error={registerErrors.pharmacyName} onChange={(value) => setRegister({ ...register, pharmacyName: value })} />

                      <h2>Administrator Account</h2>
                      <TextField label="Full Name" value={register.fullName} error={registerErrors.fullName} onChange={(value) => setRegister({ ...register, fullName: value })} />
                      <TextField label="Email Address" type="email" value={register.email} error={registerErrors.email} onChange={(value) => setRegister({ ...register, email: value })} />
                      <PasswordField label="Password" value={register.password} visible={showRegisterPassword} error={registerErrors.password} toggle={() => setShowRegisterPassword((current) => !current)} onChange={(value) => setRegister({ ...register, password: value })} />
                      {register.password && <StrengthIndicator strength={strength} />}
                      <PasswordField label="Confirm Password" value={register.confirmPassword} visible={showRegisterConfirm} error={registerErrors.confirmPassword} toggle={() => setShowRegisterConfirm((current) => !current)} onChange={(value) => setRegister({ ...register, confirmPassword: value })} />

                      <h2>Agreement</h2>
                      <label className={styles.checkboxRow}>
                        <input type="checkbox" checked={register.agreed} onChange={(event) => setRegister({ ...register, agreed: event.target.checked })} />
                        <span>I confirm that I am a licensed pharmacist and the legal owner or operator of this pharmacy</span>
                      </label>
                      {registerErrors.agreed && <em className={styles.fieldError}>{registerErrors.agreed}</em>}
                    </fieldset>
                    <button type="submit" className={styles.submitBtn} disabled={registerLoading || !registrationValid}>
                      {registerLoading ? <><span className={styles.spinner} />Creating account...</> : "Create Pharmacy Account"}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

        </section>
      </section>
    </div>
  );
}

LoginPage.getLayout = PublicLayout.getLayout;

export async function getServerSideProps(context) {
  return { props: { protectedRedirect: context.query?.redirected === "true" } };
}

function BrandPanel() {
  return (
    <aside className={styles.brandPanel}>
      <div className={styles.brandCenter}>
        <div className={styles.logoRow}>
          <img className={styles.brandLogo} src="/pharmaos-logo.svg" alt="" aria-hidden="true" />
          <strong>PharmaMS</strong>
        </div>
        <p>Automated pharmacy management</p>
      </div>
    </aside>
  );
}

function Banner({ tone, children }) {
  return <div className={`${styles.banner} ${styles[`banner_${tone}`]}`} role="alert">{children}</div>;
}

const TextField = forwardRef(function TextFieldComponent({ label, value, onChange, error, ...props }, ref) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input ref={ref} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} {...props} />
      {error && <em role="alert">{error}</em>}
    </label>
  );
});

function PasswordField({ label, value, onChange, visible, toggle, error, ...props }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.passwordWrap}>
        <input type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} {...props} />
        <button type="button" onClick={toggle} aria-label={visible ? "Hide password" : "Show password"}>
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <em role="alert">{error}</em>}
    </label>
  );
}

function StrengthIndicator({ strength }) {
  return (
    <div className={`${styles.strength} ${strength.className}`}>
      <div><span style={{ width: `${strength.value}%` }} /></div>
      <strong>{strength.label}</strong>
    </div>
  );
}

function ForgotPanel({ email, setEmail, success, cooldown, managed, onSubmit, onClose }) {
  if (managed) {
    return (
      <div className={styles.forgotPanel}>
        <h2>Reset Password</h2>
        <Banner tone="amber">Password reset is managed by your pharmacist. Contact them to reset your password.</Banner>
        <button type="button" className={styles.textBtn} onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <form className={styles.forgotPanel} onSubmit={onSubmit}>
      <h2>Reset Password</h2>
      <p>Enter your email address. If an account exists, a reset link will be sent.</p>
      <TextField label="Email Address" type="email" value={email} onChange={setEmail} />
      {success && <Banner tone="green">Check your inbox for the reset link</Banner>}
      <div className={styles.inlineActions}>
        <button type="submit" className={styles.smallPrimaryBtn} disabled={cooldown > 0}>{cooldown > 0 ? `Resend in ${cooldown}s` : "Send Reset Link"}</button>
        <button type="button" className={styles.textBtn} onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

function RegistrationSuccess({ data, onSignIn }) {
  return (
    <div className={styles.successScreen}>
      <CheckCircle2 size={46} />
      <h1>Pharmacy account created</h1>
      <p>Welcome to PharmaMS, {data.fullName}</p>
      <div className={styles.summaryBox}>
        <span>Pharmacy:<strong>{data.pharmacyName}</strong></span>
        <span>Role:<strong>Pharmacist (Administrator)</strong></span>
        <span>Email:<strong>{data.email}</strong></span>
      </div>
      <p>You can now sign in with your email and password.</p>
      <p>Add your staff accounts from Settings &gt; Users after signing in.</p>
      <button type="button" className={styles.submitBtn} onClick={onSignIn}>Sign In Now</button>
    </div>
  );
}

function LanguageToggle({ language, switchLanguage, mobile = false }) {
  return (
    <div className={`${styles.languageToggle} ${mobile ? styles.mobileLanguage : ""}`}>
      <button type="button" className={language === "fr" ? styles.languageActive : ""} onClick={() => switchLanguage("fr")}>Français</button>
      <button type="button" className={language === "ar" ? styles.languageActive : ""} onClick={() => switchLanguage("ar")}>العربية</button>
    </div>
  );
}

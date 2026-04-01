import type { AuthUser } from "../lib/types";

type AuthPanelProps = {
  user: AuthUser | null;
  email: string;
  password: string;
  mode: "login" | "register";
  authMessage: string;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onModeChange: (mode: "login" | "register") => void;
  onSubmit: () => void;
  onLogout: () => void;
};

export function AuthPanel({
  user,
  email,
  password,
  mode,
  authMessage,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onModeChange,
  onSubmit,
  onLogout
}: AuthPanelProps) {
  if (user) {
    return (
      <div className="account-card">
        <div className="account-bar">
          <span className="account-label">👋 Signed in</span>
          <span className="account-email">{user.email}</span>
        </div>
        <button type="button" className="account-action" onClick={onLogout}>
          ↩ Log out
        </button>
      </div>
    );
  }

  return (
    <div className="account-card account-form">
      <div className="weather-toggle compact-toggle">
        <button
          type="button"
          className={`toggle-chip ${mode === "login" ? "is-active" : ""}`}
          onClick={() => onModeChange("login")}
        >
          🔐 Log in
        </button>
        <button
          type="button"
          className={`toggle-chip ${mode === "register" ? "is-active" : ""}`}
          onClick={() => onModeChange("register")}
        >
          🌷 Create account
        </button>
      </div>

      <div className="manual-grid compact-grid">
        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => onEmailChange(event.target.value)} />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </label>
      </div>

      <button type="button" className="primary-button" disabled={isSubmitting} onClick={onSubmit}>
        {isSubmitting ? "Loading..." : mode === "login" ? "Log in" : "Create account"}
      </button>

      {authMessage ? <p className="helper-text">{authMessage}</p> : null}
    </div>
  );
}

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
  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <h2>{user ? "You are signed in." : "Save your outfits."}</h2>
        <p>
          {user ? user.email : "Log in or create an account."}
        </p>
      </div>

      {user ? (
        <div className="signed-in-card premium-signed-in">
          <div className="auth-status-top">
            <div>
              <p className="card-kicker">◌ Account ready</p>
              <h3>Saved looks are connected.</h3>
            </div>
            <span className="account-seal" aria-hidden="true">
              ✦
            </span>
          </div>
          <button type="button" className="ghost-button" onClick={onLogout}>
            ↘ Log out
          </button>
        </div>
      ) : (
        <div className="auth-card premium-auth-card">
          <div className="auth-segmented">
            <button
              type="button"
              className={`segment-button ${mode === "login" ? "is-active" : ""}`}
              onClick={() => onModeChange("login")}
            >
              ⌁ Log in
            </button>
            <button
              type="button"
              className={`segment-button ${mode === "register" ? "is-active" : ""}`}
              onClick={() => onModeChange("register")}
            >
              ✦ Create account
            </button>
          </div>

          <div className="manual-grid">
            <label className="input-field">
              <span>@ Email</span>
              <input value={email} onChange={(event) => onEmailChange(event.target.value)} />
            </label>
            <label className="input-field">
              <span>• Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
              />
            </label>
          </div>

          <button type="button" className="primary-button" disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? "Working..." : mode === "login" ? "Log in" : "Create account"}
          </button>

          {authMessage ? <p className="inline-message premium-message">{authMessage}</p> : null}
        </div>
      )}
    </section>
  );
}

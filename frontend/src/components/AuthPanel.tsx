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
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Saved outfits</p>
        <h2>{user ? "Your account is ready to save looks." : "Save the outfits you want to revisit."}</h2>
        <p>
          {user
            ? `Signed in as ${user.email}.`
            : "Create a quick account so your favorite outfit ideas stay with you."}
        </p>
      </div>

      {user ? (
        <div className="signed-in-card">
          <p>Nice. You can save any suggestion and come back to it later.</p>
          <button type="button" className="ghost-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      ) : (
        <div className="auth-card">
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-pill ${mode === "login" ? "is-active" : ""}`}
              onClick={() => onModeChange("login")}
            >
              Log in
            </button>
            <button
              type="button"
              className={`mode-pill ${mode === "register" ? "is-active" : ""}`}
              onClick={() => onModeChange("register")}
            >
              Create account
            </button>
          </div>
          <div className="manual-grid">
            <label>
              <span>Email</span>
              <input value={email} onChange={(event) => onEmailChange(event.target.value)} />
            </label>
            <label>
              <span>Password</span>
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
          {authMessage ? <p className="inline-message">{authMessage}</p> : null}
        </div>
      )}
    </section>
  );
}

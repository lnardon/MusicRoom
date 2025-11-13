import React, { useState } from "react";
import "./styles.module.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || "Login failed");
        setLoading(false);
        return;
      }

      const token = await res.json();
      if (typeof token === "string") {
        localStorage.setItem("token", token);
        
        window.location.reload();
      } else {
        setError("Unexpected response from server");
        setLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err || "");
      setError(message || "Network error");
      setLoading(false);
    }
  }

  return (
    <div className="loginContainer">
      <form className="loginForm" onSubmit={submit}>
        <h2>Sign in</h2>
        {error && <div className="loginError">{error}</div>}
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

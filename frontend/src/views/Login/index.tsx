import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      localStorage.setItem("token", token);
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err || "");
      setError(message || "Network error");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#161616] pointer-events-none" />
      <div className="w-full max-w-[420px] bg-[#252525] backdrop-blur-lg border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl relative z-10 opacity-0 animate-[slideUp_0.5s_ease-out_forwards]">
        <form className="flex flex-col gap-4 sm:gap-6" onSubmit={submit}>
          <h1 className="text-center text-3xl font-bold mb-1">Login</h1>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="username"
              className="text-sm font-bold text-slate-200 text-start"
            >
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
              disabled={loading}
              className="transition-all focus:scale-[1.01] focus:shadow-lg focus:shadow-blue-500/20 rounded-sm"
            />
          </div>

          <div className="flex flex-col gap-1 mb-2">
            <label
              htmlFor="password"
              className="text-sm font-bold text-slate-200 text-start"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              className="transition-all focus:scale-[1.01] focus:shadow-lg focus:shadow-blue-500/20 rounded-sm"
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-500 cursor-pointer hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
              "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0",
            )}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

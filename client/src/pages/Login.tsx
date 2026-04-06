import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/auth";
import { apiRequest } from "../lib/api";

type AuthResponse = {
  user: {
    id: string;
    username: string;
    avatarUrl?: string | null;
    status: "online" | "away" | "dnd" | "offline";
    role: "admin" | "user";
  };
  accessToken: string;
  refreshToken: string;
};

const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        accessToken: null
      });
      setSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user
      });
      navigate("/app");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-3xl border border-white/10 p-6">
        <h1 className="mb-4 font-ui text-xl text-white">LuxuryVoice Login</h1>
        <div className="space-y-3">
          <input
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#C9A84C]"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#C9A84C]"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button className="w-full" type="button" disabled={loading} onClick={() => void onSubmit()}>
            {loading ? "Signing in..." : "Enter"}
          </Button>
        </div>
        <button
          type="button"
          className="mt-4 text-xs text-[#8A8D96] hover:text-white"
          onClick={() => navigate("/register")}
        >
          Need account? Register
        </button>
      </div>
    </div>
  );
};

export default LoginPage;


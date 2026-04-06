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

const RegisterPage = (): JSX.Element => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password, inviteCode }),
        accessToken: null
      });
      setSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user
      });
      navigate("/app");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-3xl border border-white/10 p-6">
        <h1 className="mb-4 font-ui text-xl text-white">Create LuxuryVoice Account</h1>
        <div className="space-y-3">
          <input
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#2D9CDB]"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#2D9CDB]"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#2D9CDB]"
            placeholder="Invite code"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button className="w-full" type="button" disabled={loading} onClick={() => void onSubmit()}>
            {loading ? "Creating..." : "Register"}
          </Button>
          <p className="text-xs text-[#8A8D96]">Default invite: LUXURY-INVITE</p>
        </div>
        <button
          type="button"
          className="mt-4 text-xs text-[#8A8D96] hover:text-white"
          onClick={() => navigate("/login")}
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;


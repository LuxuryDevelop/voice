import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/auth";

const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
          <Button
            className="w-full"
            type="button"
            onClick={() => {
              setSession({
                accessToken: "dev-access-token",
                refreshToken: "dev-refresh-token",
                user: {
                  id: "dev-user",
                  username: username || "guest",
                  status: "online"
                }
              });
              navigate("/app");
            }}
          >
            Enter
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


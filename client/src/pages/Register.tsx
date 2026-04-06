import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

const RegisterPage = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-3xl border border-white/10 p-6">
        <h1 className="mb-4 font-ui text-xl text-white">Create LuxuryVoice Account</h1>
        <div className="space-y-3">
          <input
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#2D9CDB]"
            placeholder="Username"
          />
          <input
            type="password"
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#2D9CDB]"
            placeholder="Password"
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#2D9CDB]"
            placeholder="Invite code"
          />
          <Button className="w-full" type="button">
            Register
          </Button>
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


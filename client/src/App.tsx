import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AppPage from "./pages/App";
import { useAuthStore } from "./store/auth";

const App = (): JSX.Element => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/app" element={isAuthenticated ? <AppPage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/app" : "/login"} replace />} />
    </Routes>
  );
};

export default App;


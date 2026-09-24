import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { SupabaseAuthProvider } from "./context/SupabaseAuthContext";
import AuthGuard from "./components/AuthGuard";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SupabaseAuthProvider>
      <AuthGuard>
        <App />
      </AuthGuard>
    </SupabaseAuthProvider>
  </StrictMode>
);

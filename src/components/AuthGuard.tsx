import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check for cross-origin tokens in URL first
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(() => {
          window.history.replaceState({}, "", window.location.pathname);
          setAuthenticated(true);
          setReady(true);
        })
        .catch(() => {
          redirectToLogin();
        });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthenticated(true);
        setReady(true);
      } else {
        redirectToLogin();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        redirectToLogin();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function redirectToLogin() {
    const loginUrl = import.meta.env.VITE_WEBSITE_URL || "http://localhost:3000";
    const redirectParam = encodeURIComponent(window.location.href);
    window.location.replace(`${loginUrl}/login?redirect=${redirectParam}`);
  }

  if (!ready) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}

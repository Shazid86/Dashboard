import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    /*
     * `settled` flips to true only once the initial getSession() probe has
     * resolved or failed. Until then we must ignore a pre-hydration
     * INITIAL_SESSION(null) from onAuthStateChange — otherwise a user with a
     * perfectly valid persisted session gets bounced to the login screen on a
     * cold start or PWA relaunch. That is the "unexpected logout" bug.
     */
    let settled = false;

    // Check for cross-origin tokens in URL first
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(() => {
          window.history.replaceState({}, "", window.location.pathname);
          settled = true;
          setAuthenticated(true);
          setReady(true);
        })
        .catch(() => {
          settled = true;
          redirectToLogin();
          setReady(true);
        });
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        settled = true;
        if (session) {
          setAuthenticated(true);
        } else {
          redirectToLogin();
        }
        setReady(true);
      })
      .catch(() => {
        // A rejected probe must never strand the user on an endless spinner.
        settled = true;
        redirectToLogin();
        setReady(true);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // Only accept "signed out" once the first probe has finished.
        if (settled) redirectToLogin();
        return;
      }
      setAuthenticated(true);
      setReady(true);
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
    /*
     * Never render a blank screen while the hand-off to the login page is in
     * flight — a loading state, never an empty state.
     */
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-white/50">Taking you to the sign-in page…</p>
      </div>
    );
  }

  return <>{children}</>;
}

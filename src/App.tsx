import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientDetail from "./pages/ClientDetail";
import Links from "./pages/Links";
import Settings from "./pages/Settings";
import SettingsApps from "./pages/SettingsApps";
import Subscriptions from "./pages/Subscriptions";
import Layout from "./components/Layout";
import { supabase } from "./services/supabase";

function App() {
  const [session, setSession] = useState<any>(null);


  useEffect(() => {
    supabase.auth
      .getSession()
      .then((res: any) => {
        setSession(res?.data?.session || null);
      });

    const authRes: any = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setSession(session);
      }
    );

    return () => authRes?.data?.subscription?.unsubscribe?.();
  }, []);

  if (!session) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/client/:id" element={<ClientDetail />} />
        <Route path="/links" element={<Links />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/apps" element={<SettingsApps />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
      </Routes>
    </Layout>
  );
}

export default App;

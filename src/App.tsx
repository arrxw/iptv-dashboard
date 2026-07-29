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
import { theme } from "./theme";

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(
      ([name, value]) => {
        root.style.setProperty(
          `--color-${name}`,
          value
        );
      }
    );

    Object.entries(theme.radius).forEach(
      ([name, value]) => {
        root.style.setProperty(
          `--radius-${name}`,
          value
        );
      }
    );

    Object.entries(theme.shadows).forEach(
      ([name, value]) => {
        const variableName = name === "shadow" ? "--shadow" : `--shadow-${name}`;
        root.style.setProperty(variableName, value);
      }
    );
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
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

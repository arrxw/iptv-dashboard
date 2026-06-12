import { useEffect, useState } from "react";
import {
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientDetail from "./pages/ClientDetail";
import Tools from "./pages/Tools";
import Links from "./pages/Links";

import { supabase } from "./services/supabase";

function App() {
  const [session, setSession] =
    useState<any>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      });

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
        }
      );

    return () =>
      subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Login />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Dashboard />}
      />

      <Route
        path="/client/:id"
        element={<ClientDetail />}
      />

      <Route
        path="/tools"
        element={<Tools />}
      />

      <Route
        path="/links"
        element={<Links />}
      />
    </Routes>
  );
}

export default App;
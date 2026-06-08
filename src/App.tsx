import { useEffect, useState } from "react";
import Login from "./pages/Login";
import { supabase } from "./services/supabase";

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
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
    <div style={{ padding: "20px" }}>
      <h1>Bienvenido</h1>

      <p>Login correcto.</p>

      <button
        onClick={() =>
          supabase.auth.signOut()
        }
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export default App;
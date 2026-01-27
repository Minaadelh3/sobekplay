import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between bg-black text-white">
      <Link to="/" className="font-bold text-lg">
        SOBEK PLAY
      </Link>

      <div className="hidden md:flex items-center gap-4">
        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded bg-white text-black font-semibold"
          >
            Join the Tribe
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate("/my-list")}
              className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
            >
              My List
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded border border-white/30 hover:bg-white/10"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
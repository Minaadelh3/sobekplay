// Uncle Joy Mode: No Auth, always logged in visually
const navigate = useNavigate();

return (
  <nav className="w-full px-6 py-4 flex items-center justify-between bg-black text-white">
    <Link to="/" className="font-bold text-lg">
      SOBEK PLAY
    </Link>

    <div className="hidden md:flex items-center gap-6">
      <span className="text-sm font-medium text-white/60">
        Hi, <span className="text-white font-bold">Uncle Joy</span>
      </span>
      <button
        onClick={() => navigate("/my-list")}
        className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
      >
        My List
      </button>
    </div>
  </nav>
);
}
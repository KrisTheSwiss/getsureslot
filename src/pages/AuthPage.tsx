import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import sureslotWordmark from "@/assets/sureslot-wordmark.png";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for the confirmation link.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link to="/" aria-label="Sureslot home" className="inline-flex items-center">
            <img src={sureslotWordmark} alt="Sureslot logo" className="h-8 w-auto" loading="lazy" />
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-2xl font-bold tracking-tight mb-1">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-8">
            {isLogin
              ? "Sign in to manage your studio."
              : "Get started with Sureslot in seconds."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-body text-sm bg-card border border-border px-4 py-3 rounded-sm w-full focus:outline-none focus:ring-1 focus:ring-foreground"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-body text-sm bg-card border border-border px-4 py-3 rounded-sm w-full focus:outline-none focus:ring-1 focus:ring-foreground"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="font-body text-sm text-destructive">{error}</p>
            )}
            {message && (
              <p className="font-body text-sm text-accent-brand">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-display text-sm uppercase tracking-wider px-8 py-4 bg-foreground text-background rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <p className="font-body text-sm text-muted-foreground mt-6 text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="text-foreground underline underline-offset-4 hover:opacity-80"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;

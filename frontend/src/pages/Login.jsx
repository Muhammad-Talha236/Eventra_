import { motion } from "framer-motion";
import { Lock, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(email, password);

      toast.success(`Welcome back, ${user.name}!`);

      // Role-based redirection
      if (user.role === 'admin') {
        navigate("/admin");
      } else if (user.role === 'staff') {
        navigate("/staff");
      } else if (user.role === 'volunteer') {
        navigate("/volunteer");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual Left Section */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-hero p-12 lg:flex">
        <div className="absolute inset-0 bg-gradient-glow opacity-60" />
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/40 blur-3xl animate-float" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-md">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-[var(--ev-text)]" />
            </div>
            <span className="font-display text-xl font-bold">UniFest 2026</span>
          </div>
          <h2 className="mt-12 font-display text-5xl font-bold leading-tight">
            Your festival, <span className="gradient-aurora-text">your way.</span>
          </h2>
          <p className="mt-6 text-muted-foreground">
            Sign in to manage your tickets, schedule and notifications across all 3 days.
          </p>
        </motion.div>
      </div>

      {/* Login Form Section */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-[var(--ev-text)]" />
            </div>
            <span className="font-display text-lg font-bold">UniFest</span>
          </Link>

          <h1 className="font-display text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account to continue.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@uni.edu"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="h-11 w-full bg-gradient-primary shadow-glow">
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-foreground hover:gradient-text">
              Sign up
            </Link>
          </p>

          <div className="mt-10 glass-card p-4 text-xs text-muted-foreground">
            <p className="mb-1 font-semibold text-foreground">Important Note</p>
            Logging in will redirect you to the specific dashboard based on your assigned role (Admin, User, Staff, or Volunteer).
          </div>
        </motion.div>
      </div>
    </div>
  );
}
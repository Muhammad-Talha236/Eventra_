import { motion } from "framer-motion";
import { Lock, Mail, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const submit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await register({ name, email, password, role: 'user' });
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="order-2 flex items-center justify-center p-6 lg:order-1 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-[var(--ev-text)]" />
            </div>
            <span className="font-display text-lg font-bold">UniFest</span>
          </Link>

          <h1 className="font-display text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-muted-foreground">Join UniFest 2026 in seconds.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">University email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
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
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="h-11 w-full bg-gradient-primary shadow-glow">
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have one?{" "}
            <Link to="/login" className="font-semibold text-foreground hover:gradient-text">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="order-1 relative hidden items-center justify-center overflow-hidden bg-gradient-hero p-12 lg:order-2 lg:flex">
        <div className="absolute inset-0 bg-gradient-glow opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/40 blur-3xl animate-float" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-md">
          <h2 className="font-display text-5xl font-bold leading-tight">
            Three days. <br />
            <span className="gradient-aurora-text">Endless memories.</span>
          </h2>
          <p className="mt-6 text-muted-foreground">
            Get instant QR tickets, real-time notifications and a personal schedule built around what you love.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {["Instant digital tickets", "Personal schedule planner", "Live event notifications"].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-gradient-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

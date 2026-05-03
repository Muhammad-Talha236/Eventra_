import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut, Menu, Moon, Sparkles, Sun, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
];

const roleLabels = {
  admin: "Admin", staff: "Staff", volunteer: "Volunteer", user: "Attendee",
};

const dashboardPaths = {
  admin: "/admin", staff: "/staff", volunteer: "/volunteer",
  user: "/dashboard",
};

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardPath = user ? (dashboardPaths[user.role] || "/dashboard") : "/dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ev-bg)]">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 h-16 border-b border-[var(--ev-border)] bg-[var(--ev-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ev-accent)]">
              <Sparkles className="h-4 w-4 text-[var(--ev-text)]" />
            </div>
            <span className="text-lg font-bold text-[var(--ev-text)]">
              UniFest <span className="text-[var(--ev-accent)]">2026</span>
            </span>
          </Link>

          {/* Center nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative px-4 py-2 text-[14px] font-medium transition-colors",
                    isActive
                      ? "text-white after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:rounded-full after:bg-[var(--ev-accent)]"
                      : "text-[var(--ev-muted)] hover:text-[var(--ev-text)]",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right — conditionally show logged-in state */}
          <div className="hidden items-center gap-2 md:flex">
            <button onClick={toggle} className="rounded-lg border border-[var(--ev-border)] p-2 text-[var(--ev-muted)] hover:text-[var(--ev-text)] hover:border-[var(--ev-accent-border)] transition-colors">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {!loading && user ? (
              <>
                {/* Role badge */}
                <span className="flex items-center gap-2 rounded-lg border border-[var(--ev-border)] px-3 py-1.5 text-[12px] font-semibold text-[var(--ev-muted)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--ev-success)]" />
                  {roleLabels[user.role] || "User"}
                </span>

                {/* Dashboard link */}
                <Button asChild className="bg-[var(--ev-accent)] text-[13px] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px] px-4">
                  <Link to={dashboardPath}>Dashboard</Link>
                </Button>

                {/* Notifications */}
                <Link to="/dashboard/notifications" className="relative rounded-lg border border-[var(--ev-border)] p-2 text-[var(--ev-muted)] hover:text-[var(--ev-text)] hover:border-[var(--ev-accent-border)] transition-colors">
                  <Bell className="h-4 w-4" />
                </Link>

                {/* User avatar dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button>
                      <Avatar className="h-8 w-8 ring-2 ring-[var(--ev-accent-border)]">
                        <AvatarFallback className="bg-[var(--ev-accent)] text-[12px] font-semibold text-white">
                          {user.name?.split(" ").map((s) => s[0]).join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 border-[var(--ev-border)] bg-[var(--ev-surface)]">
                    <DropdownMenuLabel>
                      <p className="font-semibold text-[var(--ev-text)]">{user.name}</p>
                      <p className="text-[12px] text-[var(--ev-muted)]">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[var(--ev-border)]" />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to={dashboardPath}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/dashboard/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[var(--ev-border)]" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-[var(--ev-danger)] focus:text-[var(--ev-danger)]">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : !loading ? (
              <>
                <Button variant="ghost" asChild className="text-[14px] text-[var(--ev-muted)] hover:text-[var(--ev-text)]">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-[var(--ev-accent)] text-[14px] text-white hover:bg-[var(--ev-accent-hover)] rounded-[10px] px-5">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            ) : null}
          </div>

          {/* Mobile */}
          <button className="rounded-lg p-2 text-[var(--ev-muted)] hover:text-[var(--ev-text)] md:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-[var(--ev-border)] bg-[var(--ev-bg)] md:hidden"
            >
              <div className="mx-auto max-w-[1200px] space-y-1 px-6 py-4">
                {links.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[14px] text-[var(--ev-muted)] hover:text-[var(--ev-text)]">
                    {link.label}
                  </Link>
                ))}

                {!loading && user ? (
                  <div className="flex items-center justify-between border-t border-[var(--ev-border)] pt-4 mt-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[var(--ev-accent)] text-[11px] font-semibold text-white">
                          {user.name?.split(" ").map((s) => s[0]).join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--ev-text)]">{user.name}</p>
                        <p className="text-[11px] text-[var(--ev-muted)]">{roleLabels[user.role] || "User"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={dashboardPath} onClick={() => setOpen(false)} className="rounded-lg border border-[var(--ev-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--ev-muted)] hover:text-[var(--ev-text)]">
                        Dashboard
                      </Link>
                      <button onClick={() => { handleLogout(); setOpen(false); }} className="rounded-lg p-2 text-[var(--ev-danger)] hover:bg-[var(--ev-danger-bg-subtle)]">
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : !loading ? (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--ev-border)] mt-2">
                    <Button variant="outline" asChild className="border-[var(--ev-border)] text-[var(--ev-muted)]">
                      <Link to="/login">Log in</Link>
                    </Button>
                    <Button asChild className="bg-[var(--ev-accent)] text-white">
                      <Link to="/signup">Sign up</Link>
                    </Button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── CONTENT ── */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[var(--ev-border)] bg-[var(--ev-bg)]">
        <div className="mx-auto max-w-[1200px] grid gap-8 px-6 py-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ev-accent)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--ev-text)]" />
              </div>
              <span className="text-[14px] font-bold text-[var(--ev-text)]">UniFest 2026</span>
            </div>
            <p className="mt-3 text-[13px] text-[var(--ev-muted)]">
              The premier 3-day university mega event. E-sports, sports, music & more.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[14px] font-semibold text-[var(--ev-text)]">Explore</p>
            <ul className="space-y-2 text-[13px] text-[var(--ev-muted)]">
              <li><Link to="/events" className="hover:text-[var(--ev-text)] transition-colors">All Events</Link></li>
              <li><Link to="/about" className="hover:text-[var(--ev-text)] transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[14px] font-semibold text-[var(--ev-text)]">Account</p>
            <ul className="space-y-2 text-[13px] text-[var(--ev-muted)]">
              {user ? (
                <>
                  <li><Link to={dashboardPath} className="hover:text-[var(--ev-text)] transition-colors">Dashboard</Link></li>
                  <li><Link to="/dashboard/profile" className="hover:text-[var(--ev-text)] transition-colors">Profile</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="hover:text-[var(--ev-text)] transition-colors">Log in</Link></li>
                  <li><Link to="/signup" className="hover:text-[var(--ev-text)] transition-colors">Sign up</Link></li>
                </>
              )}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[14px] font-semibold text-[var(--ev-text)]">Contact</p>
            <p className="text-[13px] text-[var(--ev-muted)]">events@unifest.edu<br />+92 300 0000000</p>
          </div>
        </div>
        <div className="border-t border-[var(--ev-border)] py-6 text-center text-[12px] text-[var(--ev-muted)]">
          © 2026 UniFest. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

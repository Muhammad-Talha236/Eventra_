import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Link, useNavigate } from "react-router-dom";
import {
  Bell, ChevronDown, LogOut, Menu, Moon, Sparkles, Sun, User, X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import api from "@/api/axios";

/* ── Role-based navigation ── */
const navConfig = {
  admin: {
    visible: [
      { label: "Dashboard", to: "/admin" },
      { label: "Events", to: "/admin/events" },
      { label: "Users", to: "/admin/users" },
      { label: "Payments", to: "/admin/payments" },
    ],
    more: [
      { label: "Volunteers", to: "/admin/volunteers" },
      { label: "Tasks", to: "/admin/tasks" },
      { label: "Incidents", to: "/admin/incidents" },
      { label: "Announcements", to: "/admin/announcements" },
    ],
    profilePath: "/admin/profile",
  },
  staff: {
    visible: [
      { label: "Overview", to: "/staff" },
      { label: "Events", to: "/staff/events" },
      { label: "Payments", to: "/staff/payments" },
      { label: "Tasks", to: "/staff/tasks" },
    ],
    more: [
      { label: "Incidents", to: "/staff/incidents" },
      { label: "Volunteers", to: "/staff/volunteers" },
      { label: "Announcements", to: "/staff/announcements" },
      { label: "Scanner", to: "/staff/scanner" },
    ],
    profilePath: "/staff/profile",
  },
  volunteer: {
    visible: [
      { label: "Overview", to: "/volunteer" },
      { label: "My Tasks", to: "/volunteer/tasks" },
      { label: "Incidents", to: "/volunteer/incidents" },
      { label: "Announcements", to: "/volunteer/announcements" },
    ],
    more: [
      { label: "Schedule", to: "/volunteer/reporting" },
      { label: "Venue", to: "/volunteer/venue" },
      { label: "Profile", to: "/volunteer/profile" },
    ],
    profilePath: "/volunteer/profile",
  },
  user: {
    visible: [
      { label: "Overview", to: "/dashboard" },
      { label: "My Events", to: "/dashboard/registrations" },
      { label: "Tickets", to: "/dashboard/tickets" },
      { label: "Announcements", to: "/dashboard/announcements" },
    ],
    more: [
      { label: "Report Issue", to: "/dashboard/incidents" },
      { label: "Notifications", to: "/dashboard/notifications" },
      { label: "Schedule", to: "/dashboard/schedule" },
      { label: "Profile", to: "/dashboard/profile" },
    ],
    profilePath: "/dashboard/profile",
  },
};

const roleLabels = {
  admin: "Admin", staff: "Staff", volunteer: "Volunteer", user: "Attendee",
};

const rootPaths = ["/dashboard", "/admin", "/staff", "/volunteer"];

/* ── Active-link style helper ── */
function navLinkClass({ isActive }) {
  return cn(
    "relative px-3 py-2 text-[14px] font-medium transition-colors",
    isActive
      ? "text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-[var(--ev-accent)]"
      : "text-[var(--ev-muted)] hover:text-[var(--ev-text)]",
  );
}

export default function DashboardLayout() {
  const { user, loading, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get("/notifications");
        const count = (res.data || []).filter(n => !n.isRead).length;
        setUnreadCount(count);
      } catch {}
    };
    fetchUnread();
    // Refresh count when location changes (e.g., after marking as read)
    const interval = setInterval(fetchUnread, 30000); // every 30s
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[var(--ev-bg)]"><p className="text-[var(--ev-muted)]">Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;

  const config = navConfig[user.role] || navConfig.user;
  const allLinks = [...config.visible, ...config.more];

  const notificationsPath = user.role === "admin" ? "/admin/notifications"
    : user.role === "staff" ? "/staff/notifications"
    : user.role === "volunteer" ? "/volunteer/notifications"
    : "/dashboard/notifications";

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

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {config.visible.map((item) => (
              <NavLink key={item.to} to={item.to} end={rootPaths.includes(item.to)} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}

            {config.more.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-3 py-2 text-[14px] font-medium text-[var(--ev-muted)] hover:text-[var(--ev-text)] transition-colors">
                    More <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 border-[var(--ev-border)] bg-[var(--ev-surface)]">
                  {config.more.map((item) => (
                    <DropdownMenuItem key={item.to} asChild>
                      <NavLink to={item.to} className="block w-full cursor-pointer">
                        {item.label}
                      </NavLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Right section */}
          <div className="hidden items-center gap-3 lg:flex">
            {/* Role badge */}
            <span className="flex items-center gap-2 rounded-lg border border-[var(--ev-border)] px-3 py-1.5 text-[12px] font-semibold text-[var(--ev-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--ev-success)]" />
              {roleLabels[user.role]}
            </span>

            <button onClick={toggle} className="rounded-lg border border-[var(--ev-border)] p-2 text-[var(--ev-muted)] hover:text-[var(--ev-text)] hover:border-[var(--ev-accent-border)] transition-colors">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button onClick={() => navigate(notificationsPath)}
              className="relative rounded-lg border border-[var(--ev-border)] p-2 text-[var(--ev-muted)] hover:text-[var(--ev-text)] hover:border-[var(--ev-accent-border)] transition-colors">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ev-danger)] text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <Avatar className="h-8 w-8 ring-2 ring-[var(--ev-accent-border)]">
                    <AvatarFallback className="bg-[var(--ev-accent)] text-[12px] font-semibold text-white">
                      {user.name.split(" ").map((s) => s[0]).join("")}
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
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(config.profilePath)}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[var(--ev-border)]" />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-[var(--ev-danger)] focus:text-[var(--ev-danger)]">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile hamburger */}
          <button className="rounded-lg p-2 text-[var(--ev-muted)] hover:text-[var(--ev-text)] lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-[var(--ev-border)] bg-[var(--ev-bg)] lg:hidden"
            >
              <div className="mx-auto max-w-[1200px] space-y-1 px-6 py-4">
                {allLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={rootPaths.includes(item.to)}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "block rounded-lg px-3 py-2.5 text-[14px] font-medium",
                        isActive ? "bg-[var(--ev-accent-bg-subtle)] text-[var(--ev-text)]" : "text-[var(--ev-muted)] hover:text-[var(--ev-text)]",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <NavLink to={notificationsPath} onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-[14px] font-medium text-[var(--ev-muted)] hover:text-[var(--ev-text)]">
                  Notifications {unreadCount > 0 && <span className="ml-1 text-[var(--ev-accent)]">({unreadCount})</span>}
                </NavLink>
                <div className="flex items-center justify-between border-t border-[var(--ev-border)] pt-4 mt-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[var(--ev-accent)] text-[11px] font-semibold text-white">
                        {user.name.split(" ").map((s) => s[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--ev-text)]">{user.name}</p>
                      <p className="text-[11px] text-[var(--ev-muted)]">{roleLabels[user.role]}</p>
                    </div>
                  </div>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="rounded-lg p-2 text-[var(--ev-danger)] hover:bg-[var(--ev-danger-bg-subtle)]">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-8">
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[var(--ev-border)] bg-[var(--ev-bg)]">
        <div className="mx-auto max-w-[1200px] px-6 py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ev-accent)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--ev-text)]" />
              </div>
              <span className="text-[14px] font-bold text-[var(--ev-text)]">UniFest 2026</span>
            </div>
            <p className="text-[12px] text-[var(--ev-muted)]">© 2026 UniFest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

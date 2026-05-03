import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import PublicLayout from "@/components/layouts/PublicLayout";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import About from "./pages/About";
import EventDetails from "./pages/EventDetails";
import Events from "./pages/Events";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Analytics from "./pages/dashboard/admin/Analytics";
import Announcements from "./pages/dashboard/admin/Announcements";
import AdminIncidents from "./pages/dashboard/admin/Incidents";
import ManageEvents from "./pages/dashboard/admin/ManageEvents";
import ManageUsers from "./pages/dashboard/admin/ManageUsers";
import Payments from "./pages/dashboard/admin/Payments";
import Scheduling from "./pages/dashboard/admin/Scheduling";
import Volunteers from "./pages/dashboard/admin/Volunteers";
import ManualRegistration from "./pages/dashboard/staff/ManualRegistration";
import StaffOverview from "./pages/dashboard/staff/Overview";
import Scanner from "./pages/dashboard/staff/Scanner";
import Support from "./pages/dashboard/staff/Support";
import MyRegistrations from "./pages/dashboard/user/MyRegistrations";
import UserNotifications from "./pages/dashboard/user/Notifications";
import UserOverview from "./pages/dashboard/user/Overview";
import UserAnnouncements from "./pages/dashboard/user/Announcements";
import UserIncidents from "./pages/dashboard/user/Incidents";
import Profile from "./pages/dashboard/user/Profile";
import Schedule from "./pages/dashboard/user/Schedule";
import Tickets from "./pages/dashboard/user/Tickets";
import VolunteerIncidents from "./pages/dashboard/volunteer/Incidents";
import VolunteerOverview from "./pages/dashboard/volunteer/Overview";
import VolunteerProfile from "./pages/dashboard/volunteer/Profile";
import Reporting from "./pages/dashboard/volunteer/Reporting";
import VolunteerTasks from "./pages/dashboard/volunteer/Tasks";
import Venue from "./pages/dashboard/volunteer/Venue";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<UserOverview />} />
        <Route path="registrations" element={<MyRegistrations />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="announcements" element={<UserAnnouncements />} />
        <Route path="incidents" element={<UserIncidents />} />
        <Route path="notifications" element={<UserNotifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<Analytics />} />
        <Route path="events" element={<ManageEvents />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="payments" element={<Payments />} />
        <Route path="volunteers" element={<Volunteers />} />
        <Route path="tasks" element={<Scheduling />} />
        <Route path="scheduling" element={<Scheduling />} />
        <Route path="incidents" element={<AdminIncidents />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="notifications" element={<UserNotifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/staff" element={<DashboardLayout />}>
        <Route index element={<StaffOverview />} />
        <Route path="events" element={<ManageEvents />} />
        <Route path="registration" element={<ManualRegistration />} />
        <Route path="payments" element={<Payments />} />
        <Route path="tasks" element={<Scheduling />} />
        <Route path="incidents" element={<AdminIncidents />} />
        <Route path="volunteers" element={<Volunteers />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="scanner" element={<Scanner />} />
        <Route path="members" element={<ManageUsers />} />
        <Route path="support" element={<Support />} />
        <Route path="notifications" element={<UserNotifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/volunteer" element={<DashboardLayout />}>
        <Route index element={<VolunteerOverview />} />
        <Route path="tasks" element={<VolunteerTasks />} />
        <Route path="profile" element={<VolunteerProfile />} />
        <Route path="reporting" element={<Reporting />} />
        <Route path="venue" element={<Venue />} />
        <Route path="incidents" element={<VolunteerIncidents />} />
        <Route path="announcements" element={<UserAnnouncements />} />
        <Route path="notifications" element={<UserNotifications />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

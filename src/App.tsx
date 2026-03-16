import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SalonPage from "./pages/SalonPage";
import BookingPage from "./pages/BookingPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardStaffPage from "./pages/DashboardStaffPage";
import AuthPage from "./pages/AuthPage";
import ManageBookingPage from "./pages/ManageBookingPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import OnboardingPage from "./pages/OnboardingPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<SalonPage />} />
          <Route path="/s/:slug" element={<SalonPage />} />
          <Route path="/s/:slug/book/:staffId" element={<BookingPage />} />
          <Route path="/book/:staffId" element={<PublicBookingPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/staff" element={<DashboardStaffPage />} />
          <Route path="/dashboard/bookings" element={<DashboardPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/manage/:referenceNumber" element={<ManageBookingPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

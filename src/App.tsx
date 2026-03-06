import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import OnboardingPage from "./pages/OnboardingPage";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import SuiviPage from "./pages/SuiviPage";
import JournalPage from "./pages/JournalPage";
import BreathingPage from "./pages/BreathingPage";
import ProfilPage from "./pages/ProfilPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Composant pour les routes protégées
const PrivateRoute = ({ element }: { element: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isLoggedIn ? element : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
      <Route path="/onboarding" element={<PrivateRoute element={<OnboardingPage />} />} />
      <Route path="/home" element={<PrivateRoute element={<HomePage />} />} />
      <Route path="/chat" element={<PrivateRoute element={<ChatPage />} />} />
      <Route path="/suivi" element={<PrivateRoute element={<SuiviPage />} />} />
      <Route path="/journal" element={<PrivateRoute element={<JournalPage />} />} />
      <Route path="/respiration" element={<PrivateRoute element={<BreathingPage />} />} />
      <Route path="/profil" element={<PrivateRoute element={<ProfilPage />} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

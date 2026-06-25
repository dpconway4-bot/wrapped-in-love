import { Switch, Route, Router, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import WelcomePage from "@/pages/WelcomePage";
import AnchorPage from "@/pages/AnchorPage";
import OnboardingPage, { shouldShowOnboarding } from "@/pages/OnboardingPage";
import DayPage from "@/pages/DayPage";
import JourneyPage from "@/pages/JourneyPage";
import JournalPage from "@/pages/JournalPage";
import AccountPage from "@/pages/AccountPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function RootRedirect() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // First-time users see the Getting Started page once
        if (shouldShowOnboarding()) {
          navigate("/onboarding");
        } else {
          navigate("/home");
        }
      } else {
        navigate("/login");
      }
    }
  }, [user, loading, navigate]);

  return null;
}

function AppRoutes() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={LoginPage} />
      <Route path="/welcome" component={WelcomePage} />
      <Route path="/onboarding">
        <ProtectedRoute><OnboardingPage /></ProtectedRoute>
      </Route>

      {/* Protected routes */}
      <Route path="/home">
        <ProtectedRoute><AnchorPage /></ProtectedRoute>
      </Route>
      <Route path="/day/:day">
        <ProtectedRoute><DayPage /></ProtectedRoute>
      </Route>
      <Route path="/journey">
        <ProtectedRoute><JourneyPage /></ProtectedRoute>
      </Route>
      <Route path="/journal">
        <ProtectedRoute><JournalPage /></ProtectedRoute>
      </Route>
      <Route path="/account">
        <ProtectedRoute><AccountPage /></ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute><AdminPage /></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="grain-overlay" aria-hidden="true" />
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { WorkersProvider } from "@/context/WorkersContext";
import { TechniquesProvider } from "@/context/TechniquesContext";

// Pages
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Workers from "./pages/Workers";
import WorkerDetail from "./pages/WorkerDetail";
import Techniques from "./pages/Techniques";
import TechniqueDetail from "./pages/TechniqueDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  return <>{children}</>;
}

// Public route wrapper (redirects to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Auth routes */}
      <Route path="/signin" element={
        <PublicRoute>
          <SignIn />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <SignUp />
        </PublicRoute>
      } />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/workers" element={
        <ProtectedRoute>
          <Workers />
        </ProtectedRoute>
      } />
      <Route path="/workers/:id" element={
        <ProtectedRoute>
          <WorkerDetail />
        </ProtectedRoute>
      } />
      <Route path="/techniques" element={
        <ProtectedRoute>
          <Techniques />
        </ProtectedRoute>
      } />
      <Route path="/techniques/:id" element={
        <ProtectedRoute>
          <TechniqueDetail />
        </ProtectedRoute>
      } />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <WorkersProvider>
          <TechniquesProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TechniquesProvider>
        </WorkersProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

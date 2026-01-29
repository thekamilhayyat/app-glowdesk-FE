import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Auth } from "@/pages/Auth";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import { Clients } from "@/pages/Clients";
import { Staff } from "@/pages/Staff";
import { Services } from "@/pages/Services";
import { Appointments } from "@/pages/Appointments";
import Inventory from "@/pages/Inventory";
import Sales from "@/pages/Sales";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { NotificationDemo } from "@/pages/NotificationDemo";
import NotFound from "./pages/NotFound";
// Public booking widget routes
import { PublicApp } from "@/public/PublicApp";
import { SalonLanding } from "@/public/pages/SalonLanding";
import { BookingFlow } from "@/public/pages/BookingFlow";
import { BookingSuccess } from "@/public/pages/BookingSuccess";
import { WidgetHome } from "@/public/pages/WidgetHome";
import { App as AntApp, ConfigProvider } from "antd";
import { useTheme } from "@/components/ui/theme-provider";
import { getAntdTheme } from "@/theme";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      onError: (error) => {
        // Global error handler for React Query
        // Errors are handled per-query, but this catches unhandled ones
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('React Query error:', error);
        }
      },
    },
    mutations: {
      onError: (error) => {
        // Global mutation error handler
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('React Query mutation error:', error);
        }
      },
    },
  },
});

// Global error handler for uncaught promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Prevent default browser error handling
    event.preventDefault();
    
    // Log in development only
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Unhandled promise rejection:', event.reason);
    }
    
    // In production, errors should be handled by ErrorBoundary or toast notifications
    // This prevents white screens from uncaught promise rejections
  });
}

const AppContent = () => {
  const { theme } = useTheme();
  const currentTheme = theme === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;

  // Apply theme to Ant Design
  const antdTheme = getAntdTheme(currentTheme as "light" | "dark");

  // Listen for system theme changes
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        // Force re-render by triggering theme update
        window.dispatchEvent(new CustomEvent("theme-change"));
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return (
    <ConfigProvider theme={antdTheme}>
      <AntApp>
        <TooltipProvider>
          <ErrorBoundary>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ErrorBoundary>
                  <Routes>
                    {/* Public booking widget routes (no auth required) */}
                    {/* Simple route for testing - redirects to default salon */}
                    <Route path="/book" element={<PublicApp><WidgetHome /></PublicApp>} />
                    <Route path="/salon/:salonSlug/book" element={<PublicApp><BookingFlow /></PublicApp>} />
                    <Route path="/salon/:salonSlug" element={<PublicApp><SalonLanding /></PublicApp>} />
                    <Route path="/booking/:bookingNumber" element={<PublicApp><BookingSuccess /></PublicApp>} />
                    
                    {/* Dashboard routes (auth required) */}
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                    <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                    <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
                    <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
                    <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
                    <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                    <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/notification-demo" element={<ProtectedRoute><NotificationDemo /></ProtectedRoute>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ErrorBoundary>
              </BrowserRouter>
            </AuthProvider>
          </ErrorBoundary>
        </TooltipProvider>
      </AntApp>
    </ConfigProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;

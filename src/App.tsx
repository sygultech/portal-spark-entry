
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import AppRoutes from "@/routes";
import * as React from 'react'; // Add explicit React import

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable retries to avoid infinite loops with failed queries
      retry: false,
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

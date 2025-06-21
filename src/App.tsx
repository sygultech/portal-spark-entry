
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}>
        <AuthProvider>
          <Toaster />
        </AuthProvider>
      </RouterProvider>
    </QueryClientProvider>
  );
}

export default App;

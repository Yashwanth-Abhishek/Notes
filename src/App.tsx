import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Notebooks from "./pages/Notebooks";
import Archive from "./pages/Archive";
import Deleted from "./pages/Deleted";
import NotebookDetail from "./pages/NotebookDetail";
import NoteEdit from "./pages/NoteEdit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ThemeToggle />
        <Toaster />
        <Sonner />
        <BrowserRouter>
                           <Routes>
                   <Route path="/" element={<Index />} />
                   <Route path="/auth" element={<Auth />} />
                   <Route path="/notebooks" element={<Notebooks />} />
                   <Route path="/archive" element={<Archive />} />
                   <Route path="/deleted" element={<Deleted />} />
                   <Route path="/notebooks/:notebookId" element={<NotebookDetail />} />
                   <Route path="/notebooks/:notebookId/notes/:noteId/edit" element={<NoteEdit />} />
                   {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                   <Route path="*" element={<NotFound />} />
                 </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

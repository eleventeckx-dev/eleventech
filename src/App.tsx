import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context
import { AgroProvider } from "./contexts/AgroContext";

// Layouts
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOperacao from "./pages/admin/AdminOperacao";
import AdminProdutores from "./pages/admin/AdminProdutores";
import AdminProdutos from "./pages/admin/AdminProdutos";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";
import { SADashboard, SACompanies } from "./pages/super-admin/SuperAdminPages";
import NotFound from "./pages/NotFound";
import { 
  UserIndexRedirect,
  UserColeta, 
  UserBeneficiamento, 
  UserFinanceiro, 
  UserPerfil 
} from "./pages/user/UserPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AgroProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />

            {/* SUPER ADMIN ROUTES */}
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SADashboard />} />
              <Route path="companies" element={<SACompanies />} />
            </Route>

            {/* ADMIN ROUTES */}
            <Route path="/app" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="operacao" element={<AdminOperacao />} />
              <Route path="produtores" element={<AdminProdutores />} />
              <Route path="produtos" element={<AdminProdutos />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="configuracoes" element={<AdminConfiguracoes />} />
            </Route>

            {/* USER (COLLABORATOR) ROUTES - Mobile App */}
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserIndexRedirect />} />
              
              <Route path="coleta" element={<UserColeta />} />
              <Route path="beneficiamento" element={<UserBeneficiamento />} />
              <Route path="financeiro" element={<UserFinanceiro />} />
              <Route path="perfil" element={<UserPerfil />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AgroProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
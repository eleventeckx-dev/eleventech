import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context
import { AgroProvider } from "./contexts/AgroContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import ProducerLayout from "./layouts/ProducerLayout";

// Pages
import Login from "./pages/Login";
import LpVendas from "./pages/LpVendas";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOperacao from "./pages/admin/AdminOperacao";
import AdminFinanceiro from "./pages/admin/AdminFinanceiro";
import AdminEstoque from "./pages/admin/AdminEstoque";
import AdminProdutores from "./pages/admin/AdminProdutores";
import AdminProdutos from "./pages/admin/AdminProdutos";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";
import { SADashboard, SACompanies, SALeads } from "./pages/super-admin/SuperAdminPages";
import NotFound from "./pages/NotFound";
import { 
  UserIndexRedirect,
  UserColeta, 
  UserBeneficiamento, 
  UserPerfil 
} from "./pages/user/UserPages";
import ProducerDashboard from "./pages/producer/ProducerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AgroProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LpVendas />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/:slug" element={<Login />} />
            <Route path="/:slug" element={<Login />} />
            <Route path="/lpvendas" element={<Navigate to="/" replace />} />
            <Route path="/link/lpvendas" element={<Navigate to="/" replace />} />

            {/* MAESTRO (SUPER ADMIN) ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['maestro']} />}>
              <Route path="/super-admin" element={<SuperAdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SADashboard />} />
                <Route path="companies" element={<SACompanies />} />
                <Route path="leads" element={<SALeads />} />
              </Route>
            </Route>

            {/* ADMIN ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'collaborator']} />}>
              <Route path="/app" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="operacao" element={<AdminOperacao />} />
                <Route path="financeiro" element={<AdminFinanceiro />} />
                <Route path="estoque" element={<AdminEstoque />} />
                <Route path="produtores" element={<AdminProdutores />} />
                <Route path="produtos" element={<AdminProdutos />} />
                <Route path="usuarios" element={<AdminUsuarios />} />
                <Route path="configuracoes" element={<AdminConfiguracoes />} />
              </Route>
            </Route>

            {/* USER (COLLABORATOR) ROUTES - Mobile App */}
            <Route element={<ProtectedRoute allowedRoles={['collaborator']} />}>
              <Route path="/user" element={<UserLayout />}>
                <Route index element={<UserIndexRedirect />} />
                <Route path="coleta" element={<UserColeta />} />
                <Route path="beneficiamento" element={<UserBeneficiamento />} />
                <Route path="perfil" element={<UserPerfil />} />
              </Route>
            </Route>

            {/* PRODUCER ROUTES - Portal Simples */}
            <Route element={<ProtectedRoute allowedRoles={['producer']} />}>
              <Route path="/producer" element={<ProducerLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ProducerDashboard />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AgroProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
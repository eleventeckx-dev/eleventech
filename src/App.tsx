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
import WorkspaceLayout from "./layouts/WorkspaceLayout";

// Pages
import Login from "./pages/Login";
import { WorkspaceHome, WorkspaceColeta, WorkspaceBeneficiamento } from "./pages/workspace/WorkspacePages";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOperacao from "./pages/admin/AdminOperacao";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";
import { SADashboard, SACompanies } from "./pages/super-admin/SuperAdminPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Placeholder apenas para as rotas móveis que ainda estão em desenvolvimento
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400">
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500">Módulo em desenvolvimento</p>
    </div>
  </div>
);

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

            {/* ADMIN ROUTES (Clean & Consistente) */}
            <Route path="/app" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="operacao" element={<AdminOperacao />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="configuracoes" element={<AdminConfiguracoes />} />
            </Route>

            {/* WORKSPACE (COLLABORATOR) ROUTES */}
            <Route path="/workspace" element={<WorkspaceLayout />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<WorkspaceHome />} />
              <Route path="coleta" element={<WorkspaceColeta />} />
              <Route path="beneficiamento" element={<WorkspaceBeneficiamento />} />
              <Route path="financeiro" element={<Placeholder title="App Financeiro" />} />
              <Route path="pagamentos" element={<Placeholder title="App Pagamentos" />} />
              <Route path="minhas-cargas" element={<Placeholder title="Minhas Cargas Realizadas" />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AgroProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
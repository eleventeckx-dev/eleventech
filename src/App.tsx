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
import { SADashboard, SACompanies } from "./pages/super-admin/SuperAdminPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Placeholders minimalistas para as rotas que não implementamos os arquivos gigantes
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

            {/* ADMIN ROUTES */}
            <Route path="/app" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              
              {/* Novas Rotas do Menu (Visíveis) */}
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="operacao" element={<Placeholder title="Central de Operações" />} />
              <Route path="cargas" element={<Placeholder title="Gestão de Cargas" />} />
              <Route path="produtores" element={<Placeholder title="Gestão de Produtores" />} />
              <Route path="usuarios" element={<Placeholder title="Gestão de Usuários" />} />
              <Route path="relatorios" element={<Placeholder title="Relatórios e Dashboards" />} />
              <Route path="configuracoes" element={<Placeholder title="Configurações do Sistema" />} />

              {/* Rotas Antigas (Mantidas internamente para não quebrar lógica, fora do menu) */}
              <Route path="coleta" element={<Placeholder title="Gestão de Coletas" />} />
              <Route path="beneficiamento" element={<Placeholder title="Gestão de Beneficiamento" />} />
              <Route path="financeiro" element={<Placeholder title="Fechamento Financeiro" />} />
              <Route path="pagamentos" element={<Placeholder title="Liberação de Pagamentos" />} />
              <Route path="colaboradores" element={<Placeholder title="Gestão de Colaboradores (Antigo)" />} />
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
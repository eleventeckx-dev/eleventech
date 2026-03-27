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
import RoleSelector from "./pages/RoleSelector";
import { WorkspaceHome, WorkspaceColeta, WorkspaceBeneficiamento } from "./pages/workspace/WorkspacePages";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Placeholders minimalistas para as rotas que não implementamos os arquivos gigantes
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <h2 className="text-2xl font-bold text-gray-300 mb-2">{title}</h2>
    <p>Módulo em desenvolvimento</p>
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
            <Route path="/" element={<RoleSelector />} />

            {/* SUPER ADMIN ROUTES */}
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Placeholder title="Dashboard SaaS" />} />
              <Route path="companies" element={<Placeholder title="Gestão de Empresas Clientes" />} />
              <Route path="admins" element={<Placeholder title="Gestão de Admins" />} />
              <Route path="plans" element={<Placeholder title="Planos de Assinatura" />} />
              <Route path="modules" element={<Placeholder title="Módulos" />} />
              <Route path="audit" element={<Placeholder title="Auditoria" />} />
              <Route path="settings" element={<Placeholder title="Configurações SaaS" />} />
            </Route>

            {/* ADMIN ROUTES */}
            <Route path="/app" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="cargas" element={<Placeholder title="Histórico e Timeline de Cargas" />} />
              <Route path="coleta" element={<Placeholder title="Gestão de Coletas" />} />
              <Route path="beneficiamento" element={<Placeholder title="Gestão de Beneficiamento" />} />
              <Route path="financeiro" element={<Placeholder title="Fechamento Financeiro" />} />
              <Route path="pagamentos" element={<Placeholder title="Liberação de Pagamentos" />} />
              <Route path="produtores" element={<Placeholder title="Cadastro de Produtores" />} />
              <Route path="colaboradores" element={<Placeholder title="Gestão de Acesso" />} />
              <Route path="relatorios" element={<Placeholder title="Relatórios e DRE" />} />
              <Route path="configuracoes" element={<Placeholder title="Configurações da Empresa" />} />
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
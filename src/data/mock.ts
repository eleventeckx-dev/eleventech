import { Company, User, Producer, Load, Product } from '../types';

export const MOCK_COMPANIES: Company[] = [
  { id: 'comp_1', name: 'AgroSul Exportações', document: '12.345.678/0001-90', status: 'active', createdAt: '2023-01-10T00:00:00Z', updatedAt: '2023-01-10T00:00:00Z' },
  { id: 'comp_2', name: 'Fazendas do Vale', document: '98.765.432/0001-10', status: 'active', createdAt: '2023-03-15T00:00:00Z', updatedAt: '2023-03-15T00:00:00Z' },
];

export const MOCK_USERS: User[] = [
  // Super Admin atualizado conforme solicitado
  { id: 'usr_sa1', name: 'Plataforma Admin', email: 'sadmin@agro.com', role: 'super_admin', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
  
  // Demais usuários para testes
  { id: 'usr_a1', companyId: 'comp_1', name: 'Carlos Gerente', email: 'carlos@agrosul.com', role: 'admin', createdAt: '2023-01-10T00:00:00Z', updatedAt: '2023-01-10T00:00:00Z' },
  { 
    id: 'usr_c1', companyId: 'comp_1', name: 'João Coletor', email: 'joao@agrosul.com', role: 'collaborator', 
    permissions: { id: 'perm_1', companyId: 'comp_1', userId: 'usr_c1', canCollect: true, canProcess: true, canManageFinancial: false, canMarkPayment: false, canViewReports: false, createdAt: '2023-01-11T00:00:00Z', updatedAt: '2023-01-11T00:00:00Z' },
    createdAt: '2023-01-11T00:00:00Z', updatedAt: '2023-01-11T00:00:00Z' 
  },
  { 
    id: 'usr_c2', companyId: 'comp_1', name: 'Maria Financeiro', email: 'maria@agrosul.com', role: 'collaborator', 
    permissions: { id: 'perm_2', companyId: 'comp_1', userId: 'usr_c2', canCollect: false, canProcess: false, canManageFinancial: true, canMarkPayment: true, canViewReports: true, createdAt: '2023-01-11T00:00:00Z', updatedAt: '2023-01-11T00:00:00Z' },
    createdAt: '2023-01-11T00:00:00Z', updatedAt: '2023-01-11T00:00:00Z' 
  },
];

export const MOCK_PRODUCERS: Producer[] = [
  { id: 'prod_1', companyId: 'comp_1', name: 'José da Silva', document: '111.222.333-44', property: 'Sítio Boa Vista', phone: '(11) 99999-1111', createdAt: '2023-02-01T00:00:00Z', updatedAt: '2023-02-01T00:00:00Z' },
  { id: 'prod_2', companyId: 'comp_1', name: 'Antônio Santos', document: '222.333.444-55', property: 'Fazenda Esperança', phone: '(11) 98888-2222', createdAt: '2023-02-05T00:00:00Z', updatedAt: '2023-02-05T00:00:00Z' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'prod_item_1', companyId: 'comp_1', name: 'Tomate Carmem', category: 'Vegetais', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop', createdAt: '2023-02-01T00:00:00Z', updatedAt: '2023-02-01T00:00:00Z' },
  { id: 'prod_item_2', companyId: 'comp_1', name: 'Manga Palmer', category: 'Frutas', imageUrl: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=200&h=200&fit=crop', createdAt: '2023-02-01T00:00:00Z', updatedAt: '2023-02-01T00:00:00Z' },
];

export const MOCK_LOADS: Load[] = [
  {
    id: 'load_1',
    companyId: 'comp_1',
    producerId: 'prod_1',
    status: 'coletado',
    collection: {
      id: 'col_1', date: '2023-10-25T08:00:00Z', location: 'Sítio Boa Vista', category: 'Frutas', type: 'Manga Palmer', boxes: 50, grossWeight: 1000, responsibleId: 'usr_c1', photos: []
    },
    createdAt: '2023-10-25T08:00:00Z',
    updatedAt: '2023-10-25T08:00:00Z'
  },
  {
    id: 'load_2',
    companyId: 'comp_1',
    producerId: 'prod_2',
    status: 'beneficiado',
    collection: {
      id: 'col_2', date: '2023-10-24T09:00:00Z', location: 'Fazenda Esperança', category: 'Vegetais', type: 'Tomate Carmem', boxes: 100, grossWeight: 2000, responsibleId: 'usr_c1', photos: []
    },
    processing: {
      id: 'proc_1', fieldWeight: 2000, receivedWeight: 1950, damage: 20, discard: 30, netWeight: 1900, weightDifference: 50, photos: []
    },
    createdAt: '2023-10-24T09:00:00Z',
    updatedAt: '2023-10-24T14:00:00Z'
  },
  {
    id: 'load_3',
    companyId: 'comp_1',
    producerId: 'prod_1',
    status: 'pagamento_programado',
    collection: { id: 'col_3', date: '2023-10-20T08:00:00Z', location: 'Sítio Boa Vista', category: 'Frutas', type: 'Manga Tommy', boxes: 80, grossWeight: 1600, responsibleId: 'usr_c1', photos: [] },
    processing: { id: 'proc_2', fieldWeight: 1600, receivedWeight: 1580, damage: 10, discard: 20, netWeight: 1550, weightDifference: 20, photos: [] },
    financial: { id: 'fin_1', netWeight: 1550, pricePerKg: 2.50, discounts: 50, grossValue: 3875, finalValue: 3825, scheduledPaymentDate: '2023-11-05T00:00:00Z' },
    createdAt: '2023-10-20T08:00:00Z',
    updatedAt: '2023-10-21T10:00:00Z'
  }
];
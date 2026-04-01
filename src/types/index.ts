export type UserRole = 'maestro' | 'admin' | 'collaborator' | 'producer';

export type Permission = {
  id: string;
  companyId: string;
  userId: string;
  canCollect: boolean;
  canProcess: boolean;
  canManageFinancial: boolean;
  canMarkPayment: boolean;
  canViewReports: boolean;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  companyId?: string; // Super Admin may not have a companyId
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status?: 'active' | 'inactive';
  permissions?: Permission;
  coinsBalance?: number;
  xpTotal?: number;
  createdAt: string;
  updatedAt: string;
};

export type Company = {
  id: string;
  name: string;
  document: string; // CNPJ
  status: 'active' | 'inactive';
  slug?: string;
  logo?: string; 
  primaryColor?: string; 
  secondaryColor?: string;
  isGradient?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Producer = {
  id: string;
  companyId: string;
  name: string;
  document?: string; // CPF/CNPJ
  property: string;
  phone: string;
  avatar?: string;
  email?: string; // Novo: Login
  password?: string; // Novo: Senha
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  companyId: string;
  name: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type PhotoEvidence = {
  id: string;
  url: string;
  type: 'collection' | 'processing' | 'financial';
};

export type CollectionRecord = {
  id: string;
  date: string;
  location: string;
  category: string;
  type: string;
  boxes: number;
  grossWeight: number; 
  loaderName?: string; 
  responsibleId: string;
  observations?: string;
  photos: PhotoEvidence[];
};

export type ProcessingRecord = {
  id: string;
  fieldWeight: number; 
  receivedWeight: number; 
  damage: number; 
  discard: number; 
  greenWeight: number;          // Quantidade de produtos verdes (informativo)
  netWeight: number; 
  weightDifference: number;
  // Destinação do peso líquido
  stockWeight: number;          // Vai para estoque (maturação)
  productionWeight: number;     // Vai para produção (financeiro)
  bulkSaleWeight: number;       // Vai para venda a granel (financeiro com tag)
  observations?: string;
  photos: PhotoEvidence[];
};

export type FinancialRecord = {
  id: string;
  netWeight: number;
  productionWeight?: number;
  bulkWeight?: number;
  pricePerKg: number; 
  discounts: number;
  grossValue: number; 
  finalValue: number; 
  scheduledPaymentDate: string;
  saleType?: 'producao' | 'granel' | 'misto';  // Origem: produção normal, venda a granel ou mista
  observations?: string; 
};

export type PaymentRecord = {
  id: string;
  paymentDate: string;
  comprovanteUrl?: string;
  observations?: string;
};

export type LoadEditHistory = {
  date: string;
  authorId: string;
  authorName: string;
  action: string;
  details: string;
};

export type LoadStatus = 'coletado' | 'beneficiado' | 'pagamento_programado' | 'pago';

export type Load = {
  id: string;
  companyId: string;
  producerId: string;
  status: LoadStatus;
  collection: CollectionRecord;
  processing?: ProcessingRecord;
  financial?: FinancialRecord;
  payment?: PaymentRecord;
  editHistory?: LoadEditHistory[];
  createdAt: string;
  updatedAt: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  operationSize: string;
  painPoint?: string;
  status: 'new' | 'contacted' | 'converted';
  createdAt: string;
};
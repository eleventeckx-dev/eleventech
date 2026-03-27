export type UserRole = 'super_admin' | 'admin' | 'collaborator';

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
  permissions?: Permission;
  createdAt: string;
  updatedAt: string;
};

export type Company = {
  id: string;
  name: string;
  document: string; // CNPJ
  status: 'active' | 'inactive';
  plan: string;
  createdAt: string;
  updatedAt: string;
};

export type Producer = {
  id: string;
  companyId: string;
  name: string;
  document: string; // CPF/CNPJ
  property: string;
  phone: string;
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
  grossWeight: number; // Peso bruto (kg)
  responsibleId: string;
  observations?: string;
  photos: PhotoEvidence[];
};

export type ProcessingRecord = {
  id: string;
  fieldWeight: number; // Peso roça
  receivedWeight: number; // Peso recebido no barracão
  damage: number; // Avarias (kg)
  discard: number; // Descarte (kg)
  netWeight: number; // Peso líquido (kg) - Calculado
  weightDifference: number; // Diferença (kg) - Calculado
  observations?: string;
  photos: PhotoEvidence[];
};

export type FinancialRecord = {
  id: string;
  netWeight: number;
  pricePerKg: number;
  discounts: number;
  grossValue: number; // Calculado
  finalValue: number; // Calculado
  scheduledPaymentDate: string;
};

export type PaymentRecord = {
  id: string;
  paymentDate: string;
  observations?: string;
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
  createdAt: string;
  updatedAt: string;
};
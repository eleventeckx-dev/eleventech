import React, { createContext, useContext, useState, useEffect } from 'react';
import { Load, Producer, User, Company, Product, Lead } from '../types';
import { supabase } from '../lib/supabase';

interface AgroContextData {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => Promise<void>;
  loads: Load[];
  producers: Producer[];
  companies: Company[];
  users: User[];
  products: Product[];
  leads: Lead[];
  isLoading: boolean;
  addLoad: (load: Load) => Promise<void>;
  updateLoad: (id: string, load: Partial<Load>) => Promise<void>;
  addProducer: (producer: Producer) => Promise<void>;
  updateProducer: (id: string, producer: Partial<Producer>) => Promise<void>;
  deleteProducer: (id: string) => Promise<void>;
  addCompany: (company: Company, adminName?: string, adminEmail?: string, adminPassword?: string) => Promise<void>;
  updateCompany: (id: string, company: Partial<Company>, adminName?: string, adminEmail?: string, adminPassword?: string) => Promise<void>;
  resetCompanyData: (companyId: string, maestroPassword: string) => Promise<void>;
  deleteCompanyFull: (companyId: string, maestroPassword: string) => Promise<void>;
  addUser: (user: User, password?: string) => Promise<void>;
  updateUser: (id: string, user: Partial<User>, newPassword?: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateLeadStatus: (id: string, status: 'new' | 'contacted' | 'converted') => Promise<void>;
  refreshData: () => Promise<void>;
  brandingSlug: string | null;
  setBrandingSlug: (slug: string | null) => void;
}

const AgroContext = createContext<AgroContextData>({} as AgroContextData);

export const AgroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [brandingSlug, setBrandingSlug] = useState<string | null>(null);
  
  const currentUserRef = React.useRef<User | null>(null);

  // ================================================================
  // AUTH: Buscar perfil do usuário logado
  // ================================================================
  const fetchProfile = async (userId: string, session: any) => {
    if (!userId) return;
    
    console.log("[AUTH] Buscando perfil para:", userId);
    const startTime = Date.now();
    const email = session?.user?.email || session?.email || '';
    
    try {
      // Promise.race com timeout de 4s para evitar hang infinito do RLS
      // Promise.race com timeout de 2s para evitar hang infinito do RLS
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT: Query profiles travou')), 2000)
      );

      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]);

      if (error) {
        console.warn("[AUTH] Erro ao buscar perfil:", error.message);
        loadFromJWT(userId, session);
        return;
      }

      const elapsed = Date.now() - startTime;
      console.log(`[AUTH] Perfil recuperado em ${elapsed}ms. Role: ${profile?.role}, Empresa: ${profile?.company_id}`);

      if (profile) {
        const newUser: User = {
          id: profile.id,
          companyId: profile.company_id,
          name: profile.name || email?.split('@')[0] || '',
          email: email || '',
          role: profile.role,
          avatar: profile.avatar,
          status: profile.status,
          permissions: profile.permissions || [],
          coinsBalance: 0,
          xpTotal: 0,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        };
        setCurrentUser(newUser);
        currentUserRef.current = newUser;
      } else {
        loadFromJWT(userId, session);
      }
    } catch (error: any) {
      console.warn("[AUTH] Query profiles falhou (possível RLS/timeout):", error.message);
      loadFromJWT(userId, session);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback síncrono: ler role e companyId direto do session/JWT
  const loadFromJWT = (userId: string, session: any) => {
    if (!session?.user) {
      console.error("[AUTH] Fallback JWT: sem session.user");
      return;
    }

    const meta = session.user.app_metadata || {};
    const userMeta = session.user.user_metadata || {};
    
    const role = meta.role || userMeta.role || 'collaborator';
    const companyId = meta.companyId || userMeta.companyId || '';
    const name = userMeta.name || session.user.email?.split('@')[0] || '';
    const email = session.user.email || '';

    console.log(`[AUTH] Fallback JWT: role=${role}, companyId=${companyId}, name=${name}`);

    const newUser: User = {
      id: userId,
      companyId: companyId,
      name: name,
      email: email,
      role: role,
      avatar: userMeta.avatar || '',
      status: 'active',
      permissions: undefined,
      coinsBalance: 0,
      xpTotal: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
    currentUserRef.current = newUser;
  };

  // ================================================================
  // AUTH: Inicialização e Listener
  // ================================================================
  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && isMounted) {
        await fetchProfile(session.user.id, session);
      } else if (isMounted) {
        setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log("[AUTH] Event:", event, "| User:", session?.user?.email);
      
      // Ignorar eventos que recarregariam o sistema se o usuário for o mesmo
      const isSameUser = session?.user?.id === currentUserRef.current?.id;
      if (isSameUser && (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id, session);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        currentUserRef.current = null;
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Efeito para injetar BRANDING (Cores Dinâmicas)
  useEffect(() => {
    let activeCompany: Company | undefined;

    if (brandingSlug) {
      activeCompany = companies.find(c => c.slug === brandingSlug);
    } 
    
    if (!activeCompany && currentUser?.companyId) {
      activeCompany = companies.find(c => c.id === currentUser.companyId);
    }

    if (!activeCompany) {
      // Cores padrão Eleven Tech (Novo Verde Escuro pedido pelo usuário)
      // O usuário definiu #051D0D como a nova identidade oficial da Eleven Tech
      document.documentElement.style.setProperty('--primary-color', '#051D0D');
      document.documentElement.style.setProperty('--secondary-color', '#0c3e1e');
      document.documentElement.style.setProperty('--gradient-bg', 'linear-gradient(135deg, #051D0D, #0c3e1e)');
      return;
    }

    const primary = activeCompany.primaryColor || '#10b981';
    const secondary = activeCompany.secondaryColor || '#064e3b';
    
    document.documentElement.style.setProperty('--primary-color', primary);
    document.documentElement.style.setProperty('--secondary-color', secondary);
    
    if (activeCompany.isGradient) {
      document.documentElement.style.setProperty('--gradient-bg', `linear-gradient(135deg, ${primary}, ${secondary})`);
    } else {
      document.documentElement.style.setProperty('--gradient-bg', primary);
    }
  }, [currentUser?.companyId, companies, brandingSlug]);

  // NOVO: Buscar branding público se for acessado deslogado via slug
  useEffect(() => {
    if (!brandingSlug) return;
    
    const normalizedSlug = brandingSlug.toLowerCase();
    // Se a empresa já estiver na lista, não busca de novo
    if (companies.find(c => c.slug === normalizedSlug)) return;

    const fetchPublicBranding = async () => {
      console.log("[BRANDING] Buscando marca pública para:", normalizedSlug);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', normalizedSlug)
        .single();

      if (data && !error) {
        console.log("[BRANDING] Marca encontrada!", data.name);
        const mapped: Company = {
          id: data.id,
          name: data.name,
          document: data.document,
          status: data.status,
          slug: data.slug,
          logo: data.logo,
          primaryColor: data.primary_color,
          secondaryColor: data.secondary_color,
          isGradient: data.is_gradient,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        setCompanies(prev => {
          const exists = prev.find(c => c.id === mapped.id);
          if (exists) {
            // Se já existe mas os dados mudaram (ex: cores), atualizamos
            return prev.map(c => c.id === mapped.id ? mapped : c);
          }
          return [...prev, mapped];
        });
      } else if (error) {
        console.error("[BRANDING] Erro ao buscar marca:", error.message);
      }
    };

    fetchPublicBranding();
  }, [brandingSlug, companies]);

  // ================================================================
  // DATA: Carregar dados reais do Supabase
  // ================================================================
  const refreshData = async () => {
    if (!currentUser) return;

    const isMaestro = currentUser.role === 'maestro';
    const safeCompanyId = currentUser.companyId && currentUser.companyId !== '' 
      ? currentUser.companyId 
      : null;

    if (!isMaestro && !safeCompanyId) return;

    // Não acionar o loader de tela inteira se já tivermos dados na tela
    // setIsLoading(true);
    console.log("[DATA] Carregando dados para", currentUser.role, "| Empresa:", safeCompanyId);
    
    try {
      // --- EMPRESAS ---
      let companiesQuery = supabase.from('companies').select('*');
      if (!isMaestro && safeCompanyId) {
        companiesQuery = companiesQuery.eq('id', safeCompanyId);
      }
      const { data: companiesData, error: cError } = await companiesQuery;
      if (cError) console.error("[DATA] Erro em companies:", cError.message);

      const mappedCompanies: Company[] = (companiesData || []).map(c => ({
        id: c.id,
        name: c.name,
        document: c.document,
        status: c.status,
        slug: c.slug,
        logo: c.logo,
        primaryColor: c.primary_color,
        secondaryColor: c.secondary_color,
        isGradient: c.is_gradient,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      }));
      setCompanies(mappedCompanies);

      // --- PRODUTORES ---
      let producersQuery = supabase.from('producers').select('*');
      if (!isMaestro && safeCompanyId) {
        producersQuery = producersQuery.eq('company_id', safeCompanyId);
      }
      const { data: producersData, error: pError } = await producersQuery;
      if (pError) console.error("[DATA] Erro em producers:", pError.message);
      
      const mappedProducers: Producer[] = (producersData || []).map(p => ({
        id: p.id,
        companyId: p.company_id,
        name: p.name,
        property: p.property,
        phone: p.phone,
        email: p.email,
        password: p.password,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));
      setProducers(mappedProducers);

      // --- PRODUTOS ---
      let productsQuery = supabase.from('products').select('*');
      if (!isMaestro && safeCompanyId) {
        productsQuery = productsQuery.eq('company_id', safeCompanyId);
      }
      const { data: productsData, error: prError } = await productsQuery;
      if (prError) console.error("[DATA] Erro em products:", prError.message);
      
      const mappedProducts: Product[] = (productsData || []).map(p => ({
        id: p.id,
        companyId: p.company_id,
        name: p.name,
        category: p.category,
        imageUrl: p.image_url,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));
      setProducts(mappedProducts);

      // --- CARGAS ---
      let loadsQuery = supabase.from('loads').select('*');
      if (!isMaestro && safeCompanyId) {
        loadsQuery = loadsQuery.eq('company_id', safeCompanyId);
      }
      const { data: loadsData, error: lError } = await loadsQuery;
      if (lError) console.error("[DATA] Erro em loads:", lError.message);
      
      const mappedLoads: Load[] = (loadsData || []).map(l => ({
        id: l.id,
        companyId: l.company_id,
        producerId: l.producer_id,
        status: l.status,
        collection: l.collection_record,
        processing: l.processing_record,
        financial: l.financial_record,
        payment: l.payment_record,
        editHistory: l.edit_history || [],
        createdAt: l.created_at,
        updatedAt: l.updated_at
      }));
      setLoads(mappedLoads);

      // --- PERFIS (USUÁRIOS) ---
      let usersQuery = supabase.from('profiles').select('*');
      if (!isMaestro && safeCompanyId) {
        usersQuery = usersQuery.eq('company_id', safeCompanyId);
      }
      const { data: usersData, error: uError } = await usersQuery;
      if (uError) console.error("[DATA] Erro em profiles:", uError.message);
      
      const mappedUsers: User[] = (usersData || []).map(u => ({
        id: u.id,
        companyId: u.company_id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        permissions: u.permissions,
        coinsBalance: 0,
        xpTotal: 0,
        createdAt: u.created_at,
        updatedAt: u.updated_at
      }));
      // setUsers(mappedUsers);
      // BUGFIX: usuários não estavam mapeados na interface corretamente.
      setUsers(mappedUsers);

      // --- LEADS (Somente Maestro) ---
      if (isMaestro) {
        const { data: leadsData, error: leError } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (leError) console.error("[DATA] Erro em leads:", leError.message);
        
        const mappedLeads: Lead[] = (leadsData || []).map(l => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          email: l.email,
          operationSize: l.operation_size,
          painPoint: l.pain_point,
          status: l.status,
          createdAt: l.created_at
        }));
        setLeads(mappedLeads);
      }

      console.log(`[DATA] Carregamento completo: ${companiesData?.length || 0} empresas, ${mappedUsers.length} usuários, ${producersData?.length || 0} produtores`);

    } catch (error) {
      console.error("[DATA] Erro geral ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  // ================================================================
  // MUTATIONS: Cargas
  // ================================================================
  const addLoad = async (load: Load) => {
    const { error } = await supabase.from('loads').insert({
      id: load.id,
      company_id: load.companyId,
      producer_id: load.producerId,
      status: load.status,
      collection_record: load.collection,
      processing_record: load.processing,
      financial_record: load.financial,
      payment_record: load.payment,
      created_at: new Date().toISOString()
    });
    if (error) throw error;
    await refreshData();
  };

  const updateLoad = async (id: string, updates: Partial<Load>) => {
    const dbUpdate: any = { updated_at: new Date().toISOString() };
    if (updates.status) dbUpdate.status = updates.status;
    if (updates.collection) dbUpdate.collection_record = updates.collection;
    if (updates.processing) dbUpdate.processing_record = updates.processing;
    if (updates.financial) dbUpdate.financial_record = updates.financial;
    if (updates.payment) dbUpdate.payment_record = updates.payment;
    if (updates.editHistory) dbUpdate.edit_history = updates.editHistory;

    const { error } = await supabase.from('loads').update(dbUpdate).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  // ================================================================
  // MUTATIONS: Produtores
  // ================================================================
  const addProducer = async (producer: Producer) => {
    setIsLoading(true);
    try {
      let finalUserId = producer.id;
      
      // Se houver e-mail e senha, criar credencial real
      if (producer.email && producer.password) {
        const { data, error } = await supabase.functions.invoke('manage-users', {
          body: {
            action: 'create',
            userData: {
              email: producer.email,
              password: producer.password,
              name: producer.name,
              role: 'producer',
              companyId: producer.companyId,
              status: 'active'
            }
          }
        });

        if (error) {
           let msg = error.message;
           try {
             const contextBody = await error.context.json();
             if (contextBody?.error) msg = contextBody.error;
           } catch(e) {}
           
           throw new Error(`Falha Edge Function: ${msg}`);
        }
        
        // Se a function retornar erro mapeado no corpo
        if (data?.error) {
           throw new Error(`Falha: ${data.error}`);
        }
        // Pega o UUID do usuario recém-criado na Edge Function
        if (data?.user?.id) {
          finalUserId = data.user.id;
        }
      }

      const { error } = await supabase.from('producers').insert({
        id: finalUserId,
        name: producer.name,
        property: producer.property,
        phone: producer.phone,
        email: producer.email,
        company_id: producer.companyId,
        created_at: new Date().toISOString()
      });
      if (error) throw error;
      
      await refreshData();
    } catch (err: any) {
      console.error("[PRODUCER] Erro ao criar:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProducer = async (id: string, updates: Partial<Producer>) => {
    setIsLoading(true);
    try {
      if (id.includes('-') && (updates.email || updates.password || updates.name !== undefined)) {
        const { error: authError } = await supabase.functions.invoke('manage-users', {
          body: {
            action: 'update',
            userId: id,
            userData: {
              email: updates.email,
              password: updates.password,
              name: updates.name,
              role: 'producer'
            }
          }
        });
        if (authError) {
          console.warn("[PRODUCER] Sincronização Auth ignorada (produtor sem conta):", authError.message);
        }
      }

      const dbUpdate: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) dbUpdate.name = updates.name;
      if (updates.property !== undefined) dbUpdate.property = updates.property;
      if (updates.phone !== undefined) dbUpdate.phone = updates.phone;
      if (updates.email !== undefined) dbUpdate.email = updates.email;

      const { error } = await supabase.from('producers').update(dbUpdate).eq('id', id);
      if (error) throw error;
      await refreshData();
    } catch (err: any) {
      console.error("[PRODUCER] Erro ao atualizar:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProducer = async (id: string) => {
    const { error } = await supabase.from('producers').delete().eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  // ================================================================
  // MUTATIONS: Produtos
  // ================================================================
  const addProduct = async (product: Product) => {
    const { error } = await supabase.from('products').insert({
      id: product.id,
      name: product.name,
      category: product.category,
      image_url: product.imageUrl,
      company_id: product.companyId,
      created_at: new Date().toISOString()
    });
    if (error) throw error;
    await refreshData();
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const dbUpdate: any = { updated_at: new Date().toISOString() };
    if (updates.name) dbUpdate.name = updates.name;
    if (updates.category) dbUpdate.category = updates.category;
    if (updates.imageUrl) dbUpdate.image_url = updates.imageUrl;

    const { error } = await supabase.from('products').update(dbUpdate).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  // ================================================================
  // MUTATIONS: Empresas
  // ================================================================
  // Função auxiliar: Cria admin via edge function para garantir unicidade e integridade
  const createAdminUser = async (companyId: string, adminName: string, adminEmail: string, adminPassword: string) => {
    console.log("[COMPANY] Criando gestor inicial:", adminEmail);
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('manage-company-admin', {
      body: {
        action: 'create',
        companyId,
        adminName,
        adminEmail,
        adminPassword
      }
    });

    if (edgeError) {
      let msg = edgeError.message;
      try {
        const body = await edgeError.context.json();
        if (body?.error) msg = body.error;
      } catch(e) {}
      
      if (msg.includes('already registered')) {
        throw new Error("Este e-mail já está em uso na plataforma.");
      }
      
      throw new Error(`Falha ao criar gestor: ${msg}`);
    }
  };

  const addCompany = async (company: Company, adminName?: string, adminEmail?: string, adminPassword?: string) => {
    try {
      setIsLoading(true);

      const { data: duplicate } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', company.name)
        .maybeSingle();
      
      if (duplicate) {
        throw new Error(`Já existe uma empresa cadastrada com o nome "${company.name}". Escolha outro.`);
      }

      const { error: companyError } = await supabase.from('companies').insert({
        id: company.id,
        name: company.name,
        document: company.document,
        status: company.status,
        created_at: new Date().toISOString()
      });
      if (companyError) throw companyError;

      if (adminEmail && adminName && adminPassword) {
        await createAdminUser(company.id, adminName, adminEmail, adminPassword);
      }

      // Pausa para o trigger handle_new_user processar o perfil
      await new Promise(r => setTimeout(r, 1500));
      await refreshData();
    } catch (error: any) {
      console.error("[COMPANY] Erro ao criar empresa:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>, adminName?: string, adminEmail?: string, adminPassword?: string) => {
    try {
      if (updates.name) {
        const { data: duplicate } = await supabase
          .from('companies')
          .select('id')
          .ilike('name', updates.name)
          .neq('id', id)
          .maybeSingle();

        if (duplicate) {
          throw new Error(`Já existe uma empresa cadastrada com o nome "${updates.name}".`);
        }
      }

      const dbUpdates: any = { 
        updated_at: new Date().toISOString() 
      };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.document !== undefined) dbUpdates.document = updates.document;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.logo !== undefined) dbUpdates.logo = updates.logo;
      if (updates.primaryColor !== undefined) dbUpdates.primary_color = updates.primaryColor;
      if (updates.secondaryColor !== undefined) dbUpdates.secondary_color = updates.secondaryColor;
      if (updates.isGradient !== undefined) dbUpdates.is_gradient = updates.isGradient;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      console.log("[COMPANY] Enviando atualizações para o banco:", dbUpdates);
      const { error: companyError } = await supabase.from('companies').update(dbUpdates).eq('id', id);
      
      if (companyError) {
        console.error("[COMPANY] Erro do Supabase na atualização:", companyError);
        throw companyError;
      }

      if (adminName || adminEmail || adminPassword) {
        const currentAdmin = users.find(u => u.companyId === id && u.role === 'admin');
        
        if (currentAdmin) {
          // Atualizar perfil do admin existente
          console.log("[COMPANY] Atualizando Admin:", currentAdmin.email);
          const profileUpdate: Record<string, string> = { updated_at: new Date().toISOString() };
          if (adminName) profileUpdate.name = adminName;
          if (adminEmail) profileUpdate.email = adminEmail;
          
          const { error: profileError } = await supabase
            .from('profiles')
            .update(profileUpdate)
            .eq('id', currentAdmin.id);
          
          if (profileError) {
            console.error("[COMPANY] Erro ao atualizar gestor:", profileError);
            throw new Error(`Falha ao atualizar gestor: ${profileError.message}`);
          }
          console.log("[COMPANY] Admin atualizado com sucesso.");
        } else if (adminEmail && adminName && adminPassword) {
          // Criar novo admin para esta empresa via signup
          await createAdminUser(id, adminName, adminEmail, adminPassword);
        } else {
          console.warn("[COMPANY] Dados do admin incompletos para criar novo gestor.");
        }

        await new Promise(r => setTimeout(r, 1500));
      }

      await refreshData();
      console.log("[COMPANY] Empresa e dados atualizados com sucesso.");
    } catch (error: any) {
      console.error("[COMPANY] Erro detalhado ao editar empresa:", error);
      throw error;
    }
  };

  const resetCompanyData = async (companyId: string, maestroPassword: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-company-admin', {
        body: { action: 'reset_company', companyId, maestroPassword }
      });
      if (error) {
         let msg = error.message;
         try { const bd = await error.context.json(); if (bd?.error) msg = bd.error; } catch(e){}
         throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCompanyFull = async (companyId: string, maestroPassword: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-company-admin', {
        body: { action: 'delete_company', companyId, maestroPassword }
      });
      if (error) {
         let msg = error.message;
         try { const bd = await error.context.json(); if (bd?.error) msg = bd.error; } catch(e){}
         throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  // ================================================================
  // MUTATIONS: Usuários (Perfis) — BUG-10 e BUG-11 corrigidos
  // ================================================================
  const addUser = async (user: User, password?: string) => {
    setIsLoading(true);
    try {
      if (!password) {
        throw new Error('A senha é obrigatória para criar um novo usuário.');
      }
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          userData: {
            email: user.email,
            password: password,
            name: user.name,
            role: user.role,
            companyId: user.companyId || currentUser?.companyId,
            permissions: user.permissions
          }
        }
      });
      if (error) {
         throw new Error(error.message || 'Erro ao criar credencial');
      }
      await refreshData();
    } catch (err: any) {
      console.error("[USER] Erro ao criar usuário:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>, newPassword?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'update',
          userId: id,
          userData: {
            email: updates.email,
            password: newPassword,
            name: updates.name,
            role: updates.role,
            companyId: updates.companyId,
            status: updates.status,
            permissions: updates.permissions
          }
        }
      });
      if (error) {
         throw new Error(error.message || 'Erro ao atualizar credencial');
      }
      await refreshData();
    } catch (err: any) {
      console.error("[USER] Erro ao atualizar usuário:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setIsLoading(true);
    try {
      // Inativa no banco via logica central da Edge Function (Soft Delete implementado lá)
      const { error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete',
          userId: id
        }
      });
      if (error) {
         throw new Error(error.message || 'Erro ao remover credencial');
      }
      await refreshData();
    } catch (err: any) {
      console.error("[USER] Erro ao remover usuário:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, status: 'new' | 'contacted' | 'converted') => {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  // ================================================================
  // AUTH: Logout Global
  // ================================================================
  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      currentUserRef.current = null;
    } catch (err) {
      console.error("[AUTH] Erro ao deslogar:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ================================================================
  // DEBUG: Diagnóstico exposto no window
  // ================================================================
  useEffect(() => {
    (window as any).ELEVENTECH_DEBUG = () => {
      console.log("=== ELEVENTECH DIAGNOSTIC ===");
      console.log("User:", currentUserRef.current?.email, "| Role:", currentUserRef.current?.role);
      console.log("Companies:", companies.length);
      console.log("Users:", users.length);
      console.log("Admins:", users.filter(u => u.role === 'admin').length);
      return "Relatório gerado.";
    };
  }, [users, companies]);

  return (
    <AgroContext.Provider value={{ 
      currentUser, setCurrentUser, logout, loads, producers, companies, users, products, isLoading,
      addLoad, updateLoad, addProducer, updateProducer, deleteProducer, addCompany, updateCompany, resetCompanyData, deleteCompanyFull,
      addUser, updateUser, deleteUser, addProduct, updateProduct, deleteProduct, updateLeadStatus, refreshData,
      brandingSlug, setBrandingSlug, leads
    }}>
      {children}
    </AgroContext.Provider>
  );
};

export const useAgro = () => useContext(AgroContext);
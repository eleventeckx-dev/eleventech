import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Configuração CORS (Preflight request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Ambiente interno não configurado (Falta Service Role)')
    }

    // Cliente interno (Service Role = Admin completo do Supabase)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const body = await req.json()
    const { action, userId, userData } = body

    // 1. Verificar QUEM está chamando a função (Autenticação do Locatário/Admin)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Cabeçalho Authorization ausente')
    const token = authHeader.replace('Bearer ', '')

    const { data: { user: executor }, error: verifyError } = await supabaseAdmin.auth.getUser(token)
    if (verifyError || !executor) {
      throw new Error('Acesso não autorizado ou token inválido/expirado')
    }

    // 2. Extrair credenciais do executor (Super Admin ou Admin de Empresa)
    const execRole = executor.user_metadata?.role || executor.app_metadata?.role
    const execCompany = executor.user_metadata?.companyId || executor.app_metadata?.companyId

    const isCollabCreatingProducer = execRole === 'collaborator' && userData?.role === 'producer';

    if (execRole !== 'maestro' && execRole !== 'admin' && !isCollabCreatingProducer) {
      throw new Error('Operação negada. Apenas administradores do sistema podem executar gerência avançada.')
    }

    // ===============================================
    // OP: CREATE (Criação de Usuário Auth - Maestria)
    // ===============================================
    if (action === 'create') {
      // Se for maestro, ele manda o ID da Empresa. Se for Admin, forçamos que crie pra mesma empresa dele.
      const targetCompany = execRole === 'maestro' ? userData.companyId : execCompany
      if (!targetCompany) {
         throw new Error('Tentativa de criação sem vinculação empresarial.')
      }
      
      if (!userData.email || !userData.password) {
         throw new Error('Email e Senha são obrigatórios para novo registro.')
      }

      // Cria a credencial limpa
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Já aprovado direto
        user_metadata: {
          name: userData.name,
          role: userData.role || 'collaborator',
          companyId: targetCompany
        },
        app_metadata: {
          role: userData.role || 'collaborator',
          companyId: targetCompany
        }
      })

      if (error) throw error

      // Aguarde a Trigger "handle_new_user" (no BD) rodar o INSERT na tabela profiles. (É Síncrono no PG).
      if (userData.permissions && data.user) {
         await supabaseAdmin.from('profiles').update({
             permissions: userData.permissions
         }).eq('id', data.user.id)
      }

      return new Response(JSON.stringify({ success: true, user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ===============================================
    // OP: UPDATE (Atualização de Credencial Auth)
    // ===============================================
    if (action === 'update') {
      if (!userId) throw new Error('ID do alvo não providenciado')

      // Auditoria RLS Interna: Impedir admin de empresa alterar um usuário que não seja da mesma empresa
      if (execRole === 'admin' || execRole === 'collaborator') {
         const { data: checkTarget } = await supabaseAdmin.auth.admin.getUserById(userId)
         const targetCompany = checkTarget.user?.user_metadata?.companyId || checkTarget.user?.app_metadata?.companyId
         if (targetCompany !== execCompany) {
             throw new Error('Tentativa de invasão bloqueada: usuário-alvo pertence a outra organização.')
         }
         
         const targetRole = checkTarget.user?.user_metadata?.role || checkTarget.user?.app_metadata?.role;
         
         if (execRole === 'collaborator') {
             if (targetRole !== 'producer' || userData.role !== 'producer') {
                 throw new Error('Colaborador só pode gerenciar produtores da mesma empresa.')
             }
         } else {
             // Proteção extra: Admin local não pode virar maestro, nem transformar alguém em maestro.
             if (userData.role === 'maestro' || targetRole === 'maestro') {
                 throw new Error('Modificação de nível Maestro não autorizada.')
             }
         }
      }

      // Prepara payload
      const updates: any = {}
      if (userData.email) updates.email = userData.email
      if (userData.password) updates.password = userData.password // Admin resetando senha
      
      if (userData.name || userData.role || userData.companyId) {
         const { data: currentUser } = await supabaseAdmin.auth.admin.getUserById(userId)
         const currentMeta = currentUser.user?.user_metadata || {}
         
         updates.user_metadata = {
            ...currentMeta,
            name: userData.name || currentMeta.name,
            role: userData.role || currentMeta.role,
         }

         // Apenas Maestro pode transacionar empresas
         if (execRole === 'maestro' && userData.companyId) {
             updates.user_metadata.companyId = userData.companyId
         }
      }

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates)
      if (error) throw error

      const profileUpdates: any = { updated_at: new Date().toISOString() }
      let updateProfile = false
      if (userData.status) { profileUpdates.status = userData.status; updateProfile = true }
      if (userData.permissions) { profileUpdates.permissions = userData.permissions; updateProfile = true }

      if (updateProfile) {
         await supabaseAdmin.from('profiles').update(profileUpdates).eq('id', userId)
      }

      return new Response(JSON.stringify({ success: true, user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ===============================================
    // OP: DELETE (Remoção da Credencial)
    // ===============================================
    if (action === 'delete') {
      if (!userId) throw new Error('ID para deleção pendente')
      
      // Auditoria RLS Interna
      if (execRole === 'admin' || execRole === 'collaborator') {
         const { data: checkTarget } = await supabaseAdmin.auth.admin.getUserById(userId)
         const targetCompany = checkTarget.user?.user_metadata?.companyId || checkTarget.user?.app_metadata?.companyId
         if (targetCompany !== execCompany) {
             throw new Error('Tentativa de invasão bloqueada ao excluir.')
         }
         
         if (execRole === 'collaborator') {
             const targetRole = checkTarget.user?.user_metadata?.role || checkTarget.user?.app_metadata?.role;
             if (targetRole !== 'producer') {
                 throw new Error('Colaborador só pode gerenciar produtores da mesma empresa.')
             }
         }
      }

      // Soft Delete no backend Auth
      // const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      // if (error) throw error

      // Para manter histórico na gestão (Best Practice), apenas INATIVAMOS e desabilitamos sign-in se quisermos,
      // Mas o frontend usa o 'status': 'inactive' do profiles.
      await supabaseAdmin.from('profiles').update({ 
         status: 'inactive', 
         updated_at: new Date().toISOString() 
      }).eq('id', userId)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Ação não reconhecida.')

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Erro inesperado do Servidor Local' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

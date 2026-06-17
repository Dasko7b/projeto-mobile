-- =========================================================================
-- SCRIPT DE BANCO DE DADOS: FECHACONTA
-- Cole este script completo no SQL Editor do Supabase para criar as tabelas,
-- habilitar RLS, configurar triggers de cadastro e criar a View de saldos.
-- =========================================================================

-- Limpeza prévia de tabelas e views (para evitar conflitos de recriação)
DROP VIEW IF EXISTS public.vw_group_balances;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.is_group_member CASCADE;
DROP FUNCTION IF EXISTS public.create_group_with_member CASCADE;

-- 1. Tabela de Usuários (Perfil)
-- É alimentada automaticamente quando alguém se cadastra no Auth do Supabase
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Grupos
CREATE TABLE public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL, -- Ex: "Churrasco", "República"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Membros do Grupo (Tabela Associativa)
CREATE TABLE public.group_members (
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (group_id, user_id)
);

-- 4. Tabela de Despesas
CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    paid_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    descricao TEXT NOT NULL, -- Ex: "Supermercado"
    receipt_url TEXT, -- URL da foto da nota fiscal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- FUNÇÃO AUXILIAR DE SEGURANÇA (Evita recursão infinita nas políticas)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.is_group_member(group_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = $1 AND group_members.user_id = $2
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =========================================================================
-- FUNÇÃO AUXILIAR DE CRIAÇÃO (Cria o grupo e adiciona membro atomicamente)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.create_group_with_member(group_name TEXT, user_id UUID)
RETURNS public.groups AS $$
DECLARE
  new_group public.groups;
BEGIN
  INSERT INTO public.groups (nome)
  VALUES (group_name)
  RETURNING * INTO new_group;
  
  INSERT INTO public.group_members (group_id, user_id)
  VALUES (new_group.id, user_id);
  
  RETURN new_group;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =========================================================================

-- Políticas para 'users' (Qualquer usuário logado pode ler perfis, mas só atualiza o próprio)
CREATE POLICY "Usuários podem ver o perfil de outros" ON public.users FOR SELECT USING (true);
CREATE POLICY "Usuário pode atualizar próprio perfil" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Políticas para 'groups' (Só vê o grupo se for membro; qualquer autenticado pode criar)
CREATE POLICY "Ver grupos que sou membro" ON public.groups FOR SELECT 
USING (public.is_group_member(id, auth.uid()));

CREATE POLICY "Usuários autenticados podem criar grupos" ON public.groups FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Políticas para 'group_members' (Só vê membros se for do grupo; qualquer autenticado pode se adicionar)
CREATE POLICY "Ver membros dos meus grupos" ON public.group_members FOR SELECT
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Pode se adicionar ou adicionar outros" ON public.group_members FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Políticas para 'expenses' (Só vê e adiciona despesas se for membro do grupo)
CREATE POLICY "Ver despesas dos meus grupos" ON public.expenses FOR SELECT
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Inserir despesas nos meus grupos" ON public.expenses FOR INSERT
WITH CHECK (public.is_group_member(group_id, auth.uid()));

-- =========================================================================
-- TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE PERFIL (Supabase Auth -> public.users)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nome)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'nome', 'Usuário')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- VIEW DE SALDOS E DIVISÃO DE CONTAS (Balanço do Grupo)
-- =========================================================================
CREATE OR REPLACE VIEW public.vw_group_balances AS
WITH real_expenses AS (
    -- Seleciona apenas despesas reais (não liquidações)
    SELECT * FROM public.expenses
    WHERE descricao NOT LIKE 'Liquidação%'
),
group_totals AS (
    -- Calcula o total gasto real no grupo e divide pela quantidade de membros
    SELECT 
        re.group_id,
        SUM(re.valor) as total_gasto,
        (SELECT COUNT(*) FROM public.group_members gm WHERE gm.group_id = re.group_id) as num_membros,
        SUM(re.valor) / NULLIF((SELECT COUNT(*) FROM public.group_members gm WHERE gm.group_id = re.group_id), 0) as cota_por_membro
    FROM real_expenses re
    GROUP BY re.group_id
),
user_spent AS (
    -- Calcula quanto cada usuário pagou em despesas reais
    SELECT 
        group_id,
        paid_by as user_id,
        SUM(valor) as valor_pago
    FROM real_expenses
    GROUP BY group_id, paid_by
),
user_settlements_paid AS (
    -- Calcula quanto cada usuário pagou em liquidações
    SELECT 
        group_id,
        paid_by as user_id,
        SUM(valor) as total_pago
    FROM public.expenses
    WHERE descricao LIKE 'Liquidação%'
    GROUP BY group_id, paid_by
),
user_settlements_received AS (
    -- Calcula quanto cada usuário recebeu em liquidações (extraindo o UUID do recebedor da descrição)
    -- O formato da descrição é 'Liquidação: para <UUID>'
    -- Usamos expressão regular para extrair com segurança o UUID de 36 caracteres
    SELECT 
        group_id,
        CAST(substring(descricao from '[0-9a-fA-F-]{36}') AS UUID) as user_id,
        SUM(valor) as total_recebido
    FROM public.expenses
    WHERE descricao LIKE 'Liquidação: para %'
    GROUP BY group_id, substring(descricao from '[0-9a-fA-F-]{36}')
)
-- Cruza as informações para dar o saldo final
SELECT 
    gm.group_id,
    gm.user_id,
    u.nome,
    COALESCE(us.valor_pago, 0) as total_pago_pelo_usuario,
    COALESCE(gt.cota_por_membro, 0) as o_que_deveria_pagar,
    (
        -- Saldo final = (valor_pago - cota_por_membro) + liquidações_pagas - liquidações_recebidas
        (COALESCE(us.valor_pago, 0) - COALESCE(gt.cota_por_membro, 0)) + 
        COALESCE(usp.total_pago, 0) - 
        COALESCE(usr.total_recebido, 0)
    ) as saldo_final
FROM public.group_members gm
JOIN public.users u ON u.id = gm.user_id
LEFT JOIN group_totals gt ON gt.group_id = gm.group_id
LEFT JOIN user_spent us ON us.group_id = gm.group_id AND us.user_id = gm.user_id
LEFT JOIN user_settlements_paid usp ON usp.group_id = gm.group_id AND usp.user_id = gm.user_id
LEFT JOIN user_settlements_received usr ON usr.group_id = gm.group_id AND usr.user_id = gm.user_id;
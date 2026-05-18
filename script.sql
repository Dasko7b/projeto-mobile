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

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas para 'users' (Usuário pode ler todos, mas só altera a si mesmo)
CREATE POLICY "Usuários podem ver o perfil de outros" ON public.users FOR SELECT USING (true);
CREATE POLICY "Usuário pode atualizar próprio perfil" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Políticas para 'groups' (Só vê o grupo se for membro)
CREATE POLICY "Ver grupos que sou membro" ON public.groups FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.group_members WHERE group_members.group_id = groups.id AND group_members.user_id = auth.uid()
));
CREATE POLICY "Usuários autenticados podem criar grupos" ON public.groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para 'group_members' (Pode ver membros dos seus grupos)
CREATE POLICY "Ver membros dos meus grupos" ON public.group_members FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
));
CREATE POLICY "Pode se adicionar ou adicionar outros" ON public.group_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para 'expenses' (Só vê e adiciona despesas nos seus grupos)
CREATE POLICY "Ver despesas dos meus grupos" ON public.expenses FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.group_members WHERE group_members.group_id = expenses.group_id AND group_members.user_id = auth.uid()
));
CREATE POLICY "Inserir despesas nos meus grupos" ON public.expenses FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.group_members WHERE group_members.group_id = expenses.group_id AND group_members.user_id = auth.uid()
));

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nome)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'nome', 'Usuário'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

  CREATE OR REPLACE VIEW vw_group_balances AS
WITH group_totals AS (
    -- Calcula o total gasto no grupo e divide pela quantidade de membros
    SELECT 
        e.group_id,
        SUM(e.valor) as total_gasto,
        (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = e.group_id) as num_membros,
        SUM(e.valor) / (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = e.group_id) as cota_por_membro
    FROM expenses e
    GROUP BY e.group_id
),
user_spent AS (
    -- Calcula quanto cada usuário efetivamente pagou naquele grupo
    SELECT 
        group_id,
        paid_by as user_id,
        SUM(valor) as valor_pago
    FROM expenses
    GROUP BY group_id, paid_by
)
-- Cruza as informações para dar o saldo final
SELECT 
    gm.group_id,
    gm.user_id,
    u.nome,
    COALESCE(us.valor_pago, 0) as total_pago_pelo_usuario,
    gt.cota_por_membro as o_que_deveria_pagar,
    (COALESCE(us.valor_pago, 0) - gt.cota_por_membro) as saldo_final
FROM group_members gm
JOIN users u ON u.id = gm.user_id
LEFT JOIN group_totals gt ON gt.group_id = gm.group_id
LEFT JOIN user_spent us ON us.group_id = gm.group_id AND us.user_id = gm.user_id;
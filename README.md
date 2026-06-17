# 🧾📱 FechaConta

O **FechaConta** é um aplicativo mobile desenvolvido com **React Native** e **Expo** integrado ao **Supabase**. Ele foi projetado para simplificar a divisão de despesas e o fechamento de contas em grupos de amigos, repúblicas, viagens ou churrascos. O app calcula automaticamente o saldo individual de cada membro, indicando quem deve quanto e para quem, além de permitir o registro de pagamentos para liquidação das dívidas e anexo de comprovantes.

---

## 🚀 Funcionalidades Principais

*   **Autenticação Segura:** Cadastro e login com e-mail e senha gerenciados pelo Supabase Auth.
*   **Gestão de Grupos:**
    *   Criação de novos grupos.
    *   Entrada em grupos existentes através de um código de convite exclusivo (UUID do grupo).
    *   Compartilhamento nativo do código de convite do grupo.
*   **Controle de Despesas:**
    *   Lançamento de despesas detalhando descrição, valor e quem pagou.
    *   Anexo de fotos dos recibos/comprovantes de pagamento utilizando a câmera do celular ou a galeria de fotos.
*   **Divisão Automática de Contas:**
    *   Divisão igualitária do valor total acumulado no grupo entre todos os membros.
    *   Visualização do saldo final líquido (`saldo_final`) para saber se você está com crédito (saldo positivo) ou débito (saldo negativo).
*   **Liquidação de Dívidas (Settle Up):**
    *   Registro de pagamentos diretos entre membros do grupo para zerar os saldos.
    *   Processamento automático do histórico de liquidações para recalcular os saldos atualizados.
*   **Histórico e Logs de Atividades:**
    *   Visualização cronológica de todas as despesas e liquidações efetuadas.
    *   Acesso aos comprovantes/recibos anexados às compras.
*   **Perfil do Usuário:**
    *   Atualização de nome de exibição e senha.
    *   Estatísticas individuais: total de grupos participados e valor total pago em despesas.

---

## 🛠️ Tecnologias Utilizadas

### Frontend (Mobile)
*   **React Native** com **TypeScript**
*   **Expo SDK 54** (Fluxo Gerenciado com Expo Go ou builds nativas)
*   **React Navigation:** Bottom Tabs para navegação principal e Native Stack para navegação secundária.
*   **Expo Image Picker:** Acesso à câmera e à biblioteca de fotos do dispositivo.
*   **React Native Reanimated:** Animações fluidas nos modais de ações.
*   **Lucide React Native:** Biblioteca moderna de ícones vetoriais.
*   **Expo Font & Inter Google Fonts:** Tipografia personalizada.

### Backend & Banco de Dados (BaaS)
*   **Supabase:**
    *   **PostgreSQL:** Banco de dados relacional.
    *   **Supabase Auth:** Gerenciamento seguro de sessões de usuários.
    *   **Supabase Storage:** Bucket público (`receipts`) para armazenamento das imagens dos comprovantes.
    *   **Row Level Security (RLS):** Políticas de acesso para garantir que um usuário só consiga ver grupos, membros e despesas dos quais ele de fato faz parte.
    *   **PostgreSQL Views, Triggers e Functions:** Automação e cálculos de saldo direto no banco de dados.

---

## 📁 Estrutura do Projeto

Abaixo está a estrutura de diretórios do projeto no diretório `src`:

```text
src/
├── components/          # Componentes visuais reutilizáveis
│   ├── EmptyState/      # Exibido quando listas estão vazias
│   ├── ExpenseCard/     # Card de exibição de uma despesa
│   ├── GroupCard/       # Card de exibição de um grupo
│   ├── Header/          # Cabeçalho padrão do app
│   ├── Input/           # Inputs de texto personalizados
│   ├── Loading/         # Loader de carregamento (Spinner)
│   └── Toast/           # Sistema de notificações Toast customizado
├── context/             # Provedores de Contexto global
│   └── AuthContext.tsx  # Contexto de autenticação e estado do usuário logado
├── hooks/               # Custom hooks para encapsular lógica de estado e API
│   ├── useActivity.ts   # Hook da tela de atividades gerais
│   ├── useCreateGroup.ts# Hook do formulário de criação de grupo
│   ├── useGroupDetails.ts# Hook principal com cálculos e modais de grupo
│   ├── useGroups.ts      # Hook da listagem de grupos
│   ├── useLogin.ts       # Hook da tela de login
│   ├── useProfile.ts     # Hook de configurações do perfil
│   └── useRegister.ts    # Hook da tela de cadastro de usuário
├── navigations/         # Fluxo de roteamento e telas
│   ├── AppTabs.tsx      # Abas inferiores para usuários logados
│   ├── AuthStack.tsx    # Telas de Login/Cadastro para usuários não autenticados
│   ├── GroupStack.tsx   # Telas internas de detalhamento e criação de grupos
│   └── RootNavigator.tsx# Roteador raiz que direciona para Auth ou AppTabs
├── screens/             # Componentes de tela da aplicação
│   ├── activity/        # Tela de Atividade Geral
│   ├── auth/            # Telas de Login e Registro
│   ├── groups/          # Telas de Lista de Grupos, Detalhes e Formulário de Grupo
│   └── profile/         # Tela de Perfil do Usuário
├── services/            # Integrações com APIs externas
│   ├── api/             # Funções de requisição divididas por domínio
│   │   ├── activity.api.ts
│   │   ├── auth.api.ts
│   │   ├── groups.api.ts
│   │   └── profile.api.ts
│   └── supabase.ts      # Inicialização do cliente Supabase e checagem de variáveis
└── styles/              # Arquivos de estilo (StyleSheet)
```

---

## 🗄️ Modelo de Dados (Supabase)

O banco de dados do projeto baseia-se em 4 tabelas fundamentais, 2 funções auxiliares, um trigger e uma View complexa que realiza o fechamento de contas. O código SQL completo está disponível no arquivo [script.sql](file:///d:/projeto-mobile/script.sql).

### Tabelas
1.  **`public.users`:** Perfis de usuários. É mapeada 1:1 com `auth.users` através do trigger `on_auth_user_created`.
2.  **`public.groups`:** Armazena o nome dos grupos criados.
3.  **`public.group_members`:** Tabela associativa n:m conectando usuários e grupos.
4.  **`public.expenses`:** Armazena o registro de despesas e pagamentos de liquidação. A coluna `receipt_url` guarda o link da imagem no Supabase Storage.

### A View de Saldos (`vw_group_balances`)
A lógica de racha de contas está encapsulada na View `vw_group_balances`. Ela realiza os seguintes passos:
1.  Filtra despesas reais (ignorando as de descrição `"Liquidação%"`).
2.  Calcula o valor total gasto no grupo e divide pela quantidade de membros, determinando a **cota por membro**.
3.  Calcula o total que cada membro já pagou em despesas reais.
4.  Calcula quanto cada membro pagou em transações de liquidação.
5.  Calcula quanto cada membro recebeu em transações de liquidação (extraindo o UUID do beneficiário presente no texto da descrição `"Liquidação: para <UUID>"`).
6.  Faz a operação final:
    $$\text{Saldo Final} = (\text{Valor Pago} - \text{Cota por Membro}) + \text{Liquidações Pagas} - \text{Liquidações Recebidas}$$
    *   Se **`saldo_final` > 0**, o usuário tem direito a receber dinheiro.
    *   Se **`saldo_final` < 0**, o usuário deve pagar para ajustar a conta.

---

## ⚙️ Configuração do Ambiente

Siga os passos abaixo para configurar e executar o projeto localmente:

### 1. Pré-requisitos
*   [Node.js](https://nodejs.org/) instalado (versão LTS recomendada).
*   [Git](https://git-scm.com/) para clonar o repositório (opcional).
*   Um dispositivo móvel com o aplicativo [Expo Go](https://expo.dev/go) instalado ou um emulador Android/iOS configurado no computador.
*   Uma conta no [Supabase](https://supabase.com/).

### 2. Configurando o Backend no Supabase
1.  Acesse o painel do Supabase e crie um **novo projeto**.
2.  No menu lateral, vá em **SQL Editor** e crie uma nova query.
3.  Abra o arquivo [script.sql](file:///d:/projeto-mobile/script.sql) do projeto, copie todo o seu conteúdo, cole no SQL Editor do Supabase e clique em **Run**. Isso criará as tabelas, funções, políticas de segurança, triggers e a View de saldos.
4.  No menu lateral do Supabase, vá em **Storage**, crie um novo Bucket chamado `receipts` e marque-o como **Public** (Público), para que as imagens dos comprovantes possam ser enviadas e visualizadas pelos usuários do aplicativo.

### 3. Configurando as Variáveis de Ambiente
Na raiz do projeto, crie um arquivo `.env` baseado no arquivo `.env.example` fornecido:
```bash
cp .env.example .env
```
Abra o arquivo `.env` e preencha com as credenciais do seu projeto Supabase:
```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```
*As credenciais podem ser encontradas no painel do Supabase em: **Project Settings** > **API**.*

### 4. Instalação das Dependências
Instale os pacotes npm na raiz do projeto executando:
```bash
npm install
```

### 5. Executando o Aplicativo
Inicie o servidor de desenvolvimento do Expo (Metro Bundler):
```bash
npm run start
```
No terminal, será exibido um QR Code.
*   **Android:** Abra o aplicativo Expo Go e escaneie o QR Code usando a câmera ou o leitor de QR Code do próprio app.
*   **iOS:** Abra a câmera do iPhone e aponte para o QR Code para abrir o Expo Go.
*   **Emuladores:** Pressione `a` para rodar no emulador Android ou `i` para rodar no simulador iOS (necessário macOS e Xcode instalado).
*   **Limpar Cache:** Se alterar variáveis de ambiente ou tiver problemas de cache, você pode reiniciar usando `npm run start -- -c`.

---

## 🔒 Segurança (RLS - Row Level Security)

Para proteger a integridade dos dados, a segurança do Supabase foi ativada.
*   **Tabela de Usuários:** Qualquer usuário autenticado pode pesquisar perfis de outros usuários para poder adicioná-los aos grupos ou realizar pagamentos, mas apenas o dono do perfil pode alterar seu próprio nome (`auth.uid() = id`).
*   **Grupos, Membros e Despesas:** Um usuário só possui autorização de leitura (`SELECT`) e escrita (`INSERT`) em dados de grupos se a função `public.is_group_member(group_id, auth.uid())` retornar verdadeiro. Isso impede que usuários acessem dados de despesas ou grupos alheios.

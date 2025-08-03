# Sistema de Gerenciamento de Clientes

Sistema web completo para gerenciamento de clientes de uma empresa de marketing digital e desenvolvimento.

## 🚀 Funcionalidades

### 🔐 Autenticação
- Login para 2 administradores (e-mails/senhas predefinidos)
- Sistema de autenticação seguro com bcrypt

### 🧭 Navegação
- Sidebar fixa com navegação lateral
- Dashboard, Clientes, Serviços, Pagamentos e Configurações

### 👤 Gestão de Clientes
- Criar, editar e excluir clientes
- Informações completas: nome, e-mail, telefone, empresa, serviço contratado, data de início

### 💼 Serviços
- **Gerenciamento Completo**: Criar, editar e excluir serviços
- **Preços e Valores**: Definição de preços base para cada serviço
- **Desenvolvimento Web**: Sites institucionais, e-commerces e landing pages
- **Tráfego Pago**: Meta Ads e Google Ads com sub-serviços e preços individuais
- **Hospedagem de Sites**: Servidores otimizados com backups e SSL
- **Social Media**: 4 planos distintos (Start, Pro, Business, Premium) com preços variados

### 💰 Pagamentos
- **Cadastro Completo**: Criar, editar e excluir pagamentos
- **Seleção de Cliente**: Escolher cliente e contrato específico
- **Valores e Datas**: Definir valor, data de vencimento e data de pagamento
- **Status de Pagamento**: Pago, pendente, vencido, cancelado
- **Métodos de Pagamento**: PIX, transferência bancária, cartão de crédito/débito, dinheiro
- **Relatórios**: Visualização de receita total, pendências e vencidos

### 📊 Dashboard
- **Estatísticas em Tempo Real**: Total de clientes, contratos ativos, receita total e pagamentos pendentes
- **Saldo Pendente**: Valor total em pagamentos pendentes com destaque visual
- **Crescimento Mensal**: Comparação com o mês anterior para clientes e receita
- **Distribuição por Serviço**: Visualização de contratos ativos por tipo de serviço
- **Pagamentos Pendentes**: Lista detalhada com cliente, serviço, valor e data de vencimento
- **Pagamentos Recentes**: Lista dos últimos 5 pagamentos processados
- **Dados Reais**: Todas as informações são buscadas diretamente do banco de dados

## 🛠 Stack Tecnológica

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: TailwindCSS + ShadCN UI
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: bcryptjs + JWT (simples)
- **Ícones**: Lucide React
- **Gráficos**: Recharts

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd cliente-management
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
```bash
# Configure a variável DATABASE_URL no arquivo .env
# Exemplo: DATABASE_URL="postgresql://usuario:senha@localhost:5432/cliente_management"

# Gere o cliente Prisma
npm run db:generate

# Acesse o prisma com as infos
npx prisma studio

# Execute as migrações
npm run db:push

# Popule o banco com dados iniciais
npm run db:seed
```

### 4. Configure as variáveis de ambiente
Crie/edite o arquivo `.env`:
```env
DATABASE_URL="sua-url-do-postgresql"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta"
JWT_SECRET="sua-jwt-secreta"
```

### 5. Execute o projeto
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`



## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/           # Rotas de autenticação
│   │   └── login/
│   ├── (dashboard)/      # Rotas do dashboard
│   │   ├── dashboard/    # Página principal
│   │   ├── clients/      # Gestão de clientes
│   │   ├── services/     # Gestão de serviços
│   │   ├── payments/     # Gestão de pagamentos
│   │   └── settings/     # Configurações
│   ├── api/              # API Routes
│   │   └── auth/
│   └── globals.css
├── components/
│   ├── ui/               # Componentes base (Button, Input, Card, etc.)
│   └── layout/           # Componentes de layout (Sidebar)
└── lib/
    ├── prisma.ts         # Configuração do Prisma
    ├── auth.ts           # Utilitários de autenticação
    └── utils.ts          # Utilitários gerais
```

## 🗄️ Modelos do Banco de Dados

### User (Usuários)
- Administradores do sistema
- Email, senha, nome, role

### Client (Clientes)
- Informações dos clientes
- Nome, email, telefone, empresa, data de início

### Service (Serviços)
- Tipos de serviços oferecidos
- Nome, descrição, tipo, preço base

### SubService (Sub-serviços)
- Sub-serviços específicos (ex: Meta Ads, Google Ads)
- Relacionado ao serviço de Tráfego Pago
- Nome, descrição, preço individual

### Plan (Planos)
- Planos para Social Media
- Nome, descrição, posts por mês, preço

### Contract (Contratos)
- Relaciona cliente com serviço
- Status, datas de início/fim

### Payment (Pagamentos)
- Pagamentos dos contratos
- Valor, datas, status, método de pagamento

## 🚀 Scripts Disponíveis

- `npm run dev` - Executa o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Executa o servidor de produção
- `npm run lint` - Executa o linter
- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:push` - Executa as migrações
- `npm run db:seed` - Popula o banco com dados iniciais

## 🔧 Personalização

### Adicionar Novos Serviços
1. Adicione o novo tipo no enum `ServiceType` no schema do Prisma
2. Acesse a página de Serviços no sistema
3. Clique em "Novo Serviço" para criar um novo serviço
4. Defina o nome, descrição, tipo e preço base
5. Para Tráfego Pago: adicione sub-serviços com preços individuais
6. Para Social Media: adicione planos com diferentes preços

### Gerenciar Valores dos Serviços
1. Acesse a página de Serviços
2. Clique no ícone de edição (lápis) do serviço desejado
3. Modifique o preço base ou adicione/remova sub-serviços/planos
4. Salve as alterações
5. Os valores serão atualizados automaticamente na interface

### Cadastrar Novos Pagamentos
1. Acesse a página de Pagamentos
2. Clique em "Novo Pagamento"
3. Selecione o cliente e o contrato
4. Defina o valor, data de vencimento e método de pagamento
5. Adicione uma descrição (opcional)
6. Salve o pagamento
7. O pagamento aparecerá na lista com o status definido

### Modificar Planos
1. Edite os planos no arquivo `prisma/seed.ts`
2. Execute `npm run db:seed` novamente

### Customizar Interface
- Componentes UI em `src/components/ui/`
- Estilos globais em `src/app/globals.css`
- Configurações do Tailwind em `tailwind.config.js`

## 🐛 Solução de Problemas

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme a URL de conexão no `.env`
- Execute `npm run db:push` para criar as tabelas

### Erro de autenticação
- Verifique se o seed foi executado: `npm run db:seed`
- Confirme as credenciais no console após o seed

### Erro de build
- Limpe o cache: `rm -rf .next`
- Reinstale dependências: `rm -rf node_modules && npm install`

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, envie um email para suporte@empresa.com ou abra uma issue no repositório.

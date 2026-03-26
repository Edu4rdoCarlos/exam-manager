# Frontend — Exam Manager

Next.js + TypeScript. Interface web disponível em `http://localhost:3000`.

## Como rodar

```bash
cd monorepo/frontend
npm run dev
```

## Estrutura de componentes

```
src/components/
├── primitives/   # shadcn/ui base components (npx shadcn add vai aqui)
├── shared/       # Componentes reutilizáveis entre features
├── layout/       # Componentes específicos por feature (ex: layout/app/, layout/dashboard/)
└── providers/    # React context providers (AuthProvider, QueryProvider, etc.)
```

## Variáveis de ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

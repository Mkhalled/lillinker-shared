# Lillinker Shared — Claude Code Context

## Ce que fait ce projet
Plateforme SaaS Next.js 16 qui met en relation des **freelancers** (consultants en portage salarial) avec des **entreprises de portage** (sociétés). Les freelancers publient des demandes de mission, les entreprises répondent avec des offres tarifées.

## Package manager
pnpm 9.14.4 — toujours utiliser `pnpm`, jamais `npm`. Lockfile : `pnpm-lock.yaml`.

## Démarrer le projet
```bash
docker-compose up -d          # Démarrer PostgreSQL
pnpm install
pnpm prisma:migrate           # Appliquer les migrations
pnpm prisma:seed              # Seeder les données de référence + utilisateurs demo
pnpm dev                      # http://localhost:3000
```

## Stack technique
- **Next.js 16** avec App Router — pas de Pages Router
- **TypeScript 5.3** — strict mode, pas de `any` sans justification commentée
- **Prisma 5** / **PostgreSQL 15** — schéma à `prisma/schema.prisma`
- **NextAuth v4** — credentials + flux de vérification email
- **next-intl v4** — i18n pour la landing page uniquement (en/fr), messages à `src/messages/`
- **Tailwind CSS 3** + **MUI v7** (emotion)
- **Winston** — logging structuré, jamais de `console.log` dans le code de production
- **Zod** — validation de tous les formulaires et inputs API
- **Jest 29** — tests unitaires dans `tests/unit/`
- **pnpm + Husky + commitlint** — commits conventionnels obligatoires

## Architecture des couches
```
src/app/api/       → Routes API Next.js (minces, délèguent aux services)
src/services/      → Logique métier (auth, company, freelance, profile, platform)
src/dao/           → Accès données Prisma, un fichier par domaine
src/lib/           → Transversal : logger, prisma client, mailer, feature-flags, utils
src/components/    → Composants React (landing/, onboarding/, form/, ui/, tables/, etc.)
src/types/         → Types et interfaces TypeScript
src/validations/   → Schémas Zod
```

**Règle absolue** : Les requêtes Prisma appartiennent à `src/dao/`. Les services n'importent pas PrismaClient directement. Les routes API n'importent pas PrismaClient directement.

## Rôles utilisateurs et routing
| Rôle      | Préfixe dashboard             |
|-----------|-------------------------------|
| ADMIN     | `/admin/`                     |
| COMPANY   | `/company/admin/`             |
| MANAGER   | `/company/manager/`           |
| FREELANCE | `/consultant/`                |

Le middleware (`src/middleware.ts`) enforces le RBAC via le token de session NextAuth. La landing page est sous `src/app/[locale]/` (next-intl).

## Flux d'authentification
1. Inscription sur `/auth/register` → token de vérification email envoyé via nodemailer
2. Clic sur le lien email → `GET /api/auth/verify-email?token=` → redirige vers `/auth/set-password?token=`
3. Définition du mot de passe → redirection vers le dashboard selon le rôle

## Modèle de données clés
- `User` — modèle central, a `role`, `email_verified`, `verification_token`, `reset_token`
- `Freelance` — one-to-one avec User, a des `FreelanceRequest` (missions publiées)
- `Company` — one-to-one avec User (admin), a des managers, services, réponses
- `CompanyResponse` — réponse d'une entreprise à une FreelanceRequest, prix stocké en JSON
- `PlatformService` — services définis par l'admin (mutualisation, frais km, etc.) — `id: 5` est toujours "Frais kilométriques"
- `Organisme` / `Cotisation` — structures de charges sociales spécifiques à l'entreprise

## Conventions de code
- **Pas de console.log** — utiliser `import { logger } from '@/lib/logger'` côté serveur
- **Commits conventionnels** enforced par commitlint : `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `style:`, `ci:`, `build:`, `perf:`, `revert:`
- **Pas de commits directs sur `main` ou `develop`** — hook Husky prévu
- **Feature flags** — `src/lib/feature-flags.ts`, actuellement seul `enableDashboard`
- **Alias `@/`** résout vers `src/`
- **Composants** : arrow function components, pas de class components
- **Gestion d'erreurs** : try/catch avec logger.error(), response JSON structurée `{ error: string }`

## Tests
```bash
pnpm test              # Tous les tests
pnpm test:unit         # Tests unitaires seulement
pnpm test:coverage     # Avec rapport de couverture
pnpm test:ci           # CI (max 2 workers)
```
Les tests utilisent une BDD PostgreSQL dédiée. Configurer via `.env.test`.

## CI/CD (GitHub Actions)
- `.github/workflows/ci.yml` — déclenché sur push/PR vers `main` ou `develop`
- Étapes : type-check → ESLint → migrations → Jest → build Next.js

## Variables d'environnement requises
Voir `.env` pour la liste complète. Les clés essentielles :
- `DATABASE_URL` — chaîne de connexion PostgreSQL
- `NEXTAUTH_SECRET` — secret de signature NextAuth
- `NEXTAUTH_URL` — URL de l'application (ex: `http://localhost:3000`)
- `EMAIL_*` — config SMTP pour nodemailer (emails de vérification)
- `VERCEL=1` — défini par Vercel, désactive le transport Winston fichier

## Stratégie de branches
- `main` — production, protégée
- `develop` — branche d'intégration (273 commits devant main au 2026-06-06)
- `develop-ia` — branche de consolidation assistée par IA (voir `scripts/consolidate-branches.sh`)
- Feature branches : courtes, mergées via PR dans develop

## Problèmes de qualité connus (à corriger)
- 20+ instances de `console.error()` dans les routes API → remplacer par `logger.error()`
- `src/app/api/company/response/[requestId]/route.ts` : 466 lignes → refactoriser en handlers séparés
- Vérifications d'auth répétées dans toutes les routes → candidat pour un middleware ou wrapper
- Schéma de réponse d'erreur incohérent entre les routes → standardiser

## Documentation
Documentation technique complète dans `docs/` : data-model.md, git-workflow.md, logging.md, testing.md, database-setup.md, development-standards.md

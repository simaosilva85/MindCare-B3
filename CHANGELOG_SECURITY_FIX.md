# Correctifs sécurité — 2026-04-18

## P0 — critique

### 1. Clé Gemini retirée du client
- **Avant** : `src/services/chatService.ts` instanciait `GoogleGenAI` avec la clé `AIzaSyDm…ZI3s` en dur → clé présente dans le bundle JS, extractible par n'importe qui.
- **Après** : nouvelle route backend `server/routes/chat.js` (POST /api/chat), protégée par le middleware `protect` (JWT obligatoire). La clé est lue depuis `GEMINI_API_KEY` côté serveur uniquement.
- **Fichiers** : `src/services/chatService.ts`, `server/routes/chat.js` (nouveau), `server/index.js`, `package.json` (retrait `@google/genai` front), `server/package.json` (ajout `@google/genai`).
- **⚠ Action manuelle requise** : révoquer l'ancienne clé sur https://aistudio.google.com/apikey et en générer une nouvelle, puis la poser dans `server/.env`.

### 2. Secrets retirés du versioning
- **Avant** : `server/.env` commité avec `MONGODB_URI` en clair (user `mindcare` / mdp `Mindcare321` sur `cluster0.jivgdc3`) et `JWT_SECRET=mindcare_secret_key_change_me`.
- **Après** :
  - `.gitignore` mis à jour (root) : ignore `.env`, `server/.env`, variantes `.local`.
  - `server/.env.example` créé avec placeholders.
  - `.env.example` créé à la racine pour le front (`VITE_API_URL`).
  - `server/.env` : `JWT_SECRET` régénéré (`openssl rand -hex 64`), `MONGODB_URI` remis en placeholder, `GEMINI_API_KEY` ajouté (vide, à remplir), `CORS_ORIGIN` ajouté.
- **⚠ Actions manuelles requises** :
  1. **Rotate mdp MongoDB Atlas** (utilisateur `mindcare` sur cluster0.jivgdc3) → mettre la nouvelle URI dans `server/.env`.
  2. Re-coller la valeur MONGODB_URI réelle (placeholder par défaut actuellement).
  3. Re-coller la `GEMINI_API_KEY` fraîchement générée.

### 3. Guard au démarrage serveur
- `server/index.js` refuse de démarrer si `MONGODB_URI` absent ou `JWT_SECRET` absent/défaut. Crash explicite avec message d'erreur.

## P1 — important

### 4. Validation zod sur tous les endpoints
- `server/routes/auth.js` :
  - `/register` : `name` 1..80, `email` format valide, `password` 6..128.
  - `/login` : `email` format valide, `password` ≥ 1.
- `server/routes/chat.js` :
  - `history` : 1..50 messages, chaque `text` ≤ 2000 chars, `role` ∈ {user, model}.
- Erreur 400 avec détails `errors.fieldErrors` en cas d'échec.

### 5. Middleware `protect` utilisé
- `/api/auth/me` utilise maintenant `router.get("/me", protect, …)` au lieu de la vérif inline dupliquée.
- `/api/chat` utilise `protect` → impossible d'appeler sans JWT valide.

### 6. Rate-limit
- `/api/auth/*` : 10 requêtes / 15 min / IP (brute-force login/register).
- `/api/chat` : 20 requêtes / min / IP (quota IA, protège la facture).
- Via `express-rate-limit`.

### 7. CORS configurable
- `CORS_ORIGIN` = liste séparée par virgules dans `.env`.
- Défaut : `http://localhost:5173,http://localhost:8080`.
- Rejette les origines non listées (en dehors des requêtes sans Origin, qui passent).

### 8. Limite taille body
- `express.json({ limit: "100kb" })` → évite DoS par body massif.

### 9. Credentials de test retirés
- `src/pages/LoginPage.tsx` : bloc "Données de test : user@test.com / password123" supprimé.

## Ce qui reste (P1/P2, hors scope de cette itération)

- **JWT dans localStorage** — toujours là, toujours vulnérable à XSS. Migration vers cookie HttpOnly à prévoir.
- **helmet** à ajouter (headers de sécurité : X-Frame-Options, X-Content-Type-Options, CSP…).
- **Logging structuré** (pino/winston) + monitoring.
- **Persistance** journal / moods / conversations (toutes les TODO listées dans le README).

## Comment démarrer après ces fixes

```bash
# 1. Backend
cd server
cp .env.example .env
# éditer .env : MONGODB_URI (après rotation Atlas), GEMINI_API_KEY (nouvelle clé)
npm install       # ou bun install
npm run dev

# 2. Frontend
cd ..
cp .env.example .env   # facultatif
bun install       # ou npm install
bun dev
```

Le serveur crashera explicitement si `MONGODB_URI` ou `JWT_SECRET` n'est pas correctement renseigné.

# MindCare

Application web mobile-first de soutien au bien-être mental pour les jeunes : chat IA empathique, suivi d'humeur, journal intime, exercices de respiration, mode vocal mains libres. Pensée comme un compagnon de poche (largeur max 430 px), pas comme un outil clinique.

> ⚠ MindCare n'est pas un dispositif médical. En cas de détresse sévère ou d'idées suicidaires, l'app redirige vers le **3114** (numéro national de prévention du suicide, gratuit, 24/7) ou le **114 par SMS**.

---

## Sommaire

1. [Vue d'ensemble](#vue-densemble)
2. [Fonctionnalités détaillées](#fonctionnalités-détaillées)
3. [Stack technique & choix d'architecture](#stack-technique--choix-darchitecture)
4. [APIs & services externes — pourquoi ces choix](#apis--services-externes--pourquoi-ces-choix)
5. [Plan de migration Gemini → Mistral (souveraineté & RGPD)](#plan-de-migration-gemini--mistral-souveraineté--rgpd)
6. [Architecture système](#architecture-système)
7. [Modèle de données](#modèle-de-données)
8. [API Backend](#api-backend)
9. [Services & hooks frontend](#services--hooks-frontend)
10. [Intégration IA](#intégration-ia)
11. [Variables d'environnement](#variables-denvironnement)
12. [Installation & démarrage](#installation--démarrage)
13. [Considérations RGPD & données de santé](#considérations-rgpd--données-de-santé)
14. [Sécurité](#sécurité)
15. [Roadmap / TODO](#roadmap--todo)
16. [Structure du projet](#structure-du-projet)

---

## Vue d'ensemble

### Le problème
La santé mentale des jeunes se dégrade (isolement, anxiété, charge académique). Les outils existants sont soit trop cliniques (plateformes de téléconsultation lourdes), soit trop superficiels (chatbots génériques sans garde-fous). Beaucoup d'utilisateurs décrochent avant d'avoir un rendez-vous avec un pro.

### L'approche MindCare
Un compagnon conversationnel quotidien qui :
- **Écoute sans juger** via une IA conversationnelle briefée en tant qu'espace de soutien (pas de diagnostic, orientation systématique vers les numéros d'urgence en cas de signal fort).
- **Donne des outils concrets** : respiration guidée, suivi d'humeur, journaling.
- **Reste accessible** : mobile-first, dark mode, mode vocal pour les moments où écrire est trop.

### Public cible
Jeunes 15-25 ans, francophones. L'UX est tutoiement systématique, vocabulaire accessible, ton chaleureux — piloté par le system prompt de l'IA et la copie UI.

### Stade du projet
**MVP fonctionnel, non persistant**. L'auth est en base (MongoDB). Le reste (humeurs, journal, conversations) vit en mémoire React et disparaît au reload. La persistance métier est la prochaine étape (voir [Roadmap](#roadmap--todo)).

---

## Fonctionnalités détaillées

### 1. Onboarding (`/onboarding`)
Trois slides d'introduction animées (framer-motion) présentent les piliers : parler, suivre son humeur, retrouver le calme. Dots de progression, bouton *Passer* pour court-circuiter. Objectif : donner immédiatement du sens à l'app sans formulaire interminable.

*Limitation actuelle* : pas de flag `onboardingCompleted` en base, donc non ré-affiché automatiquement après première connexion. À ajouter côté modèle User.

### 2. Authentification (`/login`, `/signup`)
- **Inscription** : nom, email, mot de passe (≥ 6 chars), confirmation. Validation côté serveur avec zod.
- **Connexion** : email + mot de passe. Réponse 401 générique "Email ou mot de passe incorrect" (évite l'énumération des comptes).
- **Session** : JWT HS256 valable 7 jours, stocké en `localStorage`. Hydraté au mount via `AuthContext`.
- **Hash mot de passe** : `bcryptjs` cost 12 (~250 ms par vérif sur une machine moderne — volontairement lent, pour pénaliser le brute-force).
- **Rate-limit** : 10 tentatives / 15 min / IP sur `/api/auth/*` (empêche le brute-force automatisé).

### 3. Accueil (`/home`)
Vue d'arrivée post-connexion. Trois blocs :
- **Greeting contextuel** selon l'heure (Bonjour / Bon après-midi / Bonsoir).
- **MoodSelector** (😊 Bien / 😐 Bof / 😔 Triste / 😰 Stressé / 😡 En colère) — state local pour l'instant.
- **CTAs rapides** : *Parler maintenant* (chat), *Respirer* (exercices), *Journal* (écrire), *Pensée du jour* (phrase bienveillante aléatoire).

### 4. Chat IA (`/chat`) — cœur de l'app
- **Conversation texte** en français, ton tutoyant, réponses courtes (2-4 phrases par défaut).
- **System prompt** strict : MindCare n'est pas un pro de santé, pas de diagnostic, redirection 3114/114 en cas de détresse exprimée.
- **Prompts rapides** (quick replies) visibles tant que la conversation est vide : *Je me sens stressé(e)*, *J'ai besoin de parler*, etc.
- **Mode vocal** (icône haut-parleur dans le header) :
  - *STT* — écoute micro via Web Speech API, langue fr-FR, transcription envoyée comme un message texte.
  - *TTS* — la réponse de MindCare est lue à voix haute (`speechSynthesis`, fr-FR).
  - *Auto-loop* : après que l'IA a fini de parler, le micro se rallume automatiquement → conversation mains libres.
- **Bouton "Écouter"** sur chaque réponse de l'IA hors mode vocal (lecture à la demande).
- **Bulle de statut** : *MindCare parle…* / *Je t'écoute…* / *MindCare réfléchit…*
- **Historique** : conservé côté client dans une variable module-level, envoyé au backend à chaque tour. Non persisté entre sessions (voir [Roadmap](#roadmap--todo)).
- **Rate-limit** : 20 messages / min / IP (protection du quota Gemini et de la facture).
- **Taille max** : 50 messages par historique envoyé, 2000 caractères par message (validation zod).

### 5. Suivi d'humeur (`/suivi`)
- MoodSelector du jour.
- Bargraph hebdomadaire (lun → dim) avec emoji et hauteur proportionnelle à la valeur d'humeur (1-4).
- Stats synthétiques : *Jours actifs ce mois*, *Humeur moyenne*, *Streak* (jours consécutifs).
- Shortcut vers le journal.

*Limitation actuelle* : l'historique hebdomadaire et les stats sont **hardcodés** dans [`SuiviPage.tsx`](src/pages/SuiviPage.tsx). Dès que le modèle `Mood` backend sera en place, ces valeurs deviendront calculées.

### 6. Journal intime (`/journal`)
- Liste chronologique d'entrées (*Aujourd'hui*, *Hier*, dates antérieures).
- Chaque entrée porte un emoji d'humeur + un texte libre.
- Bouton **+** pour ajouter une entrée : sélecteur d'humeur (5 emojis) + textarea.
- Entrées de démo hardcodées au premier rendu — à remplacer par un fetch `/api/journal` une fois la persistance en place.

**Pourquoi c'est important** : le journaling (*expressive writing*) a une littérature scientifique solide sur la réduction du stress et l'aide à la régulation émotionnelle. Plus efficace quand c'est *quotidien* et *rapide* (≤ 5 min). D'où le design : créer une entrée en 3 taps max.

*Limitation actuelle* : entrées perdues au reload (state local). Priorité P1 de persistance.

### 7. Exercices de respiration (`/respiration`)
Trois protocoles :

| Nom | Inspire | Retiens | Expire | Durée | Objectif |
|-----|---------|---------|--------|-------|----------|
| Respiration calme | 4s | 4s | 4s | 60s | Réduction générale de l'activation (box breathing) |
| Anti-stress | 4s | 7s | 8s | 60s | Méthode 4-7-8 (Dr. Andrew Weil), ralentit le rythme cardiaque |
| Recentrage | 5s | 5s | 5s | 90s | Ancrage / recentrage avant une tâche ou un moment difficile |

- Cercle animé (framer-motion) qui grossit/rétrécit au rythme de la phase (inspire/retiens/expire).
- Label texte en direct : *Inspire…* / *Retiens…* / *Expire…*
- Timer décompte (MM:SS), bouton Play/Pause, reset.

**Pourquoi ces exos** : ils agissent sur le système parasympathique via le nerf vague (respiration longue et contrôlée). Effet quasi immédiat sur la sensation de stress aiguë — utile entre deux messages du chat ou avant de dormir.

### 8. Profil (`/profil`)
- Avatar (initiale) + nom + email de l'utilisateur connecté.
- Stats (check-ins, streak, notes journal) — actuellement hardcodées.
- Menu : *Thème* (toggle dark/light intégré), *Notifications*, *Confidentialité*, *Mentions légales*, *À propos*.
- Bouton **Se déconnecter** : clear localStorage + redirection `/login`.

*Limitation actuelle* : les menus autres que Thème et Logout ne sont pas encore câblés.

### 9. Thème clair / sombre
- Intégré partout via `next-themes` (attribut `class` sur `<html>`).
- Toggle dans le header de chaque page.
- Tokens HSL définis dans [`src/index.css`](src/index.css) — palette pastel sage / lavender / cream / peach pour éviter l'agressivité visuelle (volontaire sur une app santé mentale).
- Préférence persistée en localStorage (`storageKey: "theme"`).

### 10. Mobile-first responsive
- Container max-width **430 px** (taille iPhone), centré desktop.
- Bottom nav fixe (Accueil / Parler / Suivi / Profil) — pattern d'app native.
- Safe-area iOS (notch, home bar) gérée via `env(safe-area-inset-*)` dans le CSS.
- Pas de scrollbar visible (mobile feel).

### 11. Protection des routes
Toutes les routes métier passent par `PrivateRoute` ([`App.tsx:22`](src/App.tsx)) qui vérifie `isLoggedIn` et redirige vers `/login` sinon. Pendant l'hydratation du context Auth, un spinner s'affiche — évite les redirections flash.

---

## Stack technique & choix d'architecture

### Frontend

| Techno | Version | Pourquoi |
|--------|---------|----------|
| **React 18** | 18.3 | Concurrent features, écosystème massif, équipe déjà à l'aise |
| **TypeScript** | 5.8 | Typage statique, ergonomie IDE. Config volontairement laxiste (`strictNullChecks: false`) sur ce MVP — à durcir plus tard |
| **Vite** | 5.4 | Dev server ~50 ms au démarrage (vs ~5 s webpack). Plugin SWC pour la compil TS/React |
| **React Router 6** | 6.30 | Standard pour SPA routing, DataRouter pas nécessaire à ce stade |
| **Tailwind CSS** | 3.4 | Design tokens centralisés, classes utilitaires → vitesse d'itération sur une UI produit |
| **shadcn/ui** | n/a | Composants Radix customisés, copié-collés dans le repo → contrôle total du code, pas de lock dans une lib versionnée |
| **framer-motion** | 12 | Animations ergonomiques (onboarding, chat bubbles, cercle de respiration). `useAnimatePresence` pour les transitions in/out |
| **next-themes** | 0.3 | Dark mode sans flash, SSR-safe (utile si on passe à Next plus tard) |
| **@tanstack/react-query** | 5.83 | Provider monté, pas encore utilisé. Prévu pour la persistance journal/mood (cache + invalidation) |
| **zod** | 3.25 | Validation de schémas. Côté serveur pour l'instant, côté formulaires front à venir avec `@hookform/resolvers` |
| **lucide-react** | 0.462 | Set d'icônes tree-shakable, style cohérent |
| **Plus Jakarta Sans** | Google Fonts | Police arrondie, douce, adaptée au ton bienveillant de l'app |

**Pourquoi pas Next.js ?** L'app n'a pas besoin de SSR (pas de SEO sur du contenu utilisateur privé), le routing est simple, et le bundle React+Vite reste plus léger. Si on ajoute des landing pages marketing publiques, Next devient pertinent.

### Backend

| Techno | Version | Pourquoi |
|--------|---------|----------|
| **Node.js** | ≥ 18 ESM | Stack JS unifiée front/back (recrutement plus facile, share de types possibles) |
| **Express** | 4.21 | Minimaliste, maîtrisé. Fastify/Hono plus perf mais surdimensionnés pour l'échelle actuelle |
| **Mongoose** | 8.8 | ODM MongoDB mature, hooks pre/post, validations au niveau schema |
| **bcryptjs** | 2.4 | Pure JS (pas de native binding à compiler), cost 12 pour la prod |
| **jsonwebtoken** | 9.0 | HS256 + secret fort = suffisant à cette échelle. RS256 si on passe à du multi-service |
| **zod** | 3.25 | Validation runtime des bodies — remplace le legacy Joi/Yup |
| **express-rate-limit** | 7.4 | Anti-brute-force sur `/auth`, anti-spam sur `/chat` |
| **cors** | 2.8 | Liste d'origines configurable via `CORS_ORIGIN` |
| **dotenv** | 16 | Chargement `.env` local (en prod, les env vars viennent de l'hébergeur) |
| **@google/genai** | 1.46 | SDK officiel Gemini, utilisé côté serveur uniquement |

**Pourquoi Express plutôt que Fastify/Hono ?** Écosystème plus large (middlewares `cors`, `express-rate-limit`, `helmet`…), documentation abondante. À l'échelle MVP, la différence de perf est imperceptible. Migration facile si besoin plus tard.

**Pourquoi MongoDB plutôt que PostgreSQL ?** Voir section suivante.

---

## APIs & services externes — pourquoi ces choix

### Google Gemini (actuel — via `/api/chat`)
- **Ce que c'est** : l'API LLM de Google, modèles famille Gemini (2.5 Flash, 2.5 Pro, 3.x preview). Appelée côté serveur avec `@google/genai`.
- **Pourquoi ici** :
  - **Vitesse d'itération** : un SDK, une clé, ~30 min d'intégration.
  - **Coût** : Gemini 2.5 Flash est parmi les LLMs les moins chers sur le tier "fast" (~$0.075 / M tokens input). Un tchat de 10 min coûte typiquement < 0.001 €.
  - **Qualité en français** : comparable à GPT-4o-mini, correcte pour du dialogue empathique court.
  - **Pas d'empreinte infrastructure** : pas de GPU à provisionner, pas de modèle à fine-tuner.
- **Limites assumées aujourd'hui** :
  - Données envoyées **hors UE** (serveurs Google US) → ⚠ incompatible avec un traitement RGPD strict de données de santé mentale. Tant qu'on est en phase de prototypage sans vrais utilisateurs sensibles, on peut vivre avec. **En prod avec des utilisateurs réels, il faut migrer.** (Voir [plan Mistral](#plan-de-migration-gemini--mistral-souveraineté--rgpd).)
  - Quota / latence à la main de Google.

### Google Web Speech API (STT + TTS, navigateur)
- **Ce que c'est** : API standard W3C implémentée par les navigateurs (bien par Chromium/Edge/Safari, partiellement par Firefox). STT = `webkitSpeechRecognition`, TTS = `speechSynthesis`.
- **Pourquoi ici** :
  - **Zéro coût, zéro backend** : tout tourne dans le navigateur de l'utilisateur.
  - **Latence imbattable** : pas d'upload audio au serveur.
  - **Respect vie privée relatif** : le flux audio ne passe pas par nos serveurs (⚠ côté STT Chrome, l'audio va quand même chez Google en arrière-plan — c'est la réalité de l'implémentation Chromium).
- **Limite** : Firefox desktop supporte `speechSynthesis` mais pas `SpeechRecognition`. L'app gère la détection (`isSupported`) et cache les boutons vocaux si indisponible.
- **Alternative envisagée** : Whisper (OpenAI) ou Faster-Whisper self-hosted pour le STT → plus précis mais complique l'archi et le coût. Gardé en backup si la qualité Web Speech déçoit sur le terrain.

### MongoDB Atlas (base de données)
- **Ce que c'est** : MongoDB en cloud managé (AWS eu-west-1 par défaut). Collection `users` seulement aujourd'hui.
- **Pourquoi MongoDB plutôt que PostgreSQL ?**
  - **Schéma flexible** : les entrées de journal, les moods, les messages de conversation n'ont pas de schéma rigide. Un mood peut avoir des tags, une entrée de journal peut avoir des pièces jointes plus tard — Mongo absorbe les évolutions sans migrations douloureuses.
  - **Simplicité des embeddings** : une conversation = un document avec un tableau de messages. En SQL, ça devient deux tables et des joints.
  - **Atlas free tier** (512 Mo) suffit largement pour le MVP.
- **Pourquoi pas SQLite ou un BaaS (Firebase/Supabase) ?**
  - SQLite : pas de cluster managé, backups à la main → pas adapté à un hébergement serverless multi-région.
  - Firebase : très bien pour prototyper, mais lock-in fort, pricing opaque à l'échelle, et les règles Firestore deviennent vite un enfer à auditer. Supabase est une alternative crédible (Postgres + auth + storage). Choix MongoDB ici parce que l'équipe est déjà à l'aise.
- **Limite RGPD** : Atlas en région EU OK, mais il faut signer le DPA MongoDB et cocher "EU only" à la création du cluster. Vérifier avant prod.

### JWT (JSON Web Token)
- **Ce que c'est** : token signé HS256, contient `{ id: userId }`, expire à 7 jours.
- **Pourquoi JWT plutôt que sessions serveur ?**
  - **Stateless** : pas de store Redis/Memcached pour les sessions → simplifie l'infra.
  - **Standard** : intégration triviale avec un futur mobile (React Native / Flutter) ou un autre service (webhooks signés).
- **Limite connue** : stocké en `localStorage` = exposé à XSS. Migration cookie `HttpOnly; Secure; SameSite=Strict` prévue (P1 sécurité).

---

## Plan de migration Gemini → Mistral (souveraineté & RGPD)

### Pourquoi on va migrer

Les conversations MindCare contiennent potentiellement :
- Des **données de santé** au sens du RGPD article 9 (santé mentale, idées noires, médication mentionnée…).
- Des **données concernant des mineurs** (public cible inclut les 15-18 ans).

Les données art. 9 exigent :
1. Une **base légale renforcée** (consentement explicite ou intérêt public en matière de santé).
2. Un **hébergement conforme** — typiquement dans l'UE, avec DPA signé.
3. Des **garanties supplémentaires** sur les transferts hors UE (clauses contractuelles types après Schrems II, insuffisantes pour de la santé selon la CNIL).

**Google Gemini** traite les requêtes sur des serveurs aux États-Unis. Même avec les nouvelles clauses DPF (Data Privacy Framework), ce n'est pas le terrain le plus sûr pour des données de santé au sens strict. La CNIL recommande en pratique des alternatives européennes sur ce type de traitement.

### Pourquoi Mistral AI

- **Entreprise française** (Paris), modèles conçus en France.
- **La Plateforme Mistral** : hébergement possible dans l'UE (région `eu-west`).
- **DPA disponible**, conforme RGPD.
- **Open-weights** sur plusieurs modèles (`Mistral 7B`, `Mixtral 8x7B`, `Mistral Small`) : possibilité de **self-hoster** si on veut garder le contrôle total (Scaleway, OVH, on-prem).
- **Qualité française** : les modèles Mistral sont entraînés avec plus de corpus FR que les modèles US → meilleure justesse de ton et de registre pour du dialogue empathique.

### Modèles ciblés

| Modèle | Quand l'utiliser | Coût approximatif |
|--------|-----------------|-------------------|
| `mistral-small-latest` | Défaut pour le chat quotidien | ~€0.20 / M tokens input |
| `mistral-large-latest` | Cas complexes (détection de détresse, reformulation) | ~€2 / M tokens input |
| Self-hosted `Mistral-Nemo` ou `Mistral-Small` open-weights | Si besoin de souveraineté totale | coût infra GPU (Scaleway ~€0.40/h en H100) |

### Ce qu'il faudra changer techniquement

La bonne nouvelle : l'architecture actuelle **isole déjà le LLM derrière la route `/api/chat`**. Le front ne verra pas la différence.

1. Remplacer le SDK : `@google/genai` → `@mistralai/mistralai` (ou appel HTTP direct à `https://api.mistral.ai`).
2. Adapter le format des messages : Mistral utilise `[{ role, content }]` (format OpenAI-compatible) vs Gemini `[{ role, parts: [{ text }] }]`. Un petit adaptateur dans `server/routes/chat.js` suffit.
3. Changer les env vars : `GEMINI_API_KEY` → `MISTRAL_API_KEY`, `GEMINI_MODEL` → `MISTRAL_MODEL`.
4. Réévaluer le system prompt (les modèles Mistral suivent bien les instructions mais ont leur propre sensibilité — à tester).
5. Signer le DPA Mistral, documenter le traitement dans le registre RGPD.

**Effort estimé** : 1-2 jours de dev + 1 semaine de tests de qualité conversationnelle sur un panel.

### En attendant la migration

- Ne pas lancer la prod avec de vrais utilisateurs sensibles tant que Gemini est en place.
- Les comptes de test / démo sont OK.
- Afficher clairement dans les mentions légales que les conversations sont traitées par un LLM hors UE (tant que c'est le cas).

---

## Architecture système

```
┌─────────────────────┐                       ┌──────────────────────┐
│  Navigateur         │                       │  Google Gemini API   │
│  (React, :8080)     │                       │  (modèle configurable │
│                     │                       │   GEMINI_MODEL)       │
│  localStorage:      │                       └──────────▲───────────┘
│   - token (JWT)     │                                  │
│   - user (JSON)     │                                  │ @google/genai
│                     │                                  │ (serveur)
│  state React:       │                                  │
│   - moods           │         fetch         ┌──────────┴───────────┐
│   - journal         │   ──────────────────▶ │  Express API         │
│   - chat history    │   Bearer <JWT>        │  (Node, :5001)       │
│                     │                       │  /api/auth/*         │
│  Web Speech API:    │                       │  /api/chat (protect)  │
│   - STT (fr-FR)     │                       │  /api/health         │
│   - TTS (fr-FR)     │                       └──────────┬───────────┘
└─────────────────────┘                                  │ mongoose
                                                         ▼
                                              ┌──────────────────────┐
                                              │  MongoDB Atlas       │
                                              │  collection: users   │
                                              │  (name, email, pwd)  │
                                              └──────────────────────┘
```

Seuls les **users** sont persistés aujourd'hui. Les conversations, humeurs et journal sont éphémères côté client (persistance à venir).

---

## Modèle de données

### `User` (collection `users`)

```js
{
  _id: ObjectId,
  name: String,         // required, trim, ≤ 80 chars
  email: String,        // required, unique, lowercase, trim, format email
  password: String,     // bcrypt hash, cost 12, ≥ 6 chars en clair
  createdAt: Date,      // timestamps: true
  updatedAt: Date,
}
```

Hook `pre("save")` : si le champ `password` est modifié, il est hashé avec bcrypt cost 12 avant l'insertion/l'update.

Méthode d'instance `comparePassword(candidate)` : compare via `bcrypt.compare`.

### Modèles à ajouter (prévus, pas encore implémentés)

```js
// JournalEntry
{
  _id: ObjectId,
  userId: ObjectId,        // ref User, index
  mood: String,            // "good" | "neutral" | "sad" | "stressed" | "angry"
  content: String,         // ≤ 5000 chars, peut-être chiffré at-rest
  createdAt: Date,
}

// Mood (check-ins humeur rapide)
{
  _id: ObjectId,
  userId: ObjectId,        // ref User, index composite avec date
  value: String,           // même enum que JournalEntry.mood
  date: Date,              // index — un seul mood par (userId, jour calendaire)
}

// Conversation
{
  _id: ObjectId,
  userId: ObjectId,        // ref User, index
  messages: [{
    role: "user" | "assistant",
    content: String,
    createdAt: Date,
  }],
  startedAt: Date,
  lastActiveAt: Date,      // pour retrouver la dernière conversation
}
```

**Chiffrement at-rest** envisagé pour `JournalEntry.content` et `Conversation.messages[].content` — ces champs contiennent les données les plus sensibles. Clé de chiffrement dédiée (AES-256-GCM, rotation annuelle), stockée en dehors de la DB (AWS KMS ou HashiCorp Vault).

---

## API Backend

Base URL : `http://localhost:5001/api`

| Méthode | Path | Auth | Body | Response 2xx | Rate-limit | Validation |
|---------|------|------|------|--------------|------------|------------|
| POST | `/auth/register` | ❌ | `{ name, email, password }` | `201 { token, user }` | 10/15min | zod : name 1..80, email format, password 6..128 |
| POST | `/auth/login` | ❌ | `{ email, password }` | `200 { token, user }` | 10/15min | zod : email format, password ≥ 1 |
| GET | `/auth/me` | `Bearer <token>` | — | `200 { user }` | 10/15min | middleware `protect` |
| POST | `/chat` | `Bearer <token>` | `{ history: [{ role, parts: [{ text }] }] }` | `200 { text }` | 20/min | zod : history 1..50, text ≤ 2000 chars, role ∈ {user, model} |
| GET | `/health` | ❌ | — | `200 { status: "ok" }` | — | — |

**Erreurs standards** :
- `400 { message, errors: { fieldErrors } }` → validation zod échouée.
- `401 { message }` → token absent / invalide / credentials incorrects.
- `404 { message }` → ressource introuvable.
- `429 { message }` → rate-limit dépassé.
- `502 { message }` → service IA indisponible (erreur côté Gemini).
- `500 { message }` → erreur serveur interne.

**CORS** : liste d'origines via `CORS_ORIGIN` (séparée par virgules). Défaut local : `http://localhost:5173,http://localhost:8080`.

---

## Services & hooks frontend

### Services ([`src/services`](src/services))

- [`authService.ts`](src/services/authService.ts) — wrapper fetch autour de `/api/auth`. Expose :
  - `registerUser(name, email, password)` — POST register, stocke token + user en localStorage.
  - `loginUser(email, password)` — idem login.
  - `logoutUser()` — clear localStorage.
  - `getStoredUser()` / `getToken()` / `isAuthenticated()` — helpers de lecture.
  - URL de base via `VITE_API_URL` (configurable).

- [`chatService.ts`](src/services/chatService.ts) — wrapper fetch autour de `/api/chat`.
  - Maintient `conversationHistory` (variable module-level, format Gemini `[{ role, parts: [{ text }] }]`).
  - `sendMessageToAI(message)` — push user → POST → push model.
  - `startNewChat()` / `resetChat()` — vide l'historique.
  - Auth via `Authorization: Bearer <token>` lu depuis localStorage.
  - En cas d'erreur réseau ou serveur, le dernier message user est retiré du local pour permettre un retry propre.

### Hooks ([`src/hooks`](src/hooks))

- [`useChat.ts`](src/hooks/useChat.ts) — gère le state du chat (`messages[]`, `isTyping`, `error`). Message de bienvenue en dur au mount. `sendMessage(text)` délègue à `chatService`. Reset auto via `startNewChat` / `resetChat` sur mount/unmount.

- [`useVoice.ts`](src/hooks/useVoice.ts) — wrapper Web Speech API :
  - `startListening(onResult)` / `stopListening()` — STT fr-FR, non-continu.
  - `speak(text, onDone)` / `stopSpeaking()` — TTS fr-FR, cancel l'élocution en cours.
  - `isSupported` — feature detection.
  - `isListening`, `isSpeaking` — state exposé pour l'UI.

- [`use-mobile.tsx`](src/hooks/use-mobile.tsx) — matchMedia `< 768 px`.

- [`use-toast.ts`](src/hooks/use-toast.ts) — store de toasts (shadcn/ui pattern).

### Contexte ([`src/contexts`](src/contexts))

- [`AuthContext.tsx`](src/contexts/AuthContext.tsx) — provider React qui hydrate le user depuis localStorage au mount, expose `login`, `signup`, `logout`, `isLoggedIn`, `isLoading`. Consommé via `useAuth()`.

---

## Intégration IA

### Actuel : Google Gemini (côté serveur)

Fichier : [`server/routes/chat.js`](server/routes/chat.js).

- **Modèle** : configuré par `GEMINI_MODEL` (.env) — défaut `gemini-2.5-flash` (stable, rapide, pas cher).
- **Clé** : `GEMINI_API_KEY` côté serveur uniquement. Jamais dans le bundle client.
- **System instruction** (en dur dans la route) :

  > Tu es MindCare, un compagnon bienveillant de bien-être mental pour les jeunes.
  >
  > Règles importantes :
  > - Réponds toujours en français.
  > - Sois chaleureux, empathique et sans jugement.
  > - Utilise un ton amical et accessible (tutoiement).
  > - Tes réponses doivent être concises (2-4 phrases max) sauf si l'utilisateur demande plus de détails.
  > - Tu peux proposer des exercices simples (respiration, ancrage) quand c'est pertinent.
  > - Tu n'es PAS un professionnel de santé. Si quelqu'un exprime des pensées suicidaires ou une détresse grave, oriente-le vers le 3114 (numéro national de prévention du suicide) ou le 114 par SMS.
  > - Ne pose pas de diagnostic. Tu es un espace d'écoute et de soutien.
  > - Tu peux utiliser des emojis avec modération pour rendre la conversation plus chaleureuse.

- **Historique** : côté client, variable module-level. Le client envoie l'historique complet (≤ 50 messages, chaque message ≤ 2000 chars) à chaque tour. Rien n'est persisté côté serveur.
- **Pas de streaming** — appel `generateContent` one-shot. L'ajout du streaming (`generateContentStream`) améliorerait la perception de latence, à considérer en P2.
- **Pas de retry automatique** — une erreur Gemini → 502 remonté au client, qui affiche un message "Désolé, je rencontre un problème technique".

### Plan : Mistral AI

Voir section [Plan de migration Gemini → Mistral](#plan-de-migration-gemini--mistral-souveraineté--rgpd) ci-dessus. La route `/api/chat` est le seul endroit à modifier côté code — isolation propre.

### Voix : Web Speech API

Fichier : [`src/hooks/useVoice.ts`](src/hooks/useVoice.ts).

- **STT** : `webkitSpeechRecognition` (ou `SpeechRecognition` natif si dispo), `lang: "fr-FR"`, `interimResults: false`, `continuous: false`. Un énoncé = un résultat final → passé à `handleSend`.
- **TTS** : `SpeechSynthesisUtterance`, `lang: "fr-FR"`, rate/pitch 1. `speechSynthesis.cancel()` avant chaque nouvelle élocution pour éviter l'empilement.
- **Mode vocal (ChatPage)** : quand actif, à la fin de `speak` (callback `onDone`), on rebranche `startListening` → boucle mains libres tant que l'utilisateur ne désactive pas le mode.

---

## Variables d'environnement

### Backend (`server/.env`) — voir `server/.env.example`

```dotenv
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=<openssl rand -hex 64>
GEMINI_API_KEY=<clé Google AI Studio>
GEMINI_MODEL=gemini-2.5-flash
PORT=5001
CORS_ORIGIN=http://localhost:5173,http://localhost:8080
```

Le serveur **refuse de démarrer** si `MONGODB_URI` est absent ou si `JWT_SECRET` est absent / reste au défaut `mindcare_secret_key_change_me`.

### Frontend (`.env`) — voir `.env.example`

```dotenv
VITE_API_URL=http://localhost:5001/api
```

Les deux fichiers `.env` sont dans `.gitignore`. **Ne jamais les commiter.**

---

## Installation & démarrage

### Prérequis

- **Node.js ≥ 18**
- **npm**, **yarn** ou **bun** (un `bun.lockb` est fourni — `bun install` est le chemin rapide)
- **Cluster MongoDB** (Atlas free tier suffit, région EU recommandée)
- **Clé Google AI Studio** (Gemini) — https://aistudio.google.com/apikey

### 1. Cloner

```bash
git clone <repo>
cd MindCare-B3
```

### 2. Backend

```bash
cd server
cp .env.example .env
# éditer .env :
#   - MONGODB_URI (ton cluster Atlas)
#   - JWT_SECRET (openssl rand -hex 64)
#   - GEMINI_API_KEY (ta clé)
npm install            # ou bun install
npm run dev            # node --watch index.js, port 5001
```

Health check : `curl http://localhost:5001/api/health` → `{"status":"ok"}`

### 3. Frontend (autre terminal)

```bash
cd ..                  # racine du projet
cp .env.example .env   # facultatif si localhost:5001
bun install            # ou npm install
bun dev                # ou npm run dev, port 8080
```

Ouvre `http://localhost:8080`.

### Scripts

| Commande | Effet |
|----------|-------|
| `npm run dev` | Vite dev server (port 8080) |
| `npm run build` | Build prod dans `dist/` |
| `npm run build:dev` | Build en mode development |
| `npm run lint` | ESLint |
| `npm run preview` | Sert le build |
| `npm test` | `vitest run` |

---

## Considérations RGPD & données de santé

### Ce qui est considéré comme "donnée de santé"

Selon la CNIL, une donnée de santé au sens RGPD (art. 9) inclut toute information révélant l'état de santé physique ou **mental** d'une personne. **Les entrées de journal, les check-ins d'humeur, et surtout les conversations avec l'IA** tombent dans cette catégorie dès qu'elles révèlent un mal-être, un symptôme, un traitement.

### Obligations qui en découlent

1. **Consentement explicite** de l'utilisateur pour le traitement (case à cocher non pré-remplie à l'inscription).
2. **Registre de traitement** documenté (finalité, données, durée de conservation, hébergeur, sous-traitants).
3. **Hébergement** dans un pays adéquat (UE ou équivalent). MongoDB Atlas EU + Mistral API EU = OK. Gemini US = pas OK pour la prod de production.
4. **DPA signés** avec chaque sous-traitant (Atlas, LLM provider, hébergeur frontend).
5. **Droit d'accès (art. 15)** : endpoint ou interface pour que l'utilisateur télécharge ses données.
6. **Droit à l'effacement (art. 17)** : endpoint / bouton pour supprimer compte et données associées.
7. **Violation** : notification à la CNIL dans les 72h si fuite.
8. **Hébergeur de Données de Santé (HDS)** : pour une app manipulant des données de santé en France, l'hébergeur doit être certifié HDS (AWS, OVH Cloud, Scaleway sont certifiés). À vérifier avant mise en prod.

### Mineurs (public 15-18 ans)

- Consentement parental requis en dessous de **15 ans** en France (loi Informatique et Libertés art. 45).
- Au-dessus de 15 ans : consentement de l'ado suffit, mais l'info doit être adaptée (texte court, clair, pas de jargon).
- Envisager un parental gate à l'inscription (date de naissance) pour rediriger les < 15 ans vers un flow adapté.

### Ce qui est en place aujourd'hui

- **Rien de formel** — c'est un MVP. Les points ci-dessus sont à adresser avant toute ouverture publique.

---

## Sécurité

### ✅ Corrigé dans l'itération actuelle

- **Clé Gemini retirée du frontend** → route backend `/api/chat` protégée par JWT.
- **@google/genai retiré** des deps frontend, ajouté côté serveur.
- **Validation zod** sur tous les bodies (`/auth/register`, `/auth/login`, `/chat`).
- **Middleware `protect`** utilisé sur `/auth/me` et `/chat` (plus de vérif inline dupliquée).
- **Rate-limit** : `/auth/*` (10/15min) et `/chat` (20/min).
- **CORS configurable** via `CORS_ORIGIN`.
- **`.env` dans `.gitignore`** (root + server), `.env.example` fournis.
- **JWT_SECRET par défaut rejeté** au démarrage (crash explicite).
- **Credentials de test retirés** de `LoginPage.tsx`.
- **Body JSON limité** à 100 kb.

### ⚠ Actions manuelles requises (hors code)

Les credentials ci-dessous étaient **publics** (livrés dans le zip original). Ils doivent être rotés :

1. **MongoDB Atlas** — supprimer l'utilisateur `mindcare` (mdp `Mindcare321`) sur `cluster0.jivgdc3` ou régénérer son mot de passe. Mettre à jour `MONGODB_URI`.
2. **Clé Gemini** — révoquer l'ancienne clé sur https://aistudio.google.com/apikey, en générer une nouvelle, la poser dans `GEMINI_API_KEY`.
3. **JWT_SECRET** — une valeur forte a été générée. Rotation invalide tous les tokens existants (comportement voulu).

### P1 — à faire avant prod

- **JWT dans localStorage** → vulnérable à XSS. Migrer vers cookie `HttpOnly; Secure; SameSite=Strict`.
- **helmet** pour les headers de sécurité (CSP, X-Frame-Options, HSTS…).
- **Logging structuré** (pino/winston) + monitoring (Sentry, Datadog…).
- **Scanner de vulnérabilités** (`npm audit`, Snyk, Dependabot) en CI.

### P2

- CSRF (si passage aux cookies HttpOnly).
- Email verification + reset password.
- 2FA optionnel.
- Audit de sécurité externe avant ouverture publique.

---

## Roadmap / TODO

### Court terme (prochaine itération)

1. **Persistance journal** — modèle `JournalEntry` + routes CRUD `/api/journal` + `react-query` pour le cache.
2. **Persistance moods** — modèle `Mood` + `POST/GET /api/moods` + calcul réel des stats (streak, moyenne).
3. **Persistance chat** — modèle `Conversation` + historique retrouvable entre sessions.
4. **Onboarding flag** sur User (`onboardingCompleted: boolean`) + redirection au premier login.
5. **Stats profil** réelles (count réels, pas 24/5/12 en dur).

### Moyen terme

6. **Migration Gemini → Mistral** (voir section dédiée).
7. **Cookie HttpOnly** pour le JWT + CSRF.
8. **helmet** + CSP stricte.
9. **PWA** (service worker + manifest) — installation sur l'écran d'accueil mobile.
10. **Notifications push** quotidiennes (check-in humeur) — avec opt-in explicite.
11. **Export / suppression des données** (art. 15 & 17 RGPD).

### Long terme

12. **Chiffrement at-rest** du contenu journal + conversations (AES-GCM + KMS).
13. **Hébergeur HDS certifié** (Scaleway, OVH).
14. **2FA** (TOTP).
15. **Mode hors ligne** complet (IndexedDB + sync).
16. **Self-host Mistral** sur GPU dédié si volume justifie.
17. **App mobile native** (React Native) en parallèle de la web app.

---

## Structure du projet

```
MindCare-B3/
├── .env.example                # VITE_API_URL
├── .gitignore                  # .env, server/.env, node_modules, dist
├── CHANGELOG_SECURITY_FIX.md   # log des correctifs sécurité itération courante
├── README.md                   # ce fichier
├── index.html                  # shell Vite, meta OG, theme-color #8B8BDB
├── vite.config.ts              # port 8080, alias @ → src, HMR overlay off
├── tailwind.config.ts          # container 430px, palette sage/lavender/cream/peach
├── tsconfig.json               # strictNullChecks: false (MVP)
├── package.json                # React 18 + Vite + shadcn (Gemini retiré)
│
├── src/
│   ├── main.tsx                # bootstrap React
│   ├── App.tsx                 # Router + AuthProvider + ThemeProvider + PrivateRoute
│   ├── index.css               # tokens HSL light/dark, safe-area
│   │
│   ├── pages/
│   │   ├── OnboardingPage.tsx  # 3 slides d'intro
│   │   ├── HomePage.tsx        # mood + CTA chat + tip du jour
│   │   ├── ChatPage.tsx        # UI chat, useChat + useVoice
│   │   ├── SuiviPage.tsx       # bargraph hebdo (fake pour l'instant)
│   │   ├── JournalPage.tsx     # entries (fake pour l'instant) + ajout local
│   │   ├── BreathingPage.tsx   # 3 exos timer + anim cercle
│   │   ├── ProfilPage.tsx      # user + stats fake + menu + logout
│   │   ├── LoginPage.tsx       # form /api/auth/login
│   │   ├── SignupPage.tsx      # form /api/auth/register
│   │   ├── Index.tsx           # placeholder (non routé)
│   │   └── NotFound.tsx        # 404
│   │
│   ├── components/
│   │   ├── BottomNav.tsx       # 4 onglets fixes (Home/Chat/Suivi/Profil)
│   │   ├── MoodSelector.tsx    # 5 emojis d'humeur
│   │   ├── ThemeToggle.tsx     # dark/light via next-themes
│   │   ├── NavLink.tsx         # wrapper RR6
│   │   └── ui/                 # ~50 composants shadcn (Radix)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx     # useAuth + AuthProvider
│   │
│   ├── hooks/
│   │   ├── useChat.ts          # state messages + sendMessage
│   │   ├── useVoice.ts         # Web Speech API (STT + TTS)
│   │   ├── use-mobile.tsx      # breakpoint 768px
│   │   └── use-toast.ts        # toasts shadcn
│   │
│   ├── services/
│   │   ├── authService.ts      # fetch /api/auth/*, VITE_API_URL
│   │   └── chatService.ts      # fetch /api/chat (plus de clé côté client)
│   │
│   ├── lib/utils.ts            # cn() tailwind merge
│   └── test/                   # vitest setup + un test d'exemple
│
├── server/
│   ├── index.js                # Express, CORS env, rate-limit, guards startup
│   ├── .env                    # ⚠ gitignore, à remplir
│   ├── .env.example            # template
│   ├── package.json            # express, mongoose, zod, express-rate-limit, @google/genai
│   ├── routes/
│   │   ├── auth.js             # register / login / me (zod + protect)
│   │   └── chat.js             # POST /chat (protect + zod + Gemini)
│   ├── middleware/
│   │   └── auth.js             # protect() → vérif JWT, injecte req.user
│   └── models/
│       └── User.js             # schema User + bcrypt pre-save + comparePassword
│
└── public/
    ├── mindcare-logo.svg
    ├── favicon.ico
    ├── robots.txt
    └── placeholder.svg
```

---

## Licence & crédits

Projet étudiant (B3). Code propriétaire par défaut, à statuer avant open-source.

Logo et charte : voir `public/mindcare-logo.svg`. Police *Plus Jakarta Sans* (SIL Open Font License).

Modèles IA utilisés :
- **Google Gemini** (actuellement) — https://ai.google.dev
- **Mistral AI** (prévu) — https://mistral.ai

Ressources et numéros d'urgence :
- **3114** — Numéro national de prévention du suicide (France, 24/7, gratuit) — https://3114.fr
- **114** — Numéro d'urgence pour les personnes sourdes / malentendantes (par SMS)
- **Nightline** — Écoute étudiante par les pairs — https://www.nightline.fr

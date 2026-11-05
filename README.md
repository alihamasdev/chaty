<p align="center">
  <img src="./public/logo.png" alt="Chaty Logo" width="80" height="80" />
</p>

<h1 align="center">Chaty</h1>

<p align="center">
  A modern, real-time public room chat application built with React 19, Tailwind CSS v4, and Firebase Firestore.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-purple?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Firebase-v13-orange?logo=firebase&logoColor=white" alt="Firebase" />
  <img src="https://img.shields.io/badge/TypeScript-7-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## Overview

**Chaty** is a fast, responsive public chat room web application. Designed for real-time collaboration, it pairs an accessible dark-mode interface with a serverless backend powered by Google Firebase (Authentication & Cloud Firestore).

With persistent multi-tab local caching, cursor-based pagination, automatic URL linkification, and strict document-level security rules, Chaty provides a reliable and engaging chat experience.

## Features

- **Real-Time Messaging**: Instant bidirectional message synchronization powered by Cloud Firestore snapshot listeners.
- **Google Authentication**: Quick sign-in with Google, syncing public profile metadata to Firestore.
- **Message Management**: Full author control to send, edit, and delete messages, complete with edit indicators and formatted timestamps.
- **Cursor-Based Pagination**: Smoothly load earlier messages on demand with `startAfter` queries.
- **Smart Scroller & Day Dividers**: Auto-scroll with scroll-to-bottom controls, grouping messages under sticky date dividers (Today, Yesterday, weekday, or full date).
- **Link Detection**: Automatic link parsing and formatting for safe external navigation.
- **Offline & Multi-Tab Persistence**: Firestore multi-tab manager and persistent local cache enabled out of the box.
- **Hardened Security Rules**: Comprehensive Firestore security rules enforcing document schema validation, length bounds, and author ownership.
- **Type-Safe Environment**: Environment variable schema validation and TypeScript type generation via Varlock.

## Tech Stack

| Layer                       | Technologies                                                       |
| :-------------------------- | :----------------------------------------------------------------- |
| **Framework & Runtime**     | React 19, TypeScript, Vite 8                                       |
| **Styling & UI Components** | Tailwind CSS v4, Base UI, Shadcn UI patterns, Lucide Icons, Motion |
| **Backend & Services**      | Firebase Authentication (Google Auth), Cloud Firestore             |
| **Environment Management**  | Varlock (`@env-spec`), `@varlock/vite-integration`                 |
| **Code Quality & Tooling**  | Oxlint, Oxfmt                                                      |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or newer) or [Bun](https://bun.sh/) (v1.2 or newer)
- A [Firebase Project](https://console.firebase.google.com/) with:
  - **Authentication** enabled with the Google sign-in provider
  - **Cloud Firestore** database created

### 1. Clone the Repository

```bash
git clone https://github.com/alihamasdev/chaty.git
cd chaty
```

### 2. Install Dependencies

Using Bun (recommended):

```bash
bun install
```

Or using npm:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Fill in your Firebase web app credentials:

```env
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_APP_ID="your-app-id"
```

> [!NOTE]
> Chaty uses [Varlock](https://varlock.dev) with `.env.schema` for build-time and runtime validation. If any required environment variable is missing, the application will provide a descriptive error during initialization.

Verify your environment configuration at any time:

```bash
bun run env:check
```

### 4. Deploy Firestore Security Rules

Deploy the included security rules to protect database operations:

```bash
firebase deploy --only firestore:rules
```

> [!IMPORTANT]
> The security rules in `firestore.rules` enforce message length boundaries (1–1000 characters), profile shape constraints, and strict ownership checks so users can only modify or delete their own messages.

### 5. Start the Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command               | Description                                             |
| :-------------------- | :------------------------------------------------------ |
| `bun run dev`         | Runs the development server on `http://localhost:3000`  |
| `bun run build`       | Compiles the production build into the `dist/` folder   |
| `bun run preview`     | Previews the production build locally                   |
| `bun run check`       | Lints and formats the codebase with Oxlint and Oxfmt    |
| `bun run check-types` | Type-checks the project using the TypeScript compiler   |
| `bun run check-env`   | Validates environment variables against `.env.schema`   |
| `bun run env:prod`    | Syncs `.env` variables to Vercel production environment |
| `bun run env:prev`    | Syncs `.env` variables to Vercel preview environment    |
| `bun run deploy:prev` | Deploys a preview deployment to Vercel                  |
| `bun run deploy:prod` | Deploys directly to production on Vercel                |

## Architecture

```
+-------------------------------------------------------------+
|                         Chaty Client                        |
|   +-------------------+  +-------------------------------+  |
|   |    AuthContext    |  |          ChatContext          |  |
|   |  (Google Sign-In) |  | (Realtime & Paginated States) |  |
|   +---------+---------+  +---------------+---------------+  |
+-------------|----------------------------|------------------+
              |                            |
              v                            v
      +---------------+           +-----------------+
      | Firebase Auth |           | Cloud Firestore |
      +---------------+           +--------+--------+
                                           |
                         +-----------------+-----------------+
                         |                                   |
                         v                                   v
                 /users/{uid}                       /messages/{messageId}
            (User Profile Cache)               (Normalized Chat Messages)
```

- **Authentication**: Users authenticate via Google popup. The user's public profile (`uid`, `displayName`, `photoURL`) is synchronized to the `/users` collection.
- **Message Feed**: Messages are queried from `/messages` ordered chronologically, using snapshot listeners for real-time updates and cursor pagination for older history.
- **Profile Resolution**: Chat messages store normalized identifiers; author profiles are fetched in chunks and cached locally.
- **Optimistic State**: Message edits and deletions update immediately in memory while syncing with Firestore in the background.

## Deployment

### Vercel Deployment

1. **Link the Project** (first-time only):

   ```bash
   bun x vercel link
   ```

2. **Sync Environment Variables to Vercel**:

   ```bash
   # Sync .env to Vercel production
   bun run env:prod

   # Or sync to preview
   bun run env:prev
   ```

3. **Deploy**:
   ```bash
   # Production deployment
   bun run deploy:prod

   # Preview deployment
   bun run deploy:prev
   ```

The project includes `vercel.json` configured for the **Bombay / Mumbai (`bom1`)** region and `.vercelignore` to optimize deployment uploads.

### Static Build

To compile static assets manually:

```bash
bun run build
```

The resulting `dist/` directory can also be deployed to any static hosting provider such as Firebase Hosting, Netlify, or Cloudflare Pages.

Below is a **combined set of instructions**. The **first section** outlines some **conventions** you’d like Cursor (or any AI IDE) to follow, **including listing file paths or locations before any code blocks or commands**. The **second section** is the **step-by-step** guide for setting up a monorepo with a **client** (Vite + React + TypeScript + Tailwind) and a **server** (Express + Prisma + PostgreSQL). We’ll also cover how to integrate shadcn components from a Next.js (v0) project.

---

In this context, **“monorepo”** means that you keep both the **front-end** (client) and **back-end** (server) code in a **single repository** (a single root folder). Instead of having one repo dedicated to your React client and a separate repo for your Express/Prisma server, you house them together under a shared parent directory. This parent directory (the “root” of the monorepo) typically contains:

1. A **root-level package.json** (where you can define scripts to run both the client and server in one go).  
2. Two main subfolders:
   - **client/** (Vite + React + TypeScript + Tailwind)
   - **server/** (Express + Prisma + PostgreSQL + TypeScript)

By storing them side by side in one repository, you can:
- Share certain configuration or utility files if needed.
- Keep versions of your front end and back end in sync (since they evolve together).
- Use a single set of commands (via tools like [concurrently](https://www.npmjs.com/package/concurrently)) to **run both** the client and the server **at the same time** from the monorepo’s root directory.

Hence, when we say “running concurrently,” we’re referring to using a single command (e.g., `npm run dev` in the root) that spins up:
- The React dev server (on, say, port 5173).
- The Express/Prisma server (on, say, port 4000).

…all while they both reside in the same Git repository (the monorepo).

---

Below is an example of a directory tree that follows the project requirements for a Vite + React (client) and Express + Prisma + PostgreSQL (server) setup, each in its own folder, with a root package.json for concurrent scripts:

```
my-monorepo/
├── package.json
├── client/
│   ├── package.json
│   ├── index.html
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── assets/
│       │   ├── images/
│       │   │   └── logo.png
│       │   └── ...
│       ├── components/
│       │   ├── ui/
│       │   │   └── ...
│       │   └── ...
│       ├── contexts/
│       │   └── AuthContext.tsx
│       ├── hooks/
│       │   └── useAuth.ts
│       ├── pages/
│       │   ├── Home.tsx
│       │   └── Login.tsx
│       ├── router/
│       │   └── index.tsx
│       ├── styles/
│       │   └── globals.css
│       ├── utils/
│       │   └── formatDate.ts
│       ├── App.tsx
│       ├── index.css
│       └── main.tsx
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.ts                // Main entry point for Express server
│       ├── controllers/
│       │   ├── authController.ts   // Example controller for auth operations
│       │   ├── postController.ts   // Example controller for post operations
│       │   ├── projectController.ts// Example controller for project operations
│       │   └── articleController.ts// Example controller for article operations
│       ├── middlewares/
│       │   └── ensureAuth.ts       // Example middleware for auth checks
│       ├── routes/
│       │   ├── auth.ts             // Auth routes
│       │   ├── post.ts             // Post routes
│       │   ├── project.ts          // Project routes
│       │   └── article.ts          // Article routes
│       └── utils/
│           ├── logger.ts           // Example logging utility
│           └── formatData.ts       // Example data formatting utility
└── .gitignore                      // (Optional) Git ignore file
```

### Folder/File Descriptions (Server-Specific)

- **controllers/**: Houses logic for handling specific requests (e.g., `authController.ts` has `login`, `register`, etc.).
- **middlewares/**: Contains middleware functions, such as `ensureAuth.ts` for checking JWT tokens or user sessions.
- **routes/**: Defines Express route handlers (e.g., `auth.ts` for authentication endpoints). Each route typically calls the relevant controller functions.
- **utils/**: Utility or helper functions that don’t fit neatly into routes, controllers, or middleware (e.g., logging, data transformations).
- **index.ts**: Main Express app initialization, sets up middleware, route mounts, and starts the server.

This layout provides a clear separation of concerns, making it easier to maintain and scale your application. Feel free to add, remove, or rename folders and files as your requirements evolve.

---

## 1. Conventions for Cursor.ai in the Composer

1. **Preserve the Folder Structure**  
   - We have (or will have) a **top-level root** directory containing two main subfolders:  
     - **`client/`** (for the Vite React front end)  
     - **`server/`** (for the Express + Prisma back end)  
   - Do **not** rename these folders or rearrange them into different hierarchies unless I explicitly instruct you.

2. **Do Not Change File Names or Contents Arbitrarily**  
   - If I provide code for files like `postRoutes.ts` or `tailwind.config.cjs`, keep those file names exactly as given.  
   - **Only** alter code snippets if I explicitly ask for modifications. Refrain from auto-suggesting different variable names, file names, or rearranging the order of functions.

3. **List File Paths or Locations Before Code Blocks or Commands**  
   - For every code snippet or command you provide, **state the file path or the shell location** first. For example:
     ```
     // client/src/App.tsx
     (code block here)
     ```
     or:
     ```
     // PowerShell at root folder:
     npm install -D concurrently
     ```

4. **Environment Variables**  
   - Keep environment variables as I specify them (e.g., `DATABASE_URL` in the `.env` file, etc.).  
   - If references to `JWT_SECRET` or other environment variables appear, preserve their names exactly.  
   - Do not rename or remove these variables unless I request it.

5. **Mounting Routes**  
   - If the documentation shows me how to attach routes (like `/api/posts`, `/api/auth`, etc.) in `index.ts`, preserve those exact routes.  
   - For instance, if I say `app.use("/api/auth", authRouter)`, do not rename it to `/auth`.

6. **Testing and Debugging**  
   - When I integrate new code or run `npm run dev` (or similar) to test the client and server, help me troubleshoot **without** rewriting large sections of the app. Suggest focused, minimal edits to fix any errors we encounter, while preserving the doc’s structure.

7. **Ask Before Changing**  
   - If you see an inconsistency, mismatch, or a potential improvement (like a minor version bump for a dependency), please **ask first** rather than changing the doc’s instructions. The doc is our source of truth.

---

## 2. Step-by-Step Monorepo Guide (Client + Server) with shadcn Integration

Below is a guide for creating a **client** (Vite + React + TS + Tailwind) and a **server** (Express + Prisma + PostgreSQL + TS) within an **empty root directory**, then running both concurrently. Finally, we’ll cover integrating **shadcn** components from a Next.js (v0) project.

---

### 2.1. Initialize the Root Directory

> **PowerShell at the empty root folder:**
```
npm init -y
```
This creates a `package.json` at your root. We’ll add scripts here later to run the client and server concurrently.

---

### 2.2. Create and Configure the Client

#### 2.2.1 Scaffold Vite React + TypeScript App

> **PowerShell at the same root folder:**
```
npm create vite@latest client -- --template react-ts
```
- This creates a `client` folder with a React + TypeScript project inside it.

#### 2.2.2 Navigate to the Client Folder

> **PowerShell (root → `client`):**
```
cd client
```

#### 2.2.3 Install Tailwind + PostCSS + Autoprefixer

> **PowerShell in `client`:**
```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
- This generates `tailwind.config.cjs` and `postcss.config.cjs`.

#### 2.2.4 Configure Tailwind

```
// client/tailwind.config.cjs

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

#### 2.2.5 Import Tailwind in Your Main CSS

```
// client/src/index.css

@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 2.2.6 Test the Client

> **PowerShell in `client`:**
```
npm run dev
```
- By default, Vite should start at http://127.0.0.1:5173.
- Press Ctrl + C to stop. Then go back to the root folder:
```
cd ..
```

---

### 2.3. Create and Configure the Server

#### 2.3.1 Initialize the Server Folder

> **PowerShell at root:**
```
mkdir server
cd server
npm init -y
```

#### 2.3.2 Install Dependencies

> **PowerShell in `server`:**
```
npm install express cors dotenv
npm install -D typescript ts-node-dev @types/express @types/cors
```

#### 2.3.3 Initialize TypeScript

> **PowerShell in `server`:**
```
npx tsc --init
```
- This creates `tsconfig.json`. Update it to suit your preferences (e.g., `"rootDir": "./src", "outDir": "./dist"`).

#### 2.3.4 Install and Set Up Prisma + PostgreSQL

> **PowerShell in `server`:**
```
npm install prisma @prisma/client
npx prisma init
```
- This creates a `prisma` folder and `.env` file in `server`.
- Update `.env` with your database connection string, for example:
  ```
  DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase"
  ```

#### 2.3.5 Define Your Prisma Schema

```
// server/prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  username  String
  posts     Post[]
  projects  Project[]
  articles  Article[]
}

model Post {
  id       String   @id @default(uuid())
  title    String
  content  String
  authorId String
  author   User     @relation(fields: [authorId], references: [id])
}

model Project {
  id       String   @id @default(uuid())
  name     String
  desc     String
  authorId String
  author   User     @relation(fields: [authorId], references: [id])
}

model Article {
  id       String   @id @default(uuid())
  title    String
  content  String
  authorId String
  author   User     @relation(fields: [authorId], references: [id])
}
```

#### 2.3.6 Run Prisma Migrations

> **PowerShell in `server`:**
```
npx prisma migrate dev --name init
```
This creates tables in your database based on `schema.prisma`.

#### 2.3.7 Basic Express App Setup

```
// server/src/index.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

#### 2.3.8 Add Scripts to `server/package.json`

```json
// server/package.json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpileOnly src/index.ts",
    "build": "tsc"
  }
}
```

#### 2.3.9 Return to the Root

```
cd ..
```

---

### 2.4. Concurrently Run Client & Server from the Root

#### 2.4.1 Install `concurrently` at the Root

> **PowerShell at root:**
```
npm install -D concurrently
```

#### 2.4.2 Update Root `package.json` to Run Both

```json
// (root)/package.json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix client\" \"npm run dev --prefix server\""
  }
}
```

#### 2.4.3 Start Them Up

> **PowerShell at root:**
```
npm run dev
```
- Client runs on `localhost:5173`.
- Server runs on `localhost:4000`.

---

### 2.5. Adapting shadcn Components from a Next.js (v0) Project

If you have a Next.js-based project (v0) that uses **shadcn** components:

1. **Copy** the needed components (e.g. `Button`, `Dropdown`, etc.) into `client/src/components/ui/` (or wherever you store your UI code).
2. **Remove or replace** Next.js-specific imports:
   - `import Link from "next/link"` → `import { Link } from "react-router-dom";`
   - `import Image from "next/image"` → Use a plain `<img>` tag or another image library.
3. **Check** for environment variables referencing `NEXT_PUBLIC_...`. In Vite, they should be `VITE_...` and accessed via `import.meta.env`.
4. **Test**: Confirm that the components work without references to Next.js server actions or file-based routing.

---

### 2.6. Adding Simple CRUD, Auth, Like/Follow, and Search

1. **Auth**  
   - Create `server/src/routes/auth.ts` with a `register` and `login` route, using bcrypt for password hashing. Example:

     ```
// server/src/routes/auth.ts

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const router = Router();
const prisma = new PrismaClient();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, username },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

export default router;
     ```
   - In `server/src/index.ts`, mount the auth routes:
     ```
     // server/src/index.ts
     import authRoutes from "./routes/auth";
     app.use("/auth", authRoutes);
     ```

2. **CRUD**  
   - For posts, articles, and projects, create separate routes in `server/src/routes/post.ts`, `server/src/routes/article.ts`, etc. Implement `POST`, `GET`, `PUT`, and `DELETE` with the appropriate Prisma queries.

3. **Likes / Follows**  
   - Add a `Follow` model or a `Like` model to your `schema.prisma` if you want users to follow each other or like content.
   - Expose endpoints like `POST /follow` or `POST /like` to handle these actions.

4. **Search / Explore**  
   - A route (e.g., `server/src/routes/explore.ts`) that queries multiple models by a search term in `req.query.q`. Return combined results to the client.

---

### 2.7. Final Tips

- **Migrations**: Each time you modify `schema.prisma`, run:
  ```
  npx prisma migrate dev
  ```
- **Env Variables**:  
  - For the server, store them in `server/.env`.  
  - For the client, use `VITE_...` in `client/.env` and access them via `import.meta.env.VITE_...`.
- **Testing**:  
  - Use Postman or Insomnia to verify server endpoints.  
  - Confirm your client can fetch from your server’s `http://localhost:4000` endpoints.

That’s all! Following these steps, you’ll have a **monorepo** with a Vite-powered React frontend and an Express + Prisma + PostgreSQL backend, plus a plan for integrating **shadcn** components from a Next.js (v0) project.
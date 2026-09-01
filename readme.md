# Prisma Database Setup & Workflow

This guide covers the database configuration and development workflow for **Prisma**, supporting both:

* 🐬 **MySQL** — Relational database
* 🍃 **MongoDB** — Document-based NoSQL database

The Prisma schema and configuration files are kept inside the `src/` directory, while the project maintains a **single `.env` file at the project root**.

---

## 📁 Project Structure

```text
root/
├── src/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   └── prisma.config.ts
│
├── .env
├── package.json
├── tsconfig.json
└── ...
```

### File Responsibilities

| File                       | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `src/prisma/schema.prisma` | Prisma schema and model definitions                  |
| `src/prisma.config.ts`     | Custom Prisma configuration                          |
| `.env`                     | Database connection string and environment variables |
| `package.json`             | Prisma/NPM scripts                                   |

> **Important:** Keep only **one `.env` file**, located at the project root.

---

# ⚙️ Initial Setup

All commands in this guide should be executed from the **project root**.

## 1. Install Prisma & Prisma Client

To ensure MongoDB compatibility and stability, this setup uses **Prisma 6.19.0**.

```bash
npm install @prisma/client@6.19.0
npm install -D prisma@6.19.0
```

---

## 2. Initialize Prisma

Initialize Prisma with the schema located inside `src/prisma/`:

```bash
npx prisma init --schema=src/prisma/schema.prisma
```

If Prisma creates an additional `.env` or `.gitignore` inside the Prisma directory:

1. Move the `.env` file to the project root.
2. Delete the duplicate `.gitignore` if it is not needed.

Your final structure should look like:

```text
root/
├── src/
│   ├── prisma/
│   │   └── schema.prisma
│   └── prisma.config.ts
│
├── .env
├── package.json
└── tsconfig.json
```

---

# 🔐 Environment Configuration

Create a single `.env` file at the **project root**.

## MySQL

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/db_name"
```

Example:

```env
DATABASE_URL="mysql://root:password@localhost:3306/slack_db"
```

## MongoDB

For MongoDB, use a replica-set-enabled MongoDB deployment such as **MongoDB Atlas** or a properly configured local replica set.

```env
DATABASE_URL="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/db_name?retryWrites=true&w=majority"
```

> **Note:** Prisma's MongoDB connector requires transactions, so MongoDB must be configured with a replica set.

---

# 🐬 MySQL Workflow

MySQL is a **relational database**, and Prisma supports traditional migration workflows for it.

When you modify `schema.prisma`, Prisma can generate migration files containing the SQL required to update your database.

## Schema Example

`src/prisma/schema.prisma`

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  createdAt DateTime @default(now())
}
```

---

## MySQL Commands

### Create & Apply a Migration

Use this during development:

```bash
npx prisma migrate dev \
  --schema=src/prisma/schema.prisma \
  --name <migration_name>
```

For example:

```bash
npx prisma migrate dev \
  --schema=src/prisma/schema.prisma \
  --name create_user
```

This will:

1. Compare the Prisma schema with the current database.
2. Generate a migration.
3. Create SQL migration files.
4. Apply the migration to the database.
5. Generate the Prisma Client.

---

### Apply Pending Migrations

For staging or production environments:

```bash
npx prisma migrate deploy \
  --schema=src/prisma/schema.prisma
```

This applies existing migration files without creating new migrations.

---

# 🍃 MongoDB Workflow

MongoDB is a **document-based NoSQL database**.

Unlike MySQL, Prisma does **not** support `prisma migrate dev` for MongoDB.

Instead, Prisma uses:

```bash
prisma db push
```

This synchronizes the Prisma schema directly with the MongoDB database.

---

## MongoDB Schema Example

`src/prisma/schema.prisma`

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    String  @id @default(auto()) @map("_id") @db.ObjectId
  email String  @unique
  name  String?
}
```

### MongoDB Primary Key Rules

When using MongoDB with Prisma:

* The primary key should map to MongoDB's `_id`.
* The ID should use the `ObjectId` type.
* Automatically generated IDs should use `@default(auto())`.

The typical MongoDB ID definition is:

```prisma
id String @id @default(auto()) @map("_id") @db.ObjectId
```

---

## MongoDB Configuration

If using a custom Prisma configuration file:

```text
src/
├── prisma/
│   └── schema.prisma
│
└── prisma.config.ts
```

Run:

```bash
npx prisma db push --config=src/prisma.config.ts
```

This synchronizes:

* Prisma models
* Database structure
* Unique indexes

with MongoDB.

> MongoDB does **not** generate Prisma migration files using `db push`.

---

# 📊 MySQL vs MongoDB

| Feature                  | 🐬 MySQL                            | 🍃 MongoDB                                             |
| ------------------------ | ----------------------------------- | ------------------------------------------------------ |
| Database Type            | Relational                          | Document / NoSQL                                       |
| Prisma Workflow          | `migrate dev`                       | `db push`                                              |
| Migration Files          | ✅ Yes                               | ❌ No                                                   |
| Migration History        | `_prisma_migrations`                | None                                                   |
| Schema Changes           | Generated SQL migrations            | Direct schema synchronization                          |
| Primary Key              | `Int @id @default(autoincrement())` | `String @id @default(auto()) @map("_id") @db.ObjectId` |
| Main Development Command | `prisma migrate dev`                | `prisma db push`                                       |
| Production Workflow      | `prisma migrate deploy`             | `prisma db push`                                       |

---

# 📜 Prisma Commands Cheat Sheet

## MySQL

### Generate Prisma Client

```bash
npx prisma generate \
  --schema=src/prisma/schema.prisma
```

### Create Migration

```bash
npx prisma migrate dev \
  --schema=src/prisma/schema.prisma \
  --name <migration_name>
```

### Deploy Migrations

```bash
npx prisma migrate deploy \
  --schema=src/prisma/schema.prisma
```

### Open Prisma Studio

```bash
npx prisma studio \
  --schema=src/prisma/schema.prisma
```

---

## MongoDB

### Push Schema

```bash
npx prisma db push \
  --config=src/prisma.config.ts
```

### Generate Prisma Client

```bash
npx prisma generate \
  --schema=src/prisma/schema.prisma
```

### Open Prisma Studio

```bash
npx prisma studio \
  --schema=src/prisma/schema.prisma
```

---

# 🚀 Recommended NPM Scripts

To avoid repeatedly typing long Prisma commands, add the following scripts to your root `package.json`:

```json
{
  "scripts": {
    "prisma:generate": "prisma generate --schema=src/prisma/schema.prisma",
    "db:mysql:migrate": "prisma migrate dev --schema=src/prisma/schema.prisma",
    "db:mysql:deploy": "prisma migrate deploy --schema=src/prisma/schema.prisma",
    "db:mongo:push": "prisma db push --config=src/prisma.config.ts",
    "prisma:studio": "prisma studio --schema=src/prisma/schema.prisma"
  }
}
```

---

# 💻 Using the NPM Scripts

## MySQL

Create a migration:

```bash
npm run db:mysql:migrate -- --name init
```

For example:

```bash
npm run db:mysql:migrate -- --name create_user
```

Deploy migrations:

```bash
npm run db:mysql:deploy
```

---

## MongoDB

Push the Prisma schema:

```bash
npm run db:mongo:push
```

---

## Prisma Studio

Open Prisma Studio:

```bash
npm run prisma:studio
```

---

# ⚠️ Important Notes

### 1. Keep `.env` at the Project Root

Use a single `.env` file:

```text
root/
└── .env
```

Avoid having multiple `.env` files inside `src/` or `src/prisma/`.

---

### 2. MySQL Uses Migrations

For MySQL, schema changes should normally go through:

```bash
prisma migrate dev
```

Do not manually edit generated migration SQL unless you understand the consequences.

---

### 3. MongoDB Does Not Use Prisma Migrations

Do **not** run:

```bash
prisma migrate dev
```

for MongoDB.

Instead use:

```bash
prisma db push
```

---

### 4. Always Specify the Schema/Config Location

Because the Prisma files are not located in the default project location, commands should explicitly specify their location:

```bash
--schema=src/prisma/schema.prisma
```

or:

```bash
--config=src/prisma.config.ts
```

---

# 🧭 Quick Decision Guide

Use **MySQL** when you need:

* Strong relational structure
* Foreign-key relationships
* Transactions
* Structured/tabular data
* Prisma migration history

Use **MongoDB** when you need:

* Document-oriented data
* Flexible document structures
* MongoDB-specific features
* A NoSQL data model

### MySQL

```text
schema.prisma
      │
      ▼
prisma migrate dev
      │
      ▼
Migration files
      │
      ▼
MySQL Database
```

### MongoDB

```text
schema.prisma
      │
      ▼
prisma db push
      │
      ▼
MongoDB Database
```

---

## ✅ Final Checklist

Before running Prisma commands, verify:

* [ ] `.env` exists at the project root.
* [ ] `DATABASE_URL` is correctly configured.
* [ ] Prisma schema is located at `src/prisma/schema.prisma`.
* [ ] Prisma configuration is located at `src/prisma.config.ts` when required.
* [ ] Prisma and `@prisma/client` versions match.
* [ ] MySQL uses `prisma migrate dev`.
* [ ] MongoDB uses `prisma db push`.
* [ ] MongoDB is configured with a replica set.
* [ ] Prisma Client is generated after schema changes.

---

## 📚 Summary

| Database   | Development          | Production / Deployment |
| ---------- | -------------------- | ----------------------- |
| 🐬 MySQL   | `prisma migrate dev` | `prisma migrate deploy` |
| 🍃 MongoDB | `prisma db push`     | `prisma db push`        |

The key distinction is:

> **MySQL → Migration-based workflow**
> **MongoDB → Schema synchronization with `db push`**

Keep the Prisma schema inside `src/`, keep `.env` at the project root, and explicitly provide the schema/config path when running Prisma CLI commands.

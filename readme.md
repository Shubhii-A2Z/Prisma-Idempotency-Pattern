# Idempotent Booking API with Distributed Locking (Prisma + Redlock)

## 🛠 Prisma Setup (inside `src/`)

Follow these steps to set up Prisma with the schema inside the `src/` folder.

---

### 1️⃣ Initialize Prisma inside `src/`

```bash
cd src
npx prisma init
```

* Creates:

  * `src/prisma/schema.prisma`
  * `src/.env`
  * `src/.gitignore`

---

### 2️⃣ Remove unwanted files from `src/`

```bash
rm .env .gitignore
```

* We keep a **single `.env` in project root** (recommended)
* Avoids confusion with multiple env files

---

### 3️⃣ Go back to root

```bash
cd ..
```

---

### 4️⃣ Install Prisma Client

```bash
npm install @prisma/client
```

* Required to use Prisma in your application code

---

### 6️⃣ Set your database URL (in root `.env`)

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/db_name"
```

---

### 7️⃣ Run migration (after writing schema)

```bash
cd src
npx prisma migrate dev --name init
```

* Creates database tables
* Generates Prisma Client
* Tracks schema changes via migrations

---

### 8️⃣ Generate Prisma Client (when schema changes)

```bash
npx prisma generate
```

* Run this **every time you update your schema**
* Not needed if you already used `migrate dev` (it auto-generates)

---

## 🔁 Common Workflow

1. Update `schema.prisma`
2. Run:

   ```bash
   npx prisma migrate dev --name <change_name>
   ```
3. Start using updated Prisma Client

---

## ⚠️ Important Notes

* Always keep `.env` in **root**, not inside `src/`
* `migrate dev` already runs `generate` internally
* Use meaningful migration names (e.g., `add_user_table`, `add_booking_status`)
* Never manually edit migration files unless you know what you're doing

---

## 📁 Final Structure

```
root/
  src/
    prisma/
      schema.prisma
  .env
  package.json
```

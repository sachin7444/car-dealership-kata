<img width="1815" height="1060" alt="image" src="https://github.com/user-attachments/assets/69adbf9c-1bbf-4c39-a678-6f2b3ea3a92b" />
# Car Dealership Inventory System (TDD Kata)

A professional, enterprise-grade full-stack Car Dealership Inventory Management System built with a Test-Driven Development (TDD) approach. The application features robust role-based authentication, complete vehicle CRUD operations, real-time stock tracking, inventory restocking, and localized Indian Rupee (₹) currency formatting.

---

## 🛠️ Tech Stack

- **Backend:** Node.js (v22), Express, TypeScript, Prisma ORM, SQLite (`dev.db`)
- **Security:** `bcryptjs` for password hashing, JSON Web Tokens (JWT) for session management, and custom RBAC middleware
- **Frontend:** React (Vite), TypeScript, HTML5, CSS3, Tailwind-inspired styling
- **Version Control:** Git with structured conventional commits and AI co-authoring trailers

---

## 🚀 Features & Capabilities

1. **Authentication & Authorization (`/api/auth`)**:
   - Secure user registration and login with encrypted passwords.
   - Token-based session authentication using JWT.
   - Role-Based Access Control (RBAC) distinguishing between standard `USER` and privileged `ADMIN` roles.

2. **Vehicle & Inventory Management (`/api/vehicles`)**:
   - **Create & Update:** Admins can add and edit vehicle specifications (Make, Model, Category, Price, Quantity).
   - **Search & Filter:** Advanced query endpoints to look up vehicles by make, model, category, or price range.
   - **Purchase Workflow:** Authenticated users can purchase vehicles, which automatically decrements stock count (disabled when out of stock).
   - **Restock Workflow:** Admin-only restock endpoints to replenish inventory stock.
   - **INR Localization:** Currency formatting explicitly rendered in Indian Rupees (`₹`).

---

## 📂 Project Structure

```text
car-dealership-kata/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (User & Vehicle models)
│   │   └── dev.db              # Local SQLite persistent database
│   ├── src/
│   │   └── app.ts              # Express server, routes, auth middleware
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main React SPA component (Auth & Dashboard UI)
│   │   └── App.css             # Stylesheet
│   ├── package.json
│   └── vite.config.ts
├── PROMPTS.md                  # Raw unedited AI interaction logs
└── README.md                   # Project documentation

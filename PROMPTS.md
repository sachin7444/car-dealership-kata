# AI Interaction Log (`PROMPTS.md`)

This document records the key prompts and collaborative problem-solving steps used alongside AI tools during the development of the Car Dealership Inventory System TDD Kata.

---

## Phase 1: Backend Architecture & Scaffolding
- **Prompt Theme:** Designing the Express & Prisma backend structure.
- **Key Prompt:** 
  > *"Help me set up an Express TypeScript backend with Prisma, SQLite, JWT authentication, and Role-Based Access Control (RBAC) for standard users and admins."*
- **Outcome:** Established the core database schema (`User` and `Vehicle` models), authentication middleware, and secure routing for inventory management and purchasing workflows.

---

## Phase 2: Frontend Dashboard & UI
- **Prompt Theme:** Creating a responsive React and Vite dashboard.
- **Key Prompt:** 
  > *"Build a clean React SPA component that handles user login/registration, displays dynamic inventory tables with stock counts, restricts actions based on user roles, and formats currency in Indian Rupees (₹)."*
- **Outcome:** Implemented a unified frontend dashboard providing real-time inventory tracking, purchase handling, and admin controls.

---

## Phase 3: TDD Integration Testing (`Jest` & `Supertest`)
- **Prompt Theme:** Writing and configuring integration tests for backend API endpoints.
- **Key Prompt:** 
  > *"Write an integration test suite using Jest and Supertest to verify user registration, admin vehicle creation, user vehicle fetching, inventory purchase decrement logic, and RBAC deletion rules."*
- **Outcome:** Generated robust test coverage verifying all mandatory business logic and CRUD operations.

---

## Phase 4: Debugging & Test Configuration
- **Prompt Theme:** Resolving Jest TypeScript transformation errors and open handles.
- **Key Prompt:** 
  > *"I am getting a Jest syntax error trying to run TypeScript test files, and an open handle warning from `app.listen`. How do I configure `ts-jest` and clean up the server shutdown?"*
- **Outcome:** 
  - Configured `ts-jest` via `jest.config.js`.
  - Resolved TypeScript import casing and strict compiler checks.
  - Wrapped `app.listen` with a `NODE_ENV !== 'test'` condition to ensure clean test exits with 0 open handles and all test cases passing successfully.
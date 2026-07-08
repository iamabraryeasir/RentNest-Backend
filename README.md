# RentNest Backend API 🏠💼

[![Live Link](https://img.shields.io/badge/Live%20Link-Vercel-blue?style=for-the-badge&logo=vercel)](https://rent-nest-backend-mu.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub%20Repo-RentNest--Backend-orange?style=for-the-badge&logo=github)](https://github.com/iamabraryeasir/RentNest-Backend)

RentNest Backend is a secure, high-performance, modular RESTful API designed to power modern real estate and property rental platforms. Built with **Node.js, Express, TypeScript, Prisma ORM, and Stripe**, it manages authentication, properties, rental requests, payment processing, webhooks, and landlord-tenant review workflows.

---

## 🚀 Key Features

- 🔐 **Secure Authentication**: JWT-based stateless authentication (Access Token via body/headers + Refresh Token in secure HttpOnly cookies).
- 👥 **Role-Based Access Control (RBAC)**: Custom middlewares enforce access limits for `TENANT`, `LANDLORD`, and `ADMIN`.
- 🏢 **Property Management**: Complete CRUD operations for landlords to list properties with support for multiple images, location filters, sizes, and pricing.
- 📂 **Structured Categories**: Categorize properties dynamically (e.g., Apartments, Villas, Duplexes).
- 📜 **Rental Requests Flow**: Tenants request to rent properties; Landlords approve/reject requests; Status dynamically progresses to Active once paid.
- 💳 **Stripe Payment Gateway**: Integration with Stripe Checkout for handling secure rent payments.
- 🔔 **Stripe Webhooks**: Asynchronous verification of successful Stripe payments to automatically update rental statuses.
- 💬 **Reviews & Ratings**: Multi-way feedback system allowing tenants to rate and comment on properties.
- 🔍 **Advanced Query System**: API-wide pagination, case-insensitive searching, sorting, and dynamic filtering helpers.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/) with [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Payments**: [Stripe SDK](https://stripe.com/)
- **Build/Dev Tools**: [tsup](https://github.com/egoist/tsup) (bundler) & [tsx](https://github.com/privatenumber/tsx) (TypeScript execute)
- **Authentication**: JWT, `cookie-parser`, `bcryptjs`

---

## 📁 Codebase Directory Structure

```tree
RentNest-Backend/
├── .vscode/               # Editor settings (workspace TypeScript config)
├── prisma/                # Prisma ORM setup
│   ├── schema/            # Split Prisma schema files (Multi-schema layout)
│   │   ├── category.prisma
│   │   ├── enums.prisma
│   │   ├── payment.prisma
│   │   ├── property.prisma
│   │   ├── rental-request.prisma
│   │   ├── review.prisma
│   │   ├── schema.prisma
│   │   └── user.prisma
│   └── migrations/        # Database schema migration history
├── src/
│   ├── api/               # API route register point & Router mapping
│   ├── config/            # System environment config declarations
│   ├── middlewares/       # Auth check, role validations, & custom guards
│   ├── modules/           # Module-wise business logic components
│   │   ├── auth/          # Authentication handlers & services
│   │   ├── categories/    # Property category endpoints
│   │   ├── payments/      # Checkout sessions & webhook processors
│   │   ├── properties/    # Property listing services
│   │   ├── rentals/       # Rental request flows
│   │   ├── reviews/       # Review & rating systems
│   │   └── users/         # Profile management & Admin User control
│   ├── types/             # Custom TypeScript declarations
│   ├── utils/             # Helper utilities (JWT, Prisma instances, Error handlers, Stripe, validation)
│   ├── app.ts             # Express Application setup & global middleware pipeline
│   └── server.ts          # Express Server initialization
├── tsconfig.json          # TypeScript configurations
├── tsup.config.ts         # Tsup bundler configurations
└── package.json           # Scripts & Dependencies configuration
```

---

## 🛢️ Database Schema Overview

```mermaid
erDiagram
    User ||--o{ Property : "hosts"
    User ||--o{ RentalRequest : "submits"
    User ||--o{ Review : "writes"
    User ||--o{ Payment : "makes"

    Category ||--o{ Property : "defines"
    Property ||--o{ RentalRequest : "receives"
    Property ||--o{ Review : "rated_by"

    RentalRequest ||--o| Payment : "invoiced_by"
```

- **User**: Represents all platform accounts (`TENANT`, `LANDLORD`, or `ADMIN`).
- **Category**: Dynamic groupings of property types.
- **Property**: Rental assets hosted by a `LANDLORD` with location, rent details, and features.
- **RentalRequest**: Tenant application for a property. Once `APPROVED`, can proceed to checkout.
- **Payment**: Captures the Stripe payment session status (`PENDING`, `PAID`, `FAILED`) associated with a rental request.
- **Review**: Star ratings (1-5) and written feedback provided by tenants.

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)

| HTTP Method | Endpoint                  | Access        | Description                                              |
| :---------- | :------------------------ | :------------ | :------------------------------------------------------- |
| `POST`      | `/api/auth/register`      | Public        | Register a new user (`TENANT` or `LANDLORD`).            |
| `POST`      | `/api/auth/login`         | Public        | Authenticate user & issue tokens.                        |
| `POST`      | `/api/auth/refresh-token` | Public        | Generate new access token using HttpOnly refresh cookie. |
| `GET`       | `/api/auth/me`            | Authenticated | Retrieve current user profile.                           |
| `POST`      | `/api/auth/logout`        | Authenticated | Terminate session and clear cookie tokens.               |

### 👥 Users Management (`/api/users`)

| HTTP Method | Endpoint                | Access        | Description                                               |
| :---------- | :---------------------- | :------------ | :-------------------------------------------------------- |
| `PATCH`     | `/api/users/profile`    | Authenticated | Update currently logged-in user profile details.          |
| `GET`       | `/api/users`            | `ADMIN`       | Get list of all registered platform users.                |
| `GET`       | `/api/users/:id`        | `ADMIN`       | Get details of a single user.                             |
| `PATCH`     | `/api/users/:id/status` | `ADMIN`       | Lock/Block or Activate user status (`ACTIVE`, `BLOCKED`). |
| `DELETE`    | `/api/users/:id`        | `ADMIN`       | Permanently delete a user account.                        |

### 📂 Categories (`/api/categories`)

| HTTP Method | Endpoint              | Access  | Description                  |
| :---------- | :-------------------- | :------ | :--------------------------- |
| `GET`       | `/api/categories`     | Public  | List all categories.         |
| `POST`      | `/api/categories`     | `ADMIN` | Create a new category.       |
| `PATCH`     | `/api/categories/:id` | `ADMIN` | Update a category name/slug. |
| `DELETE`    | `/api/categories/:id` | `ADMIN` | Remove a category.           |

### 🏢 Properties (`/api/properties`)

| HTTP Method | Endpoint                        | Access     | Description                                                    |
| :---------- | :------------------------------ | :--------- | :------------------------------------------------------------- |
| `GET`       | `/api/properties`               | Public     | List properties with query filters, search, & sorting.         |
| `GET`       | `/api/properties/my-properties` | `LANDLORD` | Get properties listed by the logged-in landlord.               |
| `GET`       | `/api/properties/:id`           | Public     | Retrieve detailed property information.                        |
| `POST`      | `/api/properties`               | `LANDLORD` | List a new property.                                           |
| `PATCH`     | `/api/properties/:id`           | `LANDLORD` | Edit details of a listed property.                             |
| `PATCH`     | `/api/properties/:id/status`    | `LANDLORD` | Update property status (`AVAILABLE`, `RENTED`, `UNAVAILABLE`). |
| `DELETE`    | `/api/properties/:id`           | `LANDLORD` | Remove a property listing.                                     |

### 📜 Rental Requests (`/api/rentals`)

| HTTP Method | Endpoint                   | Access              | Description                                                        |
| :---------- | :------------------------- | :------------------ | :----------------------------------------------------------------- |
| `POST`      | `/api/rentals`             | `TENANT`            | Apply/Submit a rental request for a property.                      |
| `GET`       | `/api/rentals`             | `ADMIN`             | View all platform rental requests.                                 |
| `GET`       | `/api/rentals/my-requests` | `TENANT`            | View rental requests submitted by the logged-in tenant.            |
| `GET`       | `/api/rentals/incoming`    | `LANDLORD`          | View incoming rental requests on properties owned by the landlord. |
| `GET`       | `/api/rentals/:id`         | `ADMIN`, `TENANT`   | Get specific details of a rental request.                          |
| `PATCH`     | `/api/rentals/:id/status`  | `ADMIN`, `LANDLORD` | Approve or Reject a tenant's rental request.                       |

### 💬 Reviews & Ratings (`/api/reviews`)

| HTTP Method | Endpoint                            | Access            | Description                                         |
| :---------- | :---------------------------------- | :---------------- | :-------------------------------------------------- |
| `POST`      | `/api/reviews`                      | `TENANT`          | Submit rating & comments for a property.            |
| `GET`       | `/api/reviews/property/:propertyId` | Public            | Retrieve all reviews listed on a specific property. |
| `PATCH`     | `/api/reviews/:id`                  | `TENANT`          | Update a submitted review.                          |
| `DELETE`    | `/api/reviews/:id`                  | `TENANT`, `ADMIN` | Delete a review.                                    |

### 💳 Payments (`/api/payments`)

| HTTP Method | Endpoint                         | Access                        | Description                                                                  |
| :---------- | :------------------------------- | :---------------------------- | :--------------------------------------------------------------------------- |
| `POST`      | `/api/payments/checkout-session` | `TENANT`                      | Create a Stripe Checkout Session for an approved rental request.             |
| `GET`       | `/api/payments/history`          | `TENANT`                      | Retrieve billing and payment history.                                        |
| `GET`       | `/api/payments/:id`              | `ADMIN`, `TENANT`, `LANDLORD` | Retrieve Stripe checkout/payment transaction details.                        |
| `POST`      | `/api/payments/webhook`          | Public                        | Asynchronous Stripe Webhook endpoint. Updates statuses upon payment success. |

---

## 📮 Postman Collection

A comprehensive Postman collection is included in the root directory for easy testing of all the API endpoints:

- **Collection File**: [RentNest_API.postman_collection](RentNest_API.postman_collection)

### How to use:

1. **Import the collection**: Open Postman, click **Import**, and select the [RentNest_API.postman_collection](RentNest_API.postman_collection) file from the project root.
2. **Configure Variables**: In Postman, ensure you configure the following variable in the collection's **Variables** tab (or in your active environment):
    - `base_url`: Set this to the location where your API server is running (e.g., `http://localhost:5000`).

---

## 🛠️ Installation & Setup Guide

Follow these steps to configure and boot up your local development environment:

### Step 1: Clone and Install Dependencies

```bash
git clone <repository-url>
cd RentNest-Backend
npm install
```

### Step 2: Environment Variables

Create a `.env` (or `.env.local` for local overrides) file in the root directory. Populate it with the standard layout below:

```env
# System Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL Database Connection String
DATABASE_URL="postgresql://postgres:rentnest123@localhost:5432/rentnest?schema=public"

# Password Hashing Salts
BCRYPT_SALT_ROUNDS=10

# JSON Web Token Secret Keys
JWT_ACCESS_SECRET="super-secret-jwt-access-signature-token-key-2026"
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_SECRET="super-secret-jwt-refresh-signature-token-key-2026"
JWT_REFRESH_EXPIRES_IN="7d"

# Stripe API Keys (Retrieve from Stripe Dashboard)
STRIPE_SECRET_KEY="sk_test_51ToDNgBRWOHl...YourStripeSecretKey"
STRIPE_WEBHOOK_SECRET="whsec_du..............."
```

### Step 3: Run Database Migrations

Prisma will set up your database tables, relations, and indexes:

```bash
# Push schema directly to database (ideal for development)
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### Step 4: Run the Development Server

```bash
npm run dev
```

The server will boot and listen at `http://localhost:5000`.

---

## 💳 Stripe Webhook Testing (Local Development)

To receive webhooks locally from Stripe, run the Stripe CLI webhook listener:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Login to your account:
    ```bash
    stripe login
    ```
3. Forward webhook events to your local server:
    ```bash
    stripe listen --forward-to localhost:5000/api/payments/webhook
    ```
4. Copy the generated Webhook signing secret (starts with `whsec_`) and set it as the value of `STRIPE_WEBHOOK_SECRET` in your `.env` or `.env.local` file.
5. Alternatively, run the shortcut script included in `package.json`:
    ```bash
    npm run stripe:webhook
    ```

---

## 📝 Query Parameters Guide

For endpoints that support listing/searches (e.g., `GET /api/properties`), you can attach standard query helpers:

- **Pagination**: `?page=1&limit=10`
- **Sorting**: `?sortBy=rentAmount&sortOrder=asc` (or `desc`)
- **Searching**: `?search=apartment` (searches title/description/city)
- **Filtering**: Filter by fields like city, categoryId, etc., e.g., `?city=Dhaka&categoryId=some-uuid`
